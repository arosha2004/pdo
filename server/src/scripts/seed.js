const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  console.log('Clearing database...');
  await prisma.incidentAttachment.deleteMany();
  await prisma.incidentInternalNote.deleteMany();
  await prisma.incidentHistory.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizAssignment.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quizVersion.deleteMany();
  await prisma.quiz.deleteMany();
  
  await prisma.lessonProgress.deleteMany();
  await prisma.lessonAssignment.deleteMany();
  await prisma.lesson.deleteMany();

  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policyAssignment.deleteMany();
  await prisma.policyVersion.deleteMany();
  await prisma.policy.deleteMany();

  await prisma.notification.deleteMany();
  await prisma.emailOutbox.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding branches, departments, and users...');
  
  const users = [
    { name: 'Admin User', email: 'admin@example.com', appRole: 'admin', branch: 'North', department: 'IT', jobGroup: 'developer', password: 'password123' },
    { name: 'Manager North HR', email: 'mgr1@example.com', appRole: 'manager', branch: 'North', department: 'HR', jobGroup: 'hr', password: 'password123' },
    { name: 'Manager South Sales', email: 'mgr2@example.com', appRole: 'manager', branch: 'South', department: 'Sales', jobGroup: 'support', password: 'password123' },
    // Group with assignments
    { name: 'Emp 1 (Completed)', email: 'emp1@example.com', appRole: 'employee', branch: 'North', department: 'IT', jobGroup: 'developer', password: 'password123' },
    { name: 'Emp 2 (Overdue)', email: 'emp2@example.com', appRole: 'employee', branch: 'North', department: 'HR', jobGroup: 'hr', password: 'password123' },
    { name: 'Emp 3 (Pending)', email: 'emp3@example.com', appRole: 'employee', branch: 'South', department: 'Sales', jobGroup: 'support', password: 'password123' },
    { name: 'Emp 4 (Mixed)', email: 'emp4@example.com', appRole: 'employee', branch: 'South', department: 'Sales', jobGroup: 'cashier', password: 'password123' },
    // Group with ZERO assignments
    { name: 'Emp 5 (No assignments)', email: 'emp5@example.com', appRole: 'employee', branch: 'East', department: 'IT', jobGroup: 'support', password: 'password123' },
    { name: 'Emp 6 (No assignments)', email: 'emp6@example.com', appRole: 'employee', branch: 'East', department: 'Sales', jobGroup: 'cashier', password: 'password123' },
    { name: 'Emp 7 (No assignments)', email: 'emp7@example.com', appRole: 'employee', branch: 'East', department: 'HR', jobGroup: 'hr', password: 'password123' },
  ];

  const createdUsers = [];
  for (const u of users) {
    createdUsers.push(await prisma.user.create({ data: u }));
  }

  const findUser = (email) => createdUsers.find(u => u.email === email);

  console.log('Seeding content (Policy, Lesson, Quiz)...');
  
  const policy = await prisma.policy.create({
    data: {
      title: 'Data Protection Policy',
      category: 'Security',
      versions: {
        create: {
          versionNumber: 1,
          status: 'published',
          content: 'Keep data safe.',
          publishedAt: new Date(),
          createdBy: findUser('admin@example.com').id
        }
      }
    },
    include: { versions: true }
  });
  const policyVersionId = policy.versions[0].id;

  const lesson = await prisma.lesson.create({
    data: {
      title: 'Phishing Awareness',
      description: 'How to spot a phish',
      content: JSON.stringify([{ slide: 1, text: 'Dont click bad links' }])
    }
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: 'Phishing Quiz',
      passThreshold: 80,
      attemptLimit: 3,
      versions: {
        create: {
          versionNumber: 1,
          status: 'published',
          publishedAt: new Date(),
          questions: {
            create: [
              {
                text: 'Is this bad?',
                options: {
                  create: [
                    { text: 'Yes', isCorrect: true },
                    { text: 'No', isCorrect: false }
                  ]
                }
              }
            ]
          }
        }
      }
    },
    include: { versions: true }
  });
  const quizVersionId = quiz.versions[0].id;

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  console.log('Seeding assignments...');
  
  // Completed
  await prisma.policyAssignment.create({ data: { policyVersionId, userId: findUser('emp1@example.com').id, deadline: futureDate } });
  await prisma.policyAcknowledgement.create({ data: { policyVersionId, userId: findUser('emp1@example.com').id } });
  
  await prisma.lessonAssignment.create({ data: { lessonId: lesson.id, userId: findUser('emp1@example.com').id, deadline: futureDate } });
  await prisma.lessonProgress.create({ data: { lessonId: lesson.id, userId: findUser('emp1@example.com').id, status: 'completed', progressData: '{}' } });
  
  await prisma.quizAssignment.create({ data: { quizVersionId, userId: findUser('emp1@example.com').id, deadline: futureDate, status: 'passed' } });
  await prisma.quizAttempt.create({ data: { quizVersionId, userId: findUser('emp1@example.com').id, score: 100, passed: true, answers: '{}' } });

  // Overdue (Pending but past deadline)
  await prisma.policyAssignment.create({ data: { policyVersionId, userId: findUser('emp2@example.com').id, deadline: pastDate } });
  await prisma.lessonAssignment.create({ data: { lessonId: lesson.id, userId: findUser('emp2@example.com').id, deadline: pastDate } });
  await prisma.quizAssignment.create({ data: { quizVersionId, userId: findUser('emp2@example.com').id, deadline: pastDate, status: 'pending' } });

  // Pending (Future deadline)
  await prisma.policyAssignment.create({ data: { policyVersionId, userId: findUser('emp3@example.com').id, deadline: futureDate } });
  await prisma.lessonAssignment.create({ data: { lessonId: lesson.id, userId: findUser('emp3@example.com').id, deadline: futureDate } });
  await prisma.quizAssignment.create({ data: { quizVersionId, userId: findUser('emp3@example.com').id, deadline: futureDate, status: 'pending' } });
  
  // Mixed (some completed, some overdue, some pending)
  await prisma.policyAssignment.create({ data: { policyVersionId, userId: findUser('emp4@example.com').id, deadline: pastDate } }); // Overdue
  await prisma.lessonAssignment.create({ data: { lessonId: lesson.id, userId: findUser('emp4@example.com').id, deadline: futureDate } });
  await prisma.lessonProgress.create({ data: { lessonId: lesson.id, userId: findUser('emp4@example.com').id, status: 'completed', progressData: '{}' } }); // Completed
  await prisma.quizAssignment.create({ data: { quizVersionId, userId: findUser('emp4@example.com').id, deadline: futureDate, status: 'pending' } }); // Pending
  
  // Incidents
  console.log('Seeding incidents...');
  const inc1 = await prisma.incident.create({
    data: {
      category: 'Phishing',
      occurrenceTime: new Date(),
      description: 'Received a weird email',
      status: 'Open',
      reporterId: findUser('emp1@example.com').id
    }
  });
  
  await prisma.incidentHistory.create({
    data: { incidentId: inc1.id, status: 'Open', actorId: findUser('emp1@example.com').id }
  });

  const inc2 = await prisma.incident.create({
    data: {
      category: 'Lost Device',
      occurrenceTime: new Date(),
      description: 'Lost my phone',
      status: 'Under Review',
      reporterId: findUser('emp2@example.com').id
    }
  });

  await prisma.incidentHistory.create({
    data: { incidentId: inc2.id, status: 'Open', actorId: findUser('emp2@example.com').id }
  });
  await prisma.incidentHistory.create({
    data: { incidentId: inc2.id, status: 'Under Review', actorId: findUser('admin@example.com').id }
  });
  await prisma.incidentInternalNote.create({
    data: { incidentId: inc2.id, authorId: findUser('admin@example.com').id, note: 'Looking into this immediately.' }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
