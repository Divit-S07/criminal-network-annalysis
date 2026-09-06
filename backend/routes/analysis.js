import express from 'express';
import { startAnalysis, getJob, getJobResults } from '../controllers/analysisController.js';

const router = express.Router();
router.post('/start', startAnalysis);
router.get('/:jobId', getJob);
router.get('/:jobId/results', getJobResults);

export default router;
