import express from 'express';
import { getBusDetails, imageProxy } from '../controllers/busController.js';

const router = express.Router();

// GET /api/bus/image-proxy?id=fileId - proxy for Google Drive images
router.get('/image-proxy', imageProxy);
router.get('/:busId', getBusDetails);

export default router;
