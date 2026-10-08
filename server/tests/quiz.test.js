const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

let employeeToken, employeeUser, managerToken, managerUser, quizVersionId, q1Id;

beforeAll(async () => {
  await prisma.quizAttempt.deleteMany();
  await prisma.quizAssignment.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quizVersion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();

  employeeUser = await prisma.user.create({ data: { email: 'q_emp@test.com', name: 'Emp', password: 'pass', appRole: 'employee', jobGroup: 'it' } });
  employeeToken = jwt.sign({ id: employeeUser.id }, 'secret');
  managerUser = await prisma.user.create({ data: { email: 'q_mgr@test.com', name: 'Mgr', password: 'pass', appRole: 'manager', jobGroup: 'it' } });
  managerToken = jwt.sign({ id: managerUser.id }, 'secret');
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Quizzes API', () => {
  it('manager can author and publish quiz', async () => {
    const draftRes = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Security Quiz',
        passThreshold: 100,
        attemptLimit: 2,
        questions: [
          {
            text: 'What is 1+1?',
            options: [
              { text: '2', isCorrect: true },
              { text: '3', isCorrect: false }
            ]
          }
        ]
      });
    expect(draftRes.status).toBe(201);
    const quizId = draftRes.body.id;
    
    // Have to fetch version to get id for publishing
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { versions: { include: { questions: { include: { options: true } } } } } });
    quizVersionId = quiz.versions[0].id;
    q1Id = quiz.versions[0].questions[0].id;

    const pubRes = await request(app)
      .post(`/api/quizzes/${quizId}/versions/${quizVersionId}/publish`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ assignments: [{ userId: employeeUser.id }] });
    expect(pubRes.status).toBe(200);
  });

  it('employee gets quiz but no answer keys', async () => {
    const res = await request(app)
      .get('/api/quizzes')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    const options = res.body[0].questions[0].options;
    expect(options[0].isCorrect).toBeUndefined();
  });

  it('score tampering ignored, fails if wrong', async () => {
    // Send fake score in body (it should be ignored by service, which only reads 'answers')
    const wrongOptionId = (await prisma.option.findFirst({ where: { isCorrect: false } })).id;
    
    const res = await request(app)
      .post(`/api/quizzes/versions/${quizVersionId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ answers: { [q1Id]: wrongOptionId }, score: 100 });
    
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.score).toBe(0); // The fake 100 is ignored
  });

  it('attempts exhausted marks needs_manager_followup', async () => {
    const wrongOptionId = (await prisma.option.findFirst({ where: { isCorrect: false } })).id;
    
    const res2 = await request(app)
      .post(`/api/quizzes/versions/${quizVersionId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ answers: { [q1Id]: wrongOptionId } });
    
    expect(res2.status).toBe(200);
    expect(res2.body.status).toBe('needs_manager_followup');

    // Next attempt fails with 403
    const res3 = await request(app)
      .post(`/api/quizzes/versions/${quizVersionId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ answers: { [q1Id]: wrongOptionId } });
    expect(res3.status).toBe(403);
  });
});
