import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

// Import models - we'll need to create these
import Ticket from '../models/ticketModel.js';
import Payment from '../models/paymentModel.js';

// Environment variables
const KHALTI_API_URL = process.env.NODE_ENV === 'production'
    ? 'https://khalti.com/api/v2'
    : 'https://dev.khalti.com/api/v2';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Initiate Khalti payment
export const initiatePayment = async (req, res) => {
    try {
        const {
            amount,
            reservationId,
            passengerInfo,
            ticketInfo,
            pickupPointId,
            dropPointId
        } = req.body;

        // Validate required fields
        if (!amount || !reservationId || !passengerInfo || !ticketInfo) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Convert amount to paisa (Khalti requires amount in paisa)
        const amountInPaisa = Math.round(amount * 100);

        // Generate a unique purchase order ID
        const purchase_order_id = `ST-${Date.now()}-${uuidv4().substring(0, 8)}`;

        // Generate a unique booking ID (format: BK-XXXXXXXXXXXX)
        const bookingId = `BK-${Date.now().toString().substring(3, 13)}`;

        // Create a new ticket record
        const ticket = new Ticket({
            busId: ticketInfo.busId,
            userId: req.body.userId || null,
            bookingId,
            reservationId,
            passengerInfo,
            ticketInfo,
            price: amount,
            pickupPointId,
            dropPointId
        });

        // Save the ticket
        await ticket.save();

        // Prepare Khalti payment request
        const khaltiPayload = {
            return_url: `${WEBSITE_URL}/bus-tickets/payment-callback`,
            website_url: WEBSITE_URL,
            amount: amountInPaisa,
            purchase_order_id,
            purchase_order_name: `Ticket for ${ticketInfo.fromLocation} to ${ticketInfo.toLocation}`,
            customer_info: {
                name: passengerInfo.name,
                email: passengerInfo.email,
                phone: passengerInfo.phone
            },
            amount_breakdown: [
                {
                    label: "Ticket Price",
                    amount: amountInPaisa
                }
            ],
            product_details: ticketInfo.selectedSeats.map((seat) => ({
                identity: `SEAT-${seat}`,
                name: `Seat ${seat}`,
                total_price: amountInPaisa / ticketInfo.selectedSeats.length,
                quantity: 1,
                unit_price: amountInPaisa / ticketInfo.selectedSeats.length
            }))
        };

        // Make API call to Khalti
        const response = await axios.post(
            `${KHALTI_API_URL}/epayment/initiate/`,
            khaltiPayload,
            {
                headers: {
                    'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Create payment record
        const payment = new Payment({
            ticketId: ticket._id,
            amount,
            status: 'initiated',
            pidx: response.data.pidx,
            purchase_order_id,
            paymentDetails: response.data
        });

        // Save the payment record
        await payment.save();

        // Update the ticket with payment information
        ticket.paymentStatus = 'pending';
        await ticket.save();

        // Return success response with payment URL
        return res.status(200).json({
            success: true,
            paymentUrl: response.data.payment_url,
            pidx: response.data.pidx
        });

    } catch (error) {
        console.error('Payment initiation error:', error);

        // If there's a response from Khalti, send that error
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                success: false,
                message: 'Payment initiation failed',
                error: error.response.data
            });
        }

        // Otherwise, send a generic error
        return res.status(500).json({
            success: false,
            message: 'Payment initiation failed. Please try again later.',
            error: error.message
        });
    }
};

// Verify Khalti payment
export const verifyPayment = async (req, res) => {
    try {
        const { pidx, status, purchase_order_id, reservationId } = req.body;

        // Validate required fields
        if (!pidx) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
        }

        // Find the payment record
        const payment = await Payment.findOne({ pidx });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Lookup the payment status from Khalti
        const response = await axios.post(
            `${KHALTI_API_URL}/epayment/lookup/`,
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Find the associated ticket
        const ticket = await Ticket.findById(payment.ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Update payment status based on Khalti response
        if (response.data.status === 'Completed') {
            // Payment successful
            payment.status = 'completed';
            payment.transactionId = response.data.transaction_id;
            payment.paidAt = new Date();
            payment.paymentDetails = { ...payment.paymentDetails, ...response.data };

            // Update ticket status
            ticket.status = 'confirmed';
            ticket.paymentStatus = 'paid';

            // Update seat status to 'booked' in the database
            // This will depend on your database structure
            try {
                // Update seats to booked status
                await updateSeatStatus(ticket.ticketInfo.busId, ticket.ticketInfo.selectedSeats, 'booked');

                // Remove the reservation
                if (reservationId) {
                    await removeReservation(reservationId);
                }
            } catch (error) {
                console.error('Error updating seat status:', error);
                // We continue with the payment verification even if seat status update fails
                // but log the error for debugging
            }
        } else if (response.data.status === 'Refunded') {
            // Payment refunded
            payment.status = 'refunded';
            payment.refundedAt = new Date();
            payment.paymentDetails = { ...payment.paymentDetails, ...response.data };

            // Update ticket status
            ticket.status = 'canceled';
            ticket.paymentStatus = 'refunded';

            // Update seat status to 'available' again
            try {
                await updateSeatStatus(ticket.ticketInfo.busId, ticket.ticketInfo.selectedSeats, 'available');

                // Remove the reservation
                if (reservationId) {
                    await removeReservation(reservationId);
                }
            } catch (error) {
                console.error('Error updating seat status:', error);
            }
        } else if (
            response.data.status === 'Expired' ||
            response.data.status === 'User canceled'
        ) {
            // Payment failed
            payment.status = 'canceled';
            payment.paymentDetails = { ...payment.paymentDetails, ...response.data };

            // Update ticket status
            ticket.status = 'canceled';

            // Update seat status to 'available' again
            try {
                await updateSeatStatus(ticket.ticketInfo.busId, ticket.ticketInfo.selectedSeats, 'available');

                // Remove the reservation
                if (reservationId) {
                    await removeReservation(reservationId);
                }
            } catch (error) {
                console.error('Error updating seat status:', error);
            }
        } else {
            // Payment pending or other status
            payment.paymentDetails = { ...payment.paymentDetails, ...response.data };

            // For any other status, we keep the ticket as pending
        }

        // Save the updated payment and ticket records
        await payment.save();
        await ticket.save();

        // Prepare invoice data for frontend
        const invoiceData = {
            ticketId: ticket._id,
            bookingId: ticket.bookingId,
            busName: ticket.ticketInfo.busName,
            busNumber: ticket.ticketInfo.busNumber,
            fromLocation: ticket.ticketInfo.fromLocation,
            toLocation: ticket.ticketInfo.toLocation,
            departureTime: ticket.ticketInfo.departureTime,
            arrivalTime: ticket.ticketInfo.arrivalTime,
            date: ticket.ticketInfo.date,
            selectedSeats: ticket.ticketInfo.selectedSeats,
            pickupPoint: ticket.ticketInfo.pickupPoint,
            dropPoint: ticket.ticketInfo.dropPoint,
            passengerName: ticket.passengerInfo.name,
            passengerEmail: ticket.passengerInfo.email,
            passengerPhone: ticket.passengerInfo.phone,
            price: ticket.price,
            paymentStatus: ticket.paymentStatus,
            bookingDate: ticket.bookingDate,
            transactionId: payment.transactionId,
            journeyDate: ticket.ticketInfo.date,
            pricePerSeat: ticket.price / ticket.ticketInfo.selectedSeats.length,
            totalPrice: ticket.price,
            contactPhone: '+977-9800000000, +9770123456789'
        };

        // Return success response
        return res.status(200).json({
            success: response.data.status === 'Completed',
            message: `Payment ${response.data.status.toLowerCase()}`,
            paymentStatus: response.data.status,
            ticketId: ticket._id,
            invoiceData
        });

    } catch (error) {
        console.error('Payment verification error:', error);

        // If there's a response from Khalti, send that error
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                success: false,
                message: 'Payment verification failed',
                error: error.response.data
            });
        }

        // Otherwise, send a generic error
        return res.status(500).json({
            success: false,
            message: 'Payment verification failed. Please try again later.',
            error: error.message
        });
    }
};

// Helper function to update seat status
const updateSeatStatus = async (busId, seatIds, status) => {
    // This implementation will depend on your database structure
    // Here's a basic example assuming you have a Seat model
    try {
        // Update the seats status
        const Seat = mongoose.model('Seat');
        await Seat.updateMany(
            { busId, seatId: { $in: seatIds } },
            { $set: { status } }
        );
        return true;
    } catch (error) {
        console.error('Error updating seat status:', error);
        return false;
    }
};

// Helper function to remove reservation
const removeReservation = async (reservationId) => {
    try {
        const Reservation = mongoose.model('Reservation');
        await Reservation.findByIdAndDelete(reservationId);
        return true;
    } catch (error) {
        console.error('Error removing reservation:', error);
        return false;
    }
};

// Add endpoint to fetch invoice by ticketId
export const getInvoice = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }

        // Find the ticket
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Find the payment information
        const payment = await Payment.findOne({ ticketId });

        if (!payment || payment.status !== 'completed') {
            return res.status(403).json({
                success: false,
                message: 'No completed payment found for this ticket'
            });
        }

        // Prepare invoice data
        const invoiceData = {
            ticketId: ticket._id,
            bookingId: ticket.bookingId,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            busName: ticket.ticketInfo.busName,
            busNumber: ticket.ticketInfo.busNumber,
            fromLocation: ticket.ticketInfo.fromLocation,
            toLocation: ticket.ticketInfo.toLocation,
            departureTime: ticket.ticketInfo.departureTime,
            arrivalTime: ticket.ticketInfo.arrivalTime,
            date: ticket.ticketInfo.date,
            selectedSeats: ticket.ticketInfo.selectedSeats,
            pickupPoint: ticket.ticketInfo.pickupPoint,
            dropPoint: ticket.ticketInfo.dropPoint,
            passengerName: ticket.passengerInfo.name,
            passengerEmail: ticket.passengerInfo.email,
            passengerPhone: ticket.passengerInfo.phone,
            price: ticket.price,
            paymentStatus: ticket.paymentStatus,
            bookingDate: ticket.bookingDate,
            transactionId: payment.transactionId,
            journeyDate: ticket.ticketInfo.date,
            pricePerSeat: ticket.price / ticket.ticketInfo.selectedSeats.length,
            totalPrice: ticket.price,
            contactPhone: '+977-9800000000, +9770123456789'
        };

        return res.status(200).json({
            success: true,
            invoiceData
        });

    } catch (error) {
        console.error('Error fetching invoice:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice',
            error: error.message
        });
    }
}; 