const complianceService = require('../services/complianceService');

const getSummary = async (req, res) => {
  try {
    const filters = {
      branch: req.query.branch,
      department: req.query.department,
      jobGroup: req.query.jobGroup,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const summary = await complianceService.getSummary(req.user, filters);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getSummary };
