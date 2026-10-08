const incidentService = require('../services/incidentService');

const createIncident = async (req, res) => {
  try {
    const incident = await incidentService.createIncident(req.body, req.user);
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getIncidents = async (req, res) => {
  try {
    const filters = {
      branch: req.query.branch,
      department: req.query.department,
      status: req.query.status
    };
    const incidents = await incidentService.getIncidents(req.user, filters);
    res.json(incidents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getIncidentDetails = async (req, res) => {
  try {
    const incident = await incidentService.getIncidentDetails(req.params.id, req.user);
    res.json(incident);
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
    if (error.message === 'Incident not found') return res.status(404).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const updated = await incidentService.updateStatus(req.params.id, status, resolutionNotes, req.user);
    res.json(updated);
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Employees cannot update incident status') return res.status(403).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;
    const created = await incidentService.addInternalNote(req.params.id, note, req.user);
    res.status(201).json(created);
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Employees cannot add internal notes') return res.status(403).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
};

// Assuming Attachment download would be here
const downloadAttachment = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentDetails,
  updateStatus,
  addInternalNote,
  downloadAttachment
};
