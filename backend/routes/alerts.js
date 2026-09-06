import express from 'express';
import { listAlerts, updateAlertStatus } from '../controllers/dataControllers.js';

const router = express.Router();
router.get('/', listAlerts);
router.patch('/:id/status', updateAlertStatus);

export default router;
