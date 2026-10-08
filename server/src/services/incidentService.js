const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { buildScopeFilter } = require('../utils/scope');
const notificationService = require('./notificationService');
const auditService = require('./auditService');

const incidentService = {
  createIncident: async (data, user) => {
    // Basic validation
    if (new Date(data.occurrenceTime) > new Date()) {
      throw new Error('Occurrence time cannot be in the future');
    }

    const badPatterns = [
      /password/i, 
      /\b(?:\d[ -]*?){13,16}\b/ // Basic check for card numbers
    ];
    for (const pattern of badPatterns) {
      if (pattern.test(data.description)) {
        throw new Error('Description contains prohibited information (passwords or card numbers)');
      }
    }

    const incident = await prisma.incident.create({
      data: {
        category: data.category,
        occurrenceTime: new Date(data.occurrenceTime),
        description: data.description,
        reporterId: user.id,
        status: 'Open'
      }
    });

    await prisma.incidentHistory.create({
      data: {
        incidentId: incident.id,
        status: 'Open',
        actorId: user.id
      }
    });

    await auditService.log(user.id, 'CREATE_INCIDENT', 'Incident', incident.id);
    
    // Notify managers in the same branch/department
    await notificationService.notifyRoleInScope('manager', 'New Incident Reported', 'A new incident was reported', `/incidents/${incident.id}`, user.branch, user.department);

    return incident;
  },

  getIncidents: async (user, filters = {}) => {
    const scope = buildScopeFilter(user, filters);
    // When querying incidents, the scope usually applies to the reporter's branch/department or reporterId directly
    let whereClause = {};

    if (user.appRole === 'employee') {
      whereClause.reporterId = user.id;
    } else {
      // managers and admins
      whereClause.reporter = { ...scope.user };
      if (filters.status) whereClause.status = filters.status;
    }
    
    return prisma.incident.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: { id: true, name: true, branch: true, department: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getIncidentDetails: async (incidentId, user) => {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        reporter: {
          select: { id: true, name: true, branch: true, department: true }
        },
        history: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        internalNotes: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true
      }
    });

    if (!incident) throw new Error('Incident not found');

    // Access check
    if (user.appRole === 'employee' && incident.reporterId !== user.id) {
      throw new Error('Unauthorized');
    }
    if (user.appRole === 'manager') {
      if (incident.reporter.branch !== user.branch || incident.reporter.department !== user.department) {
        throw new Error('Unauthorized');
      }
    }

    // Separate serializer for employees: scrub internalNotes
    if (user.appRole === 'employee') {
      delete incident.internalNotes;
    }

    return incident;
  },

  updateStatus: async (incidentId, status, resolutionNotes, user) => {
    const allowedStatuses = ['Open', 'Under Review', 'Resolved'];
    if (!allowedStatuses.includes(status)) throw new Error('Invalid status');

    if (status === 'Resolved' && !resolutionNotes) {
      throw new Error('Resolution notes are required to resolve an incident');
    }

    const incident = await incidentService.getIncidentDetails(incidentId, user); // reusing for auth check

    if (user.appRole === 'employee') {
      throw new Error('Employees cannot update incident status');
    }

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: { status, resolutionNotes: resolutionNotes || null }
    });

    await prisma.incidentHistory.create({
      data: {
        incidentId,
        status,
        actorId: user.id
      }
    });

    await auditService.log(user.id, 'UPDATE_INCIDENT_STATUS', 'Incident', incidentId, { status });
    await notificationService.notify(incident.reporterId, 'INCIDENT_UPDATE', 'Incident Status Changed', `Status is now ${status}`, `/incidents/${incidentId}`);

    return updated;
  },

  addInternalNote: async (incidentId, note, user) => {
    if (user.appRole === 'employee') {
      throw new Error('Employees cannot add internal notes');
    }

    await incidentService.getIncidentDetails(incidentId, user); // auth check

    const created = await prisma.incidentInternalNote.create({
      data: {
        incidentId,
        authorId: user.id,
        note
      }
    });

    await auditService.log(user.id, 'ADD_INTERNAL_NOTE', 'Incident', incidentId);
    return created;
  }
};

module.exports = incidentService;
