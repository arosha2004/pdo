const lessonsService = require('../services/lessonsService');

const getLessons = async (req, res) => {
  try {
    const lessons = await lessonsService.getLessons(req.user);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getLessonDetails = async (req, res) => {
  try {
    const lesson = await lessonsService.getLessonDetails(req.params.id, req.user);
    res.json(lesson);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Lesson not found' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { progressData, status } = req.body;
    const progress = await lessonsService.updateProgress(req.params.id, progressData, status, req.user);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = {
  getLessons,
  getLessonDetails,
  updateProgress
};
