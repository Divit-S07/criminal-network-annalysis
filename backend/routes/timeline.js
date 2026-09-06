import express from 'express';
import { listTimeline } from '../controllers/dataControllers.js';

const router = express.Router();
router.get('/', listTimeline);

export default router;
