const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Auth Routes (Stand-in)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
  }
  
  const token = jwt.sign({ 
    id: user.id, 
    name: user.name, 
    appRole: user.appRole, 
    branch: user.branch, 
    department: user.department, 
    jobGroup: user.jobGroup 
  }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, appRole: user.appRole, jobGroup: user.jobGroup, branch: user.branch, department: user.department } });
});

const policiesRouter = require('./routes/policies');
const lessonsRouter = require('./routes/lessons');
const quizRouter = require('./routes/quiz');
const complianceRouter = require('./routes/compliance');
const incidentsRouter = require('./routes/incidents');
const reportsRouter = require('./routes/reports');

app.use('/api/policies', policiesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/quizzes', quizRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/reports', reportsRouter);

module.exports = app;
