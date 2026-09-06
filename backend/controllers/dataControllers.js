// controllers/dataControllers.js — entities, relationships, evidence, alerts, timeline, map, network

export async function listEntities(req, res) {
  res.json({ success: true, data: [] });
}

export async function getEntity(req, res) {
  res.status(404).json({ success: false, error: 'Entity not found' });
}

export async function listRelationships(req, res) {
  res.json({ success: true, data: [] });
}

export async function getRelationship(req, res) {
  res.status(404).json({ success: false, error: 'Relationship not found' });
}

export async function getEvidenceById(req, res) {
  res.status(404).json({ success: false, error: 'Evidence not found' });
}

export async function listAlerts(req, res) {
  res.json({ success: true, data: [] });
}

export async function updateAlertStatus(req, res) {
  res.json({ success: true, data: { id: req.params.id, status: req.body?.status || 'NEW' } });
}

export async function listTimeline(req, res) {
  res.json({ success: true, data: [] });
}

export async function getMapData(req, res) {
  res.json({ success: true, data: [] });
}
