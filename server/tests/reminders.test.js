const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../src/shared/emailService');

beforeAll(async () => {
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policyAssignment.deleteMany();
  await prisma.policyVersion.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.user.deleteMany();
  await prisma.emailOutbox.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Reminders Job & Email Outbox', () => {
  it('email outbox deduplication prevents sending multiple times', async () => {
    // Call 1
    await emailService.send({ to: 'test@acme.com', subject: 'Sub', template: 'Body', dedupeKey: 'uniq123' });
    
    // Call 2 (should be ignored due to unique constraint handled in service)
    await emailService.send({ to: 'test@acme.com', subject: 'Sub', template: 'Body', dedupeKey: 'uniq123' });
    
    const count = await prisma.emailOutbox.count({ where: { dedupeKey: 'uniq123' } });
    expect(count).toBe(1);
  });
});
