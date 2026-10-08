const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditService = {
  log: async ({ actorId, action, entityType, entityId, metadata = {} }) => {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId,
          action,
          entityType,
          entityId: String(entityId),
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (err) {
      console.error('Audit Log Error:', err);
    }
  }
};

module.exports = auditService;
