const quizService = require('../services/quizService');

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await quizService.getQuizzesForUser(req.user);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createDraft = async (req, res) => {
  try {
    const quiz = await quizService.createDraft(req.body, req.user);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const publishAndAssign = async (req, res) => {
  try {
    const published = await quizService.publishAndAssign(req.params.id, req.params.versionId, req.body.assignments, req.user);
    res.json(published);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const result = await quizService.submitAttempt(req.params.versionId, req.body.answers, req.user);
    res.json(result);
  } catch (err) {
    const codeMap = {
      'NOT_ASSIGNED': 403,
      'ALREADY_PASSED': 400,
      'ATTEMPTS_EXHAUSTED': 403,
      'QUIZ_NOT_PUBLISHED': 400
    };
    if (codeMap[err.message]) {
      return res.status(codeMap[err.message]).json({ error: { code: err.message, message: err.message } });
    }
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = {
  getQuizzes,
  createDraft,
  publishAndAssign,
  submitAttempt
};
