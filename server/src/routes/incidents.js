const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/', requireAuth, incidentController.createIncident);
router.get('/', requireAuth, incidentController.getIncidents);
router.get('/:id', requireAuth, incidentController.getIncidentDetails);
router.patch('/:id/status', requireAuth, requireRole(['manager', 'admin']), incidentController.updateStatus);
router.post('/:id/notes', requireAuth, requireRole(['manager', 'admin']), incidentController.addInternalNote);
router.get('/:id/attachments/:attachmentId/download', requireAuth, incidentController.downloadAttachment);

module.exports = router;
