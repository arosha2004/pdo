const reportService = require('../services/reportService');

const exportCsv = async (req, res) => {
  try {
    const filters = {
      branch: req.query.branch,
      department: req.query.department,
      jobGroup: req.query.jobGroup,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    // In actual implementation, we might validate if a manager is trying to export out of their scope.
    // However, our buildScopeFilter naturally drops filters out of scope, or overrides them.
    const csv = await reportService.generateCsv(req.user, filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    res.send(csv);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const exportPdf = async (req, res) => {
  try {
    const filters = {
      branch: req.query.branch,
      department: req.query.department,
      jobGroup: req.query.jobGroup,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const pdf = await reportService.generatePdf(req.user, filters);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.send(pdf);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { exportCsv, exportPdf };
