// controllers/authController.js
import { buildToken } from '../middleware/auth.js';
import { auditNow } from '../middleware/audit.js';

export async function register(req, res) {
  const { email, name, role } = req.body || {};
  const user = { id: 'user_101', email: email || 'investigator@agency.gov', name: name || 'Investigator', role: role || 'INVESTIGATOR' };
  const token = buildToken({ userId: user.id, role: user.role });
  res.status(201).json({ success: true, token, user });
}

export async function login(req, res) {
  const { email } = req.body || {};
  const user = { id: 'user_101', email: email || 'investigator@agency.gov', name: 'Investigator', role: 'INVESTIGATOR' };
  const token = buildToken({ userId: user.id, role: user.role });
  res.json({ success: true, token, user });
}

export async function me(req, res) {
  res.json({ success: true, user: req.user });
}
