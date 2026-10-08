const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditService = require('../shared/auditService');
const notificationService = require('../shared/notificationService');

const policiesService = {
  getLibrary: async (user) => {
    if (user.appRole === 'admin' || user.appRole === 'manager') {
      return prisma.policy.findMany({
        include: { versions: { orderBy: { versionNumber: 'desc' } } }
      });
    }

    // Employee sees policies assigned to them or their jobGroup (or all-staff, which might mean no userId/jobGroup, but we explicitly assigned them in seed)
    const assignments = await prisma.policyAssignment.findMany({
      where: {
        OR: [
          { userId: user.id },
          { jobGroup: user.jobGroup },
          { userId: null, jobGroup: null } // all-staff
        ]
      },
      include: {
        policyVersion: {
          include: { policy: true, acknowledgements: { where: { userId: user.id } } }
        }
      }
    });

    return assignments.map(a => {
      const p = a.policyVersion.policy;
      const v = a.policyVersion;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        versionId: v.id,
        versionNumber: v.versionNumber,
        status: v.status,
        deadline: a.deadline,
        acknowledged: v.acknowledgements.length > 0 ? v.acknowledgements[0].acknowledgedAt : null
      };
    });
  },

  getPolicyDetails: async (policyId, user) => {
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { versions: { orderBy: { versionNumber: 'desc' } } }
    });
    // Add auth checks if needed
    return policy;
  },

  createDraft: async ({ title, category, content, effectiveDate, reviewDate }, user) => {
    const policy = await prisma.policy.create({
      data: {
        title,
        category,
        versions: {
          create: {
            versionNumber: 1,
            status: 'draft',
            content,
            effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
            reviewDate: reviewDate ? new Date(reviewDate) : null,
            createdBy: user.id
          }
        }
      },
      include: { versions: true }
    });
    return policy;
  },

  editVersion: async (versionId, data, user) => {
    const version = await prisma.policyVersion.findUnique({
      where: { id: versionId },
      include: { policy: true }
    });

    if (!version) throw new Error('NOT_FOUND');
    
    if (version.status === 'published') {
      // Create new draft version instead
      const newVersionNumber = version.versionNumber + 1;
      const newVersion = await prisma.policyVersion.create({
        data: {
          policyId: version.policyId,
          versionNumber: newVersionNumber,
          status: 'draft',
          content: data.content || version.content,
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : version.effectiveDate,
          reviewDate: data.reviewDate ? new Date(data.reviewDate) : version.reviewDate,
          createdBy: user.id
        }
      });
      return newVersion;
    }

    // Update existing draft
    return prisma.policyVersion.update({
      where: { id: versionId },
      data: {
        content: data.content,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined
      }
    });
  },

  publishAndAssign: async (versionId, assignments, user) => {
    const version = await prisma.policyVersion.findUnique({ where: { id: versionId }, include: { policy: true } });
    if (!version || version.status !== 'draft') throw new Error('INVALID_STATE');

    return await prisma.$transaction(async (tx) => {
      const published = await tx.policyVersion.update({
        where: { id: versionId },
        data: { status: 'published', publishedAt: new Date() }
      });

      const createData = assignments.map(a => ({
        policyVersionId: versionId,
        userId: a.userId,
        jobGroup: a.jobGroup,
        deadline: a.deadline ? new Date(a.deadline) : null
      }));

      if (createData.length > 0) {
        await tx.policyAssignment.createMany({ data: createData });
      }

      await auditService.log({
        actorId: user.id,
        action: 'publish_policy',
        entityType: 'PolicyVersion',
        entityId: versionId
      });

      // Notify assigned users (assuming assignments have userId for simplicity in this mockup)
      for (const a of assignments) {
        if (a.userId) {
          await notificationService.notify({
            userId: a.userId,
            type: 'policy_assigned',
            title: 'New Policy Assigned',
            message: `You have a new policy to review: ${version.policy.title}`,
            link: `/policies/${versionId}`
          });
        }
      }

      return published;
    });
  },

  archive: async (versionId, user) => {
    const archived = await prisma.policyVersion.update({
      where: { id: versionId },
      data: { status: 'archived' }
    });

    await auditService.log({
      actorId: user.id,
      action: 'archive_policy',
      entityType: 'PolicyVersion',
      entityId: versionId
    });

    return archived;
  },

  acknowledge: async (versionId, user) => {
    try {
      const ack = await prisma.policyAcknowledgement.create({
        data: {
          userId: user.id,
          policyVersionId: versionId
        }
      });

      await auditService.log({
        actorId: user.id,
        action: 'acknowledge_policy',
        entityType: 'PolicyVersion',
        entityId: versionId
      });

      return ack;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new Error('ALREADY_ACKNOWLEDGED'); // 409 Conflict
      }
      throw err;
    }
  },

  getAUP: async () => {
    const policy = await prisma.policy.findFirst({
      where: { category: 'AUP' },
      include: {
        versions: {
          where: { status: 'published' },
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
    if (!policy || policy.versions.length === 0) return null;
    return policy.versions[0];
  }
};

module.exports = policiesService;
