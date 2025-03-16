import express from 'express';
import { getBusDetails, imageProxy, getBusSeatData } from '../controllers/busController.js';

const router = express.Router();

// GET /api/bus/image-proxy?id=fileId - proxy for Google Drive images
router.get('/image-proxy', imageProxy);

// GET /api/bus/seat-data?busId=123&date=2023-04-01 - get seat data for a bus on a specific date
router.get('/seat-data', getBusSeatData);

// GET /api/bus/:busId - fetch bus details
router.get('/:busId', getBusDetails);

export default router;
