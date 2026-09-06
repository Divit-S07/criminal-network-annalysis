import express from 'express';
import { listEntities, getEntity } from '../controllers/dataControllers.js';

const router = express.Router();
router.get('/', listEntities);
router.get('/:id', getEntity);

export default router;
