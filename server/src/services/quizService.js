const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditService = require('../shared/auditService');

const quizService = {
  createDraft: async (data, user) => {
    return prisma.quiz.create({
      data: {
        title: data.title,
        passThreshold: data.passThreshold || 80,
        attemptLimit: data.attemptLimit || 3,
        versions: {
          create: {
            versionNumber: 1,
            status: 'draft',
            questions: {
              create: data.questions.map(q => ({
                text: q.text,
                options: {
                  create: q.options.map(o => ({
                    text: o.text,
                    isCorrect: o.isCorrect
                  }))
                }
              }))
            }
          }
        }
      }
    });
  },

  publishAndAssign: async (quizId, versionId, assignments, user) => {
    const published = await prisma.quizVersion.update({
      where: { id: versionId },
      data: { status: 'published', publishedAt: new Date() }
    });

    if (assignments && assignments.length > 0) {
      await prisma.quizAssignment.createMany({
        data: assignments.map(a => ({
          quizVersionId: versionId,
          userId: a.userId,
          jobGroup: a.jobGroup,
          deadline: a.deadline ? new Date(a.deadline) : null,
          status: 'pending'
        }))
      });
    }

    await auditService.log({
      actorId: user.id,
      action: 'publish_quiz',
      entityType: 'QuizVersion',
      entityId: versionId
    });

    return published;
  },

  getQuizzesForUser: async (user) => {
    const assignments = await prisma.quizAssignment.findMany({
      where: {
        OR: [
          { userId: user.id },
          { jobGroup: user.jobGroup }
        ]
      },
      include: {
        quizVersion: {
          include: { 
            quiz: true, 
            questions: { include: { options: true } } // include options but filter them later
          }
        }
      }
    });

    // Strip out answer keys before returning to client
    return assignments.map(a => {
      const qv = a.quizVersion;
      return {
        assignmentId: a.id,
        quizId: qv.quiz.id,
        versionId: qv.id,
        title: qv.quiz.title,
        status: a.status,
        deadline: a.deadline,
        passThreshold: qv.quiz.passThreshold,
        attemptLimit: qv.quiz.attemptLimit,
        questions: qv.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options.map(o => ({ id: o.id, text: o.text })) // omit isCorrect
        }))
      };
    });
  },

  submitAttempt: async (versionId, answers, user) => {
    // 1. Validate assignment
    const assignment = await prisma.quizAssignment.findFirst({
      where: {
        quizVersionId: versionId,
        OR: [
          { userId: user.id },
          { jobGroup: user.jobGroup }
        ]
      }
    });

    if (!assignment) throw new Error('NOT_ASSIGNED');
    if (assignment.status === 'passed') throw new Error('ALREADY_PASSED');
    if (assignment.status === 'needs_manager_followup') throw new Error('ATTEMPTS_EXHAUSTED');

    // 2. Fetch Quiz Version with answers
    const quizVersion = await prisma.quizVersion.findUnique({
      where: { id: versionId },
      include: {
        quiz: true,
        questions: { include: { options: true } }
      }
    });

    if (quizVersion.status !== 'published') throw new Error('QUIZ_NOT_PUBLISHED');

    // 3. Count past attempts
    const pastAttempts = await prisma.quizAttempt.count({
      where: { quizVersionId: versionId, userId: user.id }
    });

    if (pastAttempts >= quizVersion.quiz.attemptLimit) {
      throw new Error('ATTEMPTS_EXHAUSTED');
    }

    // 4. Grade
    let correctCount = 0;
    const totalQuestions = quizVersion.questions.length;

    for (const q of quizVersion.questions) {
      const correctOption = q.options.find(o => o.isCorrect);
      const userAnswerId = answers[q.id]; // Object map of { questionId: optionId }
      if (correctOption && userAnswerId === correctOption.id) {
        correctCount++;
      }
    }

    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= quizVersion.quiz.passThreshold;

    // 5. Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizVersionId: versionId,
        userId: user.id,
        score,
        passed,
        answers: JSON.stringify(answers)
      }
    });

    await auditService.log({
      actorId: user.id,
      action: passed ? 'quiz_passed' : 'quiz_failed',
      entityType: 'QuizAttempt',
      entityId: attempt.id,
      metadata: { score, attemptNumber: pastAttempts + 1 }
    });

    // 6. Update assignment status
    let newStatus = passed ? 'passed' : 'failed';
    const totalAttemptsNow = pastAttempts + 1;
    
    if (!passed && totalAttemptsNow >= quizVersion.quiz.attemptLimit) {
      newStatus = 'needs_manager_followup';
      await auditService.log({
        actorId: user.id,
        action: 'quiz_followup_flagged',
        entityType: 'QuizAssignment',
        entityId: assignment.id
      });
      // A background job could send a notification to manager here.
    }

    await prisma.quizAssignment.update({
      where: { id: assignment.id },
      data: { status: newStatus }
    });

    return {
      score,
      passed,
      remainingAttempts: Math.max(0, quizVersion.quiz.attemptLimit - totalAttemptsNow),
      status: newStatus
    };
  }
};

module.exports = quizService;
