const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../shared/authMiddleware');
const requireRole = require('../shared/requireRole');

router.use(authMiddleware);

router.get('/', quizController.getQuizzes);
router.post('/versions/:versionId/submit', quizController.submitAttempt);

// Managers/Admins only
router.post('/', requireRole('manager', 'admin'), quizController.createDraft);
router.post('/:id/versions/:versionId/publish', requireRole('manager', 'admin'), quizController.publishAndAssign);

module.exports = router;
