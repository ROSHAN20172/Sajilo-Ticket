import express from 'express';
import { initiatePayment, verifyPayment, getInvoice } from '../controllers/paymentController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// Route to initiate payment
router.post('/initiate', userAuth, initiatePayment);

// Route to verify payment
router.post('/verify', verifyPayment);

// Route to get invoice data by ticket ID
router.get('/invoice/:ticketId', getInvoice);

export default router; 