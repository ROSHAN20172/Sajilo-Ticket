import express from 'express';
import { getBusDetails, imageProxy, getBusSeatData, getRoutePoints } from '../controllers/busController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// GET /api/bus/image-proxy?id=fileId - proxy for Google Drive images
router.get('/image-proxy', imageProxy);

// GET /api/bus/seat-data?busId=123&date=2023-04-01 - get seat data for a bus on a specific date
router.get('/seat-data', userAuth, getBusSeatData);

// GET /api/bus/route-points?busId=123&date=2023-04-01 - get pickup and drop points with times
router.get('/route-points', userAuth, getRoutePoints);

// GET /api/bus/:busId - fetch bus details
router.get('/:busId', userAuth, getBusDetails);

export default router;
