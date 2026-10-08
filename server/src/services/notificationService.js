const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationService = {
  notify: async (userId, type, title, message, link = null) => {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    });
  },

  notifyRoleInScope: async (appRole, title, message, link = null, branch = null, department = null) => {
    const filters = { appRole };
    if (branch) filters.branch = branch;
    if (department) filters.department = department;

    const users = await prisma.user.findMany({ where: filters });
    
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'ROLE_NOTIFICATION',
      title,
      message,
      link
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }
  }
};

module.exports = notificationService;
