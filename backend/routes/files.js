import express from 'express';
import { uploadFile, listFiles, getFile, uploadMiddleware } from '../controllers/filesController.js';

const router = express.Router();
router.post('/upload', uploadMiddleware, uploadFile);
router.get('/', listFiles);
router.get('/:id', getFile);

export default router;
