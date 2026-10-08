const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/summary', requireAuth, complianceController.getSummary);

module.exports = router;
