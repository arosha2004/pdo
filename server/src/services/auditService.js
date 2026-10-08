const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditService = {
  log: async (actorId, action, entityType, entityId, metadata = null) => {
    return prisma.auditEvent.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
};

module.exports = auditService;
