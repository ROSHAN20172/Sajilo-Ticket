import userModel from "../models/userModel.js";
import mongoose from "mongoose";

export const getUserData = async (req, res) => {
    try {
        // Use req.userId which is set by the userAuth middleware
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please log in.'
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not Found' });
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get user's bookings
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please log in.'
            });
        }

        // Import Ticket model
        const Ticket = mongoose.model('Ticket');

        // Find all tickets associated with this user
        const bookings = await Ticket.find({ userId })
            .sort({ createdAt: -1 }) // Most recent first
            .lean(); // Convert to plain JavaScript objects

        // Process bookings to ensure consistent data format
        const processedBookings = bookings.map(booking => {
            // Handle nested data structures and provide defaults
            const fromLocation =
                (booking.ticketInfo && booking.ticketInfo.fromLocation) ?
                    booking.ticketInfo.fromLocation : 'Unknown';

            const toLocation =
                (booking.ticketInfo && booking.ticketInfo.toLocation) ?
                    booking.ticketInfo.toLocation : 'Unknown';

            return {
                ...booking,
                // Add top-level duplicates of nested properties for easier access in frontend
                fromLocation,
                toLocation,
                journeyDate: (booking.ticketInfo && booking.ticketInfo.date) ? booking.ticketInfo.date : null,
                selectedSeats: (booking.ticketInfo && booking.ticketInfo.selectedSeats) ? booking.ticketInfo.selectedSeats : [],
                totalPrice: booking.price || 0,
                // Ensure status exists even if not set in database
                status: booking.status || 'pending'
            };
        });

        return res.status(200).json({
            success: true,
            bookings: processedBookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};