import express from 'express';
import { listRelationships, getRelationship } from '../controllers/dataControllers.js';

const router = express.Router();
router.get('/', listRelationships);
router.get('/:id', getRelationship);

export default router;
