import express from 'express';
import { generateReport } from '../controllers/reportsController.js';

const router = express.Router();
router.post('/generate', generateReport);
router.get('/:caseId', generateReport);

export default router;
