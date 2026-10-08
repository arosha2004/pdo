const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

let employeeToken, employeeUser, lesson;

beforeAll(async () => {
  await prisma.lessonProgress.deleteMany();
  await prisma.lessonAssignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.user.deleteMany();

  employeeUser = await prisma.user.create({ data: { email: 'trn_emp@test.com', name: 'Emp', password: 'pass', appRole: 'employee', jobGroup: 'it' } });
  employeeToken = jwt.sign({ id: employeeUser.id }, 'secret');

  lesson = await prisma.lesson.create({
    data: {
      title: 'Test Lesson',
      description: 'Desc',
      content: JSON.stringify([{ type: 'text', content: 'Slide 1' }, { type: 'text', content: 'Slide 2' }])
    }
  });

  await prisma.lessonAssignment.create({
    data: { lessonId: lesson.id, userId: employeeUser.id }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Training & Lessons API', () => {
  it('employee can get assigned lessons', async () => {
    const res = await request(app)
      .get('/api/lessons')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(lesson.id);
    expect(res.body[0].status).toBe('not_started');
  });

  it('progress saved successfully', async () => {
    const res = await request(app)
      .put(`/api/lessons/${lesson.id}/progress`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ progressData: { slideIndex: 1 }, status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('finishing lesson creates audit event', async () => {
    await prisma.auditEvent.deleteMany();
    const res = await request(app)
      .put(`/api/lessons/${lesson.id}/progress`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ progressData: { slideIndex: 1 }, status: 'completed' });
    expect(res.status).toBe(200);

    const auditEvents = await prisma.auditEvent.findMany();
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0].action).toBe('complete_lesson');
  });
});
