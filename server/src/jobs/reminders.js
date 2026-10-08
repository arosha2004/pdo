const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../shared/emailService');
const auditService = require('../shared/auditService');

const startRemindersJob = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Check upcoming policy deadlines
      const upcomingPolicies = await prisma.policyAssignment.findMany({
        where: {
          deadline: { lte: threeDaysFromNow, gte: now },
          userId: { not: null }
        },
        include: { policyVersion: { include: { policy: true, acknowledgements: true } }, user: true }
      });

      for (const a of upcomingPolicies) {
        // Has acknowledged?
        const ack = a.policyVersion.acknowledgements.find(ak => ak.userId === a.userId);
        if (!ack) {
          const dedupeKey = `reminder:policy:${a.id}:upcoming`;
          await emailService.send({
            to: a.user.email,
            subject: `Reminder: Policy Acknowledgement Due Soon`,
            template: `Please acknowledge ${a.policyVersion.policy.title} by ${a.deadline.toLocaleDateString()}.`,
            dedupeKey
          });
          await auditService.log({ actorId: 'system', action: 'send_reminder', entityType: 'PolicyAssignment', entityId: a.id });
        }
      }

      // Check overdue policies
      const overduePolicies = await prisma.policyAssignment.findMany({
        where: {
          deadline: { lt: now },
          userId: { not: null }
        },
        include: { policyVersion: { include: { policy: true, acknowledgements: true } }, user: true }
      });

      for (const a of overduePolicies) {
        const ack = a.policyVersion.acknowledgements.find(ak => ak.userId === a.userId);
        if (!ack) {
          const dedupeKey = `reminder:policy:${a.id}:overdue`;
          await emailService.send({
            to: a.user.email,
            subject: `OVERDUE: Policy Acknowledgement`,
            template: `Your acknowledgement for ${a.policyVersion.policy.title} is overdue!`,
            dedupeKey
          });
          await auditService.log({ actorId: 'system', action: 'send_reminder', entityType: 'PolicyAssignment', entityId: a.id });
        }
      }

    } catch (err) {
      console.error('Reminders job error:', err);
    }
  });
};

module.exports = { startRemindersJob };
