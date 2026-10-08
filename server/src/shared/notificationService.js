const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationService = {
  notify: async ({ userId, type, title, message, link = null }) => {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link
        }
      });
    } catch (err) {
      console.error('Notification Error:', err);
    }
  }
};

module.exports = notificationService;
