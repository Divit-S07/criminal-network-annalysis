import express from 'express';
import { getEvidenceById } from '../controllers/dataControllers.js';

const router = express.Router();
router.get('/:id', getEvidenceById);

export default router;
