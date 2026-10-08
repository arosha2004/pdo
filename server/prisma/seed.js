const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.user.deleteMany({});
  await prisma.policy.deleteMany({});
  await prisma.lesson.deleteMany({});

  // Users
  const usersToCreate = [
    { email: 'admin@acme.com', name: 'Alice Admin', password: 'password', appRole: 'admin', jobGroup: 'it' },
    { email: 'manager1@acme.com', name: 'Bob Manager', password: 'password', appRole: 'manager', jobGroup: 'sales' },
    { email: 'manager2@acme.com', name: 'Charlie Manager', password: 'password', appRole: 'manager', jobGroup: 'support' },
    { email: 'emp1@acme.com', name: 'Dave Employee', password: 'password', appRole: 'employee', jobGroup: 'cashier' },
    { email: 'emp2@acme.com', name: 'Eve Employee', password: 'password', appRole: 'employee', jobGroup: 'support' },
    { email: 'emp3@acme.com', name: 'Frank Employee', password: 'password', appRole: 'employee', jobGroup: 'developer' },
    { email: 'emp4@acme.com', name: 'Grace Employee', password: 'password', appRole: 'employee', jobGroup: 'hr' },
    { email: 'emp5@acme.com', name: 'Heidi Employee', password: 'password', appRole: 'employee', jobGroup: 'sales' }
  ];

  let adminUser = null;
  for (const u of usersToCreate) {
    const created = await prisma.user.create({ data: u });
    if (u.appRole === 'admin') adminUser = created;
  }

  // AUP Policy
  const aupPolicy = await prisma.policy.create({
    data: {
      title: 'Acceptable Use Policy (AUP)',
      category: 'AUP',
      versions: {
        create: {
          versionNumber: 1,
          status: 'published',
          content: 'This is the Acceptable Use Policy. 1. Do not share passwords. 2. Use company devices for work only.',
          effectiveDate: new Date(),
          publishedAt: new Date(),
          createdBy: adminUser.id
        }
      }
    },
    include: { versions: true }
  });

  // Assign AUP to all users
  const users = await prisma.user.findMany();
  for (const u of users) {
    await prisma.policyAssignment.create({
      data: {
        policyVersionId: aupPolicy.versions[0].id,
        userId: u.id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Lessons
  const lessonsData = [
    { title: 'Password Security', description: 'Best practices for passwords', content: JSON.stringify([{ type: 'text', content: 'Use strong passwords.' }]) },
    { title: 'Phishing Awareness', description: 'How to spot phishing emails', content: JSON.stringify([{ type: 'text', content: 'Check sender email.' }]) },
    { title: 'Handling Customer Info', description: 'PCI compliance and privacy', content: JSON.stringify([{ type: 'text', content: 'Never store CC details in plain text.' }]) },
    { title: 'Shared Devices', description: 'Lock your screen', content: JSON.stringify([{ type: 'text', content: 'Always lock screen when away.' }]) },
    { title: 'Incident Reporting', description: 'What to do during a breach', content: JSON.stringify([{ type: 'text', content: 'Contact IT immediately.' }]) }
  ];

  for (const l of lessonsData) {
    await prisma.lesson.create({ data: l });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
