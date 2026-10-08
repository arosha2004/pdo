const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { buildScopeFilter } = require('../utils/scope');

const complianceService = {
  getSummary: async (user, filters = {}) => {
    const scope = buildScopeFilter(user, filters);
    
    // For calculating stats, we fetch the assignments matching the scope.
    // If scope has 'user', we can directly filter assignments.
    const assignmentWhere = { ...scope };
    
    // We also might have date range filters on deadlines
    if (filters.startDate || filters.endDate) {
      assignmentWhere.deadline = {};
      if (filters.startDate) assignmentWhere.deadline.gte = new Date(filters.startDate);
      if (filters.endDate) assignmentWhere.deadline.lte = new Date(filters.endDate);
    }

    const now = new Date();

    const calculateStats = (assignments, isCompleted) => {
      const total = assignments.length;
      if (total === 0) {
        return { total: 0, completed: 0, pending: 0, overdue: 0, rate: null };
      }

      let completed = 0;
      let pending = 0;
      let overdue = 0;

      for (const assignment of assignments) {
        if (isCompleted(assignment)) {
          completed++;
        } else {
          if (assignment.deadline && new Date(assignment.deadline) < now) {
            overdue++;
          } else {
            pending++;
          }
        }
      }

      const rate = total > 0 ? Math.round((completed / total) * 100) : null;
      return { total, completed, pending, overdue, rate };
    };

    // Policies
    const policyAssignments = await prisma.policyAssignment.findMany({
      where: assignmentWhere,
      include: {
        user: {
          include: {
            policyAcknowledgements: true
          }
        }
      }
    });

    const policyStats = calculateStats(policyAssignments, (a) => {
      return a.user.policyAcknowledgements.some(ack => ack.policyVersionId === a.policyVersionId);
    });

    // Lessons (Training)
    const lessonAssignments = await prisma.lessonAssignment.findMany({
      where: assignmentWhere,
      include: {
        user: {
          include: {
            lessonProgress: true
          }
        }
      }
    });

    const lessonStats = calculateStats(lessonAssignments, (a) => {
      return a.user.lessonProgress.some(p => p.lessonId === a.lessonId && p.status === 'completed');
    });

    // Quizzes
    const quizAssignments = await prisma.quizAssignment.findMany({
      where: assignmentWhere
    });

    // Quiz assignment itself tracks status "passed" / "failed" / "pending"
    const quizStats = calculateStats(quizAssignments, (a) => {
      return a.status === 'passed';
    });

    // Incidents
    const incidentWhere = {};
    if (assignmentWhere.userId) incidentWhere.reporterId = assignmentWhere.userId;
    if (assignmentWhere.user) incidentWhere.reporter = assignmentWhere.user;

    const incidents = await prisma.incident.findMany({
      where: incidentWhere
    });
    const openIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;

    return {
      policies: policyStats,
      lessons: lessonStats,
      quizzes: quizStats,
      incidents: { open: openIncidents }
    };
  }
};

module.exports = complianceService;
