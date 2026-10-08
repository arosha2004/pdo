const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/export/csv', requireAuth, requireRole(['manager', 'admin']), reportController.exportCsv);
router.get('/export/pdf', requireAuth, requireRole(['manager', 'admin']), reportController.exportPdf);

module.exports = router;
