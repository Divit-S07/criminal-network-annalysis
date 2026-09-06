// controllers/casesController.js

const casesStore = [];

export async function createCase(req, res) {
  const { name, description, location, date } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, error: 'Case name is required' });
  }
  const caseId = `CASE-${casesStore.length + 1001}`;
  const doc = {
    id: caseId,
    name: String(name).trim(),
    description: String(description || '').trim(),
    location: String(location || '').trim(),
    date: date || new Date().toISOString().slice(0, 10),
    status: 'Active',
    lastUpdated: new Date().toISOString().slice(0, 10),
    persons: 0,
    relationships: 0,
  };
  casesStore.unshift(doc);
  res.status(201).json({ success: true, data: doc });
}

export async function listCases(req, res) {
  res.json({ success: true, data: casesStore });
}

export async function getCase(req, res) {
  const doc = casesStore.find((c) => c.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: 'Case not found' });
  res.json({ success: true, data: doc });
}
