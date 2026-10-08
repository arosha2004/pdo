const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditService = require('../shared/auditService');

const lessonsService = {
  getLessons: async (user) => {
    if (user.appRole === 'admin' || user.appRole === 'manager') {
      return prisma.lesson.findMany({
        include: { assignments: true, progress: true }
      });
    }

    // Employees see lessons assigned to them, their job group, or all-staff
    const assignments = await prisma.lessonAssignment.findMany({
      where: {
        OR: [
          { userId: user.id },
          { jobGroup: user.jobGroup },
          { userId: null, jobGroup: null }
        ]
      },
      include: {
        lesson: {
          include: { progress: { where: { userId: user.id } } }
        }
      }
    });

    return assignments.map(a => {
      const l = a.lesson;
      const p = l.progress.length > 0 ? l.progress[0] : null;
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        deadline: a.deadline,
        status: p ? p.status : 'not_started',
        progressData: p ? JSON.parse(p.progressData) : { slideIndex: 0 }
      };
    });
  },

  getLessonDetails: async (lessonId, user) => {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new Error('NOT_FOUND');
    
    // Parse content
    return {
      ...lesson,
      content: JSON.parse(lesson.content)
    };
  },

  updateProgress: async (lessonId, progressData, status, user) => {
    let progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } }
    });

    if (progress) {
      progress = await prisma.lessonProgress.update({
        where: { id: progress.id },
        data: {
          status,
          progressData: JSON.stringify(progressData)
        }
      });
    } else {
      progress = await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId,
          status,
          progressData: JSON.stringify(progressData)
        }
      });
    }

    if (status === 'completed') {
      await auditService.log({
        actorId: user.id,
        action: 'complete_lesson',
        entityType: 'Lesson',
        entityId: lessonId
      });
    }

    return progress;
  }
};

module.exports = lessonsService;
