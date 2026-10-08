const express = require('express');
const router = express.Router();
const lessonsController = require('../controllers/lessonsController');
const authMiddleware = require('../shared/authMiddleware');
const requireRole = require('../shared/requireRole');

router.use(authMiddleware);

router.get('/', lessonsController.getLessons);
router.get('/:id', lessonsController.getLessonDetails);
router.put('/:id/progress', lessonsController.updateProgress);

module.exports = router;
