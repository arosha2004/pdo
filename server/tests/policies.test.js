const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

let adminToken, employeeToken, managerToken;
let adminUser, employeeUser, managerUser;
let assignedPolicy, unassignedPolicy;

beforeAll(async () => {
  // Clear db
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policyAssignment.deleteMany();
  await prisma.policyVersion.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  adminUser = await prisma.user.create({ data: { email: 'test_admin@test.com', name: 'Admin', password: 'pass', appRole: 'admin', jobGroup: 'it' } });
  employeeUser = await prisma.user.create({ data: { email: 'test_emp@test.com', name: 'Emp', password: 'pass', appRole: 'employee', jobGroup: 'sales' } });
  managerUser = await prisma.user.create({ data: { email: 'test_mgr@test.com', name: 'Mgr', password: 'pass', appRole: 'manager', jobGroup: 'sales' } });

  adminToken = jwt.sign({ id: adminUser.id }, 'secret');
  employeeToken = jwt.sign({ id: employeeUser.id }, 'secret');
  managerToken = jwt.sign({ id: managerUser.id }, 'secret');

  // Create test policies
  unassignedPolicy = await prisma.policy.create({
    data: {
      title: 'Unassigned Policy',
      category: 'General',
      versions: {
        create: { versionNumber: 1, status: 'published', content: 'Secret content', createdBy: adminUser.id }
      }
    },
    include: { versions: true }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Policies API', () => {
  let draftVersionId;

  it('employee denied from creating policy (403)', async () => {
    const res = await request(app)
      .post('/api/policies')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ title: 'New', category: 'General', content: 'Content' });
    expect(res.status).toBe(403);
  });

  it('manager can create draft', async () => {
    const res = await request(app)
      .post('/api/policies')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Manager Policy', category: 'HR', content: 'Draft content' });
    expect(res.status).toBe(201);
    expect(res.body.versions[0].status).toBe('draft');
    draftVersionId = res.body.versions[0].id;
  });

  it('employee denied from publishing (403)', async () => {
    const res = await request(app)
      .post(`/api/policies/versions/${draftVersionId}/publish`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ assignments: [] });
    expect(res.status).toBe(403);
  });

  it('manager can publish and assign to employee', async () => {
    const res = await request(app)
      .post(`/api/policies/versions/${draftVersionId}/publish`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ assignments: [{ userId: employeeUser.id }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('published');
  });

  it('employee can view assigned policy', async () => {
    const res = await request(app)
      .get('/api/policies')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    const pol = res.body.find(p => p.versionId === draftVersionId);
    expect(pol).toBeDefined();
  });

  it('employee acknowledges policy', async () => {
    const res = await request(app)
      .post(`/api/policies/versions/${draftVersionId}/acknowledge`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
  });

  it('repeated acknowledgement rejected (409)', async () => {
    const res = await request(app)
      .post(`/api/policies/versions/${draftVersionId}/acknowledge`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(409);
  });

  it('re-publication creates v2 without altering v1', async () => {
    // Manager edits published policy
    const editRes = await request(app)
      .put(`/api/policies/versions/${draftVersionId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ content: 'Updated content v2' });
    
    expect(editRes.status).toBe(200);
    expect(editRes.body.versionNumber).toBe(2);
    expect(editRes.body.status).toBe('draft');
    const newVersionId = editRes.body.id;

    // Check v1 still exists
    const v1 = await prisma.policyVersion.findUnique({ where: { id: draftVersionId } });
    expect(v1.status).toBe('published');

    // Publish v2
    const pubRes = await request(app)
      .post(`/api/policies/versions/${newVersionId}/publish`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ assignments: [{ userId: employeeUser.id }] });
    
    expect(pubRes.status).toBe(200);

    // Old acknowledgement evidence still present
    const acks = await prisma.policyAcknowledgement.findMany({ where: { policyVersionId: draftVersionId } });
    expect(acks.length).toBe(1);
    expect(acks[0].userId).toBe(employeeUser.id);
  });
});
