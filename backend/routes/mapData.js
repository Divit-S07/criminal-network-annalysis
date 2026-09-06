import express from 'express';
import { getMapData } from '../controllers/dataControllers.js';

const router = express.Router();
router.get('/', getMapData);

export default router;
