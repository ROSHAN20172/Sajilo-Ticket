import express from 'express';
import { releaseReservation, checkReservationExpiry } from '../controllers/reservationController.js';

const router = express.Router();

// Route to release a reservation
router.post('/release', releaseReservation);

// Route to check if a reservation has expired
router.get('/check-expiry/:reservationId', checkReservationExpiry);

export default router; 