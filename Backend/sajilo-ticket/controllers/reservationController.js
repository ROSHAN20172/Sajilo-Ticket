import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Release a reservation and its associated seats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const releaseReservation = async (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({
            success: false,
            message: 'Reservation ID is required'
        });
    }

    try {
        // Get the Reservation model
        const Reservation = mongoose.model('Reservation');
        const Seat = mongoose.model('Seat');

        // Find the reservation
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Get the seat IDs from the reservation
        const seatIds = reservation.seatIds;
        const busId = reservation.busId;

        // Update the seats to be available again
        if (seatIds && seatIds.length > 0) {
            await Seat.updateMany(
                { _id: { $in: seatIds }, busId },
                { $set: { status: 'available' } }
            );
        }

        // Delete the reservation
        await Reservation.findByIdAndDelete(reservationId);

        return res.status(200).json({
            success: true,
            message: 'Reservation released successfully'
        });
    } catch (error) {
        console.error('Error releasing reservation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to release reservation',
            error: error.message
        });
    }
};

/**
 * Check if a reservation has expired
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkReservationExpiry = async (req, res) => {
    const { reservationId } = req.params;

    if (!reservationId) {
        return res.status(400).json({
            success: false,
            message: 'Reservation ID is required'
        });
    }

    try {
        // Get the Reservation model
        const Reservation = mongoose.model('Reservation');

        // Find the reservation
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Check if the reservation has expired
        const createdAt = new Date(reservation.createdAt);
        const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes in milliseconds
        const now = new Date();

        if (now > expiryTime) {
            return res.status(200).json({
                success: true,
                expired: true,
                message: 'Reservation has expired'
            });
        }

        // Calculate remaining time in seconds
        const remainingSeconds = Math.floor((expiryTime - now) / 1000);

        return res.status(200).json({
            success: true,
            expired: false,
            message: 'Reservation is still valid',
            remainingSeconds,
            expiryTime
        });
    } catch (error) {
        console.error('Error checking reservation expiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check reservation expiry',
            error: error.message
        });
    }
}; 