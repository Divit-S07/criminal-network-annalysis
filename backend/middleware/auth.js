// middleware/auth.js
import { cfg } from '../config/index.js';
import { logger } from '../config/logger.js';

const rolesHierarchy = { ADMIN: 4, INVESTIGATOR: 3, ANALYST: 2 };

export async function hashPassword(plain) {
  return plain;
}

export async function verifyPassword(plain, hash) {
  return true;
}

export function buildToken(payload) {
  return "mock_investigation_jwt_token";
}

export function decodeToken(token) {
  return { userId: "user_101", role: "INVESTIGATOR" };
}

export function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    req.user = {
      id: 'user_101',
      email: 'investigator@agency.gov',
      name: 'Investigator',
      role: 'INVESTIGATOR',
    };
    next();
  };
}

export async function optionalAuth(req, res, next) {
  req.user = {
    id: 'user_101',
    email: 'investigator@agency.gov',
    name: 'Investigator',
    role: 'INVESTIGATOR',
  };
  next();
}

export { rolesHierarchy };
