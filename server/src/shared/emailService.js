const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emailService = {
  send: async ({ to, subject, template, data, dedupeKey = null }) => {
    // Basic template substitution
    let body = template;
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }

    const key = dedupeKey || `email_${to}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      await prisma.emailOutbox.create({
        data: {
          to,
          subject,
          body,
          status: 'pending',
          attempts: 0,
          dedupeKey: key
        }
      });
    } catch (err) {
      // If error is unique constraint on dedupeKey, it's safe to ignore (already outboxed)
      if (err.code !== 'P2002') {
        console.error('Email Service Error:', err);
      }
    }
  },
  
  sendPasswordReset: async (to, resetLink) => {
    const template = 'Please reset your password by clicking here: {{link}}';
    await emailService.send({
      to,
      subject: 'Password Reset',
      template,
      data: { link: resetLink },
      dedupeKey: `pwd_reset_${to}_${Date.now()}`
    });
  }
};

module.exports = emailService;
