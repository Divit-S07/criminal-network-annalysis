import express from 'express';
import { createCase, listCases, getCase } from '../controllers/casesController.js';

const router = express.Router();
router.post('/', createCase);
router.get('/', listCases);
router.get('/:id', getCase);

export default router;
