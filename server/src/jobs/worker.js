const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// For dev, use Ethereal or console
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'windows'
});

const startEmailWorker = () => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const pending = await prisma.emailOutbox.findMany({
        where: {
          status: 'pending',
          attempts: { lt: 3 },
          OR: [
            { nextAttemptAt: null },
            { nextAttemptAt: { lte: new Date() } }
          ]
        },
        take: 20
      });

      for (const email of pending) {
        try {
          await transporter.sendMail({
            from: '"SecuGuard" <noreply@secuguard.com>',
            to: email.to,
            subject: email.subject,
            text: email.body
          });

          await prisma.emailOutbox.update({
            where: { id: email.id },
            data: { status: 'sent', attempts: email.attempts + 1, updatedAt: new Date() }
          });
        } catch (err) {
          const attempts = email.attempts + 1;
          await prisma.emailOutbox.update({
            where: { id: email.id },
            data: {
              status: attempts >= 3 ? 'failed' : 'pending',
              attempts,
              nextAttemptAt: new Date(Date.now() + attempts * 5 * 60000), // Backoff
              updatedAt: new Date()
            }
          });
        }
      }
    } catch (err) {
      console.error('Email worker error:', err);
    }
  });
};

module.exports = { startEmailWorker };
