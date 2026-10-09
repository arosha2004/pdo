const policiesService = require('../services/policiesService');
const { GoogleGenAI } = require('@google/genai');

const getLibrary = async (req, res) => {
  try {
    const policies = await policiesService.getLibrary(req.user);
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getAUP = async (req, res) => {
  try {
    const aup = await policiesService.getAUP();
    if (!aup) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'AUP not found' } });
    res.json(aup);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getPolicyDetails = async (req, res) => {
  try {
    const policy = await policiesService.getPolicyDetails(req.params.id, req.user);
    if (!policy) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const createDraft = async (req, res) => {
  try {
    const policy = await policiesService.createDraft(req.body, req.user);
    res.status(201).json(policy);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const generatePolicy = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Title and category are required to generate a policy' } });
    }
    
    // We will use a mock string if API key is not present for dev purposes, 
    // or actually call the API if it is.
    if (!process.env.GEMINI_API_KEY) {
      const mockContent = `PURPOSE\nTo establish guidelines for ${title}.\n\nSCOPE\nApplies to all employees regarding ${category}.\n\nPOLICY STATEMENT\nEmployees must adhere to the standards outlined in this document.`;
      return res.json({ content: mockContent });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Write a professional corporate policy document. 
Title: ${title}
Category: ${category}
The policy should include sections for Purpose, Scope, Policy Statement, and Responsibilities. Do not include markdown code block syntax like \`\`\` in the output.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ content: response.text });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const editVersion = async (req, res) => {
  try {
    const version = await policiesService.editVersion(req.params.versionId, req.body, req.user);
    res.json(version);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Version not found' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const publishAndAssign = async (req, res) => {
  try {
    const { assignments } = req.body; // Array of { userId?, jobGroup?, deadline? }
    const published = await policiesService.publishAndAssign(req.params.versionId, assignments || [], req.user);
    res.json(published);
  } catch (err) {
    if (err.message === 'INVALID_STATE') return res.status(400).json({ error: { code: 'INVALID_STATE', message: 'Cannot publish' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const archive = async (req, res) => {
  try {
    const archived = await policiesService.archive(req.params.versionId, req.user);
    res.json(archived);
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const acknowledge = async (req, res) => {
  try {
    const ack = await policiesService.acknowledge(req.params.versionId, req.user);
    res.json(ack);
  } catch (err) {
    if (err.message === 'ALREADY_ACKNOWLEDGED') return res.status(409).json({ error: { code: 'CONFLICT', message: 'Already acknowledged' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = {
  getLibrary,
  getAUP,
  getPolicyDetails,
  createDraft,
  generatePolicy,
  editVersion,
  publishAndAssign,
  archive,
  acknowledge
};
