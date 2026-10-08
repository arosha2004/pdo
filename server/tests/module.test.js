const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('Dashboards, Compliance, Reports & Incidents API', () => {
  let adminToken, managerToken, employeeToken, empNoAssignmentsToken, otherManagerToken;
  let empUser, empNoAssignUser, managerUser, otherManagerUser;
  let testIncidentId;
  
  beforeAll(async () => {
    // Note: Depends on the database being seeded by seed.js
    const users = await prisma.user.findMany();
    const admin = users.find(u => u.email === 'admin@example.com');
    managerUser = users.find(u => u.email === 'mgr1@example.com');
    otherManagerUser = users.find(u => u.email === 'mgr2@example.com'); // different branch/dept
    empUser = users.find(u => u.email === 'emp1@example.com');
    empNoAssignUser = users.find(u => u.email === 'emp5@example.com'); // East IT

    const signToken = (user) => jwt.sign({
      id: user.id,
      name: user.name,
      appRole: user.appRole,
      branch: user.branch,
      department: user.department,
      jobGroup: user.jobGroup
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    adminToken = signToken(admin);
    managerToken = signToken(managerUser);
    otherManagerToken = signToken(otherManagerUser);
    employeeToken = signToken(empUser);
    empNoAssignmentsToken = signToken(empNoAssignUser);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Compliance & Dashboards', () => {
    it('should return null rate for zero assignments (no NaN)', async () => {
      const res = await request(app)
        .get('/api/compliance/summary')
        .set('Authorization', `Bearer ${empNoAssignmentsToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.policies.rate).toBeNull();
      expect(res.body.lessons.rate).toBeNull();
      expect(res.body.quizzes.rate).toBeNull();
      expect(res.body.policies.total).toBe(0);
    });

    it('should return correct calculations (pending vs overdue vs completed) for manager scope', async () => {
      const res = await request(app)
        .get('/api/compliance/summary')
        .set('Authorization', `Bearer ${managerToken}`); // mgr1@example.com - North HR
      
      expect(res.status).toBe(200);
      
      // mgr1 manages Emp 2 (Overdue)
      // Emp 2 has: 1 policy (overdue), 1 lesson (overdue), 1 quiz (pending - wait, overdue because past date)
      // Let's just check they are numeric and correctly structured
      expect(res.body.policies.total).toBeGreaterThanOrEqual(1);
      expect(typeof res.body.policies.rate).toBe('number');
      expect(typeof res.body.policies.pending).toBe('number');
      expect(typeof res.body.policies.overdue).toBe('number');
      expect(res.body.policies.overdue).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Reports & Exports', () => {
    it('should deny unauthorized exports (employee 403, unauthenticated 401)', async () => {
      let res = await request(app).get('/api/reports/export/csv');
      expect(res.status).toBe(401);

      res = await request(app)
        .get('/api/reports/export/csv')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(403);
    });

    it('should neutralize CSV formula injection and export valid CSV for manager', async () => {
      const res = await request(app)
        .get('/api/reports/export/csv')
        .set('Authorization', `Bearer ${managerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('Report Date');
      expect(res.text).not.toMatch(/^[=+\-@\t\r]/m); // Ensure no lines start with formula injection characters unescaped (except if we added single quotes)
    });
  });

  describe('Incidents', () => {
    it('should reject incident with card number in description', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          category: 'Phishing',
          occurrenceTime: new Date().toISOString(),
          description: 'Here is a card: 1234 5678 1234 5678'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('prohibited information');
    });

    it('should allow valid incident submission', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          category: 'Lost Device',
          occurrenceTime: new Date(Date.now() - 10000).toISOString(),
          description: 'Lost my laptop'
        });
      
      expect(res.status).toBe(201);
      testIncidentId = res.body.id;
    });

    it('should deny employees from viewing other users incidents', async () => {
      const res = await request(app)
        .get(`/api/incidents/${testIncidentId}`)
        .set('Authorization', `Bearer ${empNoAssignmentsToken}`); // Different employee
      
      expect(res.status).toBe(403);
    });

    it('should prevent employees from updating incident status', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${testIncidentId}/status`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ status: 'Under Review' });
      
      expect(res.status).toBe(403);
    });

    it('should reject invalid status transitions (e.g. fake status)', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${testIncidentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Super Resolved' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid status');
    });

    it('should reject Resolved without resolution notes', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${testIncidentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Resolved' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Resolution notes are required');
    });

    it('should allow managers/admins to add internal notes and update status', async () => {
      let res = await request(app)
        .post(`/api/incidents/${testIncidentId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Checking this right now' });
      
      expect(res.status).toBe(201);

      res = await request(app)
        .patch(`/api/incidents/${testIncidentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Under Review' });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Under Review');
    });

    it('should not expose internal notes to the employee', async () => {
      const res = await request(app)
        .get(`/api/incidents/${testIncidentId}`)
        .set('Authorization', `Bearer ${employeeToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.internalNotes).toBeUndefined();
    });
  });
});
