const express = require('express');
const router = express.Router();
const policiesController = require('../controllers/policiesController');
const authMiddleware = require('../shared/authMiddleware');
const requireRole = require('../shared/requireRole');

router.use(authMiddleware);

router.get('/', policiesController.getLibrary);
router.get('/aup', policiesController.getAUP);
router.get('/:id', policiesController.getPolicyDetails);

// Manager/Admin only
router.post('/generate', requireRole('manager', 'admin'), policiesController.generatePolicy);
router.post('/', requireRole('manager', 'admin'), policiesController.createDraft);
router.put('/versions/:versionId', requireRole('manager', 'admin'), policiesController.editVersion);
router.post('/versions/:versionId/publish', requireRole('manager', 'admin'), policiesController.publishAndAssign);
router.post('/versions/:versionId/archive', requireRole('manager', 'admin'), policiesController.archive);

// All authenticated users
router.post('/versions/:versionId/acknowledge', policiesController.acknowledge);

// Download endpoint mock
router.get('/versions/:versionId/download', (req, res) => {
  // In a real system this would serve a PDF or signed URL based on auth
  res.send('Simulated secure download of policy version ' + req.params.versionId);
});

module.exports = router;
