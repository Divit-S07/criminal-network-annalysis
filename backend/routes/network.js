import express from 'express';
import { getNetwork } from '../controllers/networkController.js';

const router = express.Router();
router.get('/:caseId', getNetwork);

export default router;
