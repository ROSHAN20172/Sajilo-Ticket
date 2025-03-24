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
        console.log(`Attempting to release reservation ${reservationId}`);

        // Get the models
        const Reservation = mongoose.model('Reservation');
        const Seat = mongoose.model('Seat');
        const Ticket = mongoose.model('Ticket');

        // Find the reservation
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            console.log(`Reservation ${reservationId} not found`);
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Check if the reservation is marked as permanent
        if (reservation.isPermanent) {
            console.log(`Reservation ${reservationId} is marked as permanent, skipping seat release`);
            return res.status(200).json({
                success: true,
                message: 'Reservation is permanent and cannot be released'
            });
        }

        // Get the seat IDs from the reservation
        const seatIds = reservation.seatIds || [];
        const busId = reservation.busId;

        console.log(`Found reservation ${reservationId} with ${seatIds.length} seats for busId ${busId}`);

        // Advanced Payment Verification:
        // 1. Check if there's a paid ticket with this reservationId
        // 2. Check if any seats are marked as permanently booked
        // 3. Check if any seats have a valid ticketId associated with them
        // 4. Check if there's any ticket that has these seat IDs

        // Step 1: Check for paid tickets directly associated with this reservation
        const paidTicket = await Ticket.findOne({
            $or: [
                { reservationId, paymentStatus: 'paid' },
                { reservationId, status: 'confirmed' },
                { _id: reservation.ticketId, paymentStatus: 'paid' },
                { _id: reservation.ticketId, status: 'confirmed' }
            ]
        });

        if (paidTicket) {
            console.log(`Reservation ${reservationId} has an associated paid ticket ${paidTicket._id}. Skipping seat release.`);

            // Update seats to ensure they're permanently booked
            if (seatIds && seatIds.length > 0) {
                console.log(`Ensuring ${seatIds.length} seats are permanently booked due to paid ticket`);
                await Seat.updateMany(
                    { _id: { $in: seatIds } },
                    {
                        $set: {
                            status: 'booked',
                            isPermanentlyBooked: true,
                            ticketId: paidTicket._id
                        }
                    }
                );
            }

            // Update the reservation to be permanent before deleting it
            await Reservation.findByIdAndUpdate(
                reservationId,
                {
                    $set: {
                        isPermanent: true,
                        ticketId: paidTicket._id
                    }
                }
            );

            // Remove the reservation record but keep the seats booked
            await Reservation.findByIdAndDelete(reservationId);

            return res.status(200).json({
                success: true,
                message: 'Reservation removed (seats remain booked due to completed payment)'
            });
        }

        // Step 2: Check if any tickets have these same seat IDs (regardless of reservation)
        // This handles cases where a new booking was made for the same seats
        if (seatIds && seatIds.length > 0) {
            const ticketsWithSameSeats = await Ticket.find({
                seatIds: { $in: seatIds },
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'confirmed' }
                ]
            });

            if (ticketsWithSameSeats.length > 0) {
                console.log(`Found ${ticketsWithSameSeats.length} tickets that include these seats. Keeping seats booked.`);

                // Create a set of seat IDs that should remain booked
                const keepBookedSeatIds = new Set();

                ticketsWithSameSeats.forEach(ticket => {
                    if (ticket.seatIds) {
                        ticket.seatIds.forEach(seatId => keepBookedSeatIds.add(seatId.toString()));
                    }
                });

                console.log(`${keepBookedSeatIds.size} seats should remain booked based on other tickets`);

                // Only release seats that aren't in the keepBookedSeatIds set
                const seatsToRelease = seatIds.filter(id => !keepBookedSeatIds.has(id.toString()));

                // Mark the seats that are in other tickets as permanently booked
                if (keepBookedSeatIds.size > 0) {
                    const seatIdsToKeep = Array.from(keepBookedSeatIds);
                    await Seat.updateMany(
                        { _id: { $in: seatIdsToKeep } },
                        {
                            $set: {
                                status: 'booked',
                                isPermanentlyBooked: true
                            }
                        }
                    );
                    console.log(`Marked ${seatIdsToKeep.length} seats as permanently booked due to other tickets`);
                }

                // Release only the seats that don't have other tickets
                if (seatsToRelease.length > 0) {
                    const updateResult = await Seat.updateMany(
                        { _id: { $in: seatsToRelease }, isPermanentlyBooked: { $ne: true } },
                        { $set: { status: 'available' } }
                    );
                    console.log(`Released ${updateResult.modifiedCount} seats to available status`);
                }

                // Delete the reservation
                await Reservation.findByIdAndDelete(reservationId);
                console.log(`Deleted reservation ${reservationId}`);

                return res.status(200).json({
                    success: true,
                    message: `Reservation released. ${seatsToRelease.length} seats released, ${keepBookedSeatIds.size} seats retained due to other tickets.`
                });
            }
        }

        // Step 3: Check if any seats are already marked as permanently booked
        const seats = await Seat.find({ _id: { $in: seatIds } });
        const permanentlyBookedSeats = seats.filter(seat => seat.isPermanentlyBooked);

        if (permanentlyBookedSeats.length > 0) {
            console.log(`Found ${permanentlyBookedSeats.length} permanently booked seats out of ${seatIds.length}`);

            // Check if any permanently booked seats have valid ticket IDs
            const ticketIds = permanentlyBookedSeats
                .map(seat => seat.ticketId)
                .filter(id => id);

            if (ticketIds.length > 0) {
                console.log(`Found tickets associated with permanently booked seats: ${ticketIds}`);

                // Check the payment status of these tickets
                const paidTickets = await Ticket.find({
                    _id: { $in: ticketIds },
                    $or: [
                        { paymentStatus: 'paid' },
                        { status: 'confirmed' }
                    ]
                });

                if (paidTickets.length > 0) {
                    console.log(`Found ${paidTickets.length} paid tickets associated with seats`);

                    // Only release seats that don't have a paid ticket
                    const paidSeatIds = new Set();

                    paidTickets.forEach(ticket => {
                        if (ticket.seatIds) {
                            ticket.seatIds.forEach(seatId => paidSeatIds.add(seatId.toString()));
                        }
                    });

                    const seatsToRelease = seatIds.filter(id => !paidSeatIds.has(id.toString()));
                    console.log(`After checking tickets, ${seatsToRelease.length} out of ${seatIds.length} seats will be released`);

                    if (seatsToRelease.length > 0) {
                        const updateResult = await Seat.updateMany(
                            { _id: { $in: seatsToRelease }, isPermanentlyBooked: { $ne: true } },
                            { $set: { status: 'available' } }
                        );
                        console.log(`Released ${updateResult.modifiedCount} non-permanent seats`);
                    }

                    // Delete the reservation
                    await Reservation.findByIdAndDelete(reservationId);
                    console.log(`Deleted reservation ${reservationId}`);

                    return res.status(200).json({
                        success: true,
                        message: `Reservation released. ${seatsToRelease.length} seats released, ${paidSeatIds.size} seats retained due to payment.`
                    });
                }
            }
        }

        // If no paid ticket found, filter out permanently booked seats
        const permanentSeatIds = permanentlyBookedSeats.map(seat => seat._id.toString());
        console.log(`Found ${permanentSeatIds.length} permanently booked seats that will NOT be released`);

        // Only release seats that are not permanently booked
        const seatsToRelease = seatIds.filter(id => !permanentSeatIds.includes(id.toString()));
        console.log(`Releasing ${seatsToRelease.length} non-permanent seats`);

        if (seatsToRelease.length > 0) {
            const updateResult = await Seat.updateMany(
                { _id: { $in: seatsToRelease }, isPermanentlyBooked: { $ne: true } },
                { $set: { status: 'available' } }
            );
            console.log(`Released ${updateResult.modifiedCount} seats to available status`);
        }

        // Delete the reservation
        await Reservation.findByIdAndDelete(reservationId);
        console.log(`Deleted reservation ${reservationId}`);

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
        console.log(`Checking expiry for reservation ${reservationId}`);

        // Get the Reservation model
        const Reservation = mongoose.model('Reservation');
        const Seat = mongoose.model('Seat');
        const Ticket = mongoose.model('Ticket');

        // Find the reservation
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            console.log(`Reservation ${reservationId} not found`);
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Get seat information to verify permanent status
        const seatIds = reservation.seatIds || [];
        const seats = await Seat.find({ _id: { $in: seatIds } });
        const permanentlyBookedSeats = seats.filter(seat => seat.isPermanentlyBooked);
        console.log(`Reservation has ${seatIds.length} seats, ${permanentlyBookedSeats.length} are permanently booked`);

        // Check if the reservation is marked as permanent
        if (reservation.isPermanent || permanentlyBookedSeats.length > 0) {
            console.log(`Reservation ${reservationId} is permanent or has permanent seats.`);
            return res.status(200).json({
                success: true,
                expired: false,
                message: 'Reservation is permanently valid',
                isPaid: true,
                ticketId: reservation.ticketId,
                permanentSeats: permanentlyBookedSeats.length,
                totalSeats: seatIds.length,
                remainingSeconds: 600, // Placeholder value, not actually used
                timeRemaining: 600,
                expiryTime: new Date(Date.now() + 600 * 1000) // Placeholder expiry time, not actually used
            });
        }

        // Check if there's a paid ticket for this reservation
        const paidTicket = await Ticket.findOne({
            reservationId,
            paymentStatus: 'paid',
            status: 'confirmed'
        });

        // If there's a paid ticket, the reservation is considered valid regardless of time
        if (paidTicket) {
            console.log(`Reservation ${reservationId} has an associated paid ticket.`);

            // Since we found a paid ticket but the reservation is not marked as permanent,
            // let's update the reservation and seats to be permanent
            reservation.isPermanent = true;
            reservation.ticketId = paidTicket._id;
            await reservation.save();

            // Mark all seats as permanently booked
            if (seatIds.length > 0) {
                await Seat.updateMany(
                    { _id: { $in: seatIds } },
                    {
                        $set: {
                            status: 'booked',
                            isPermanentlyBooked: true,
                            ticketId: paidTicket._id
                        }
                    }
                );
                console.log(`Updated ${seatIds.length} seats to permanently booked`);
            }

            return res.status(200).json({
                success: true,
                expired: false,
                message: 'Reservation is permanently valid due to completed payment',
                isPaid: true,
                ticketId: paidTicket._id,
                remainingSeconds: 600, // Just a placeholder, not used since payment is complete
                timeRemaining: 600,
                expiryTime: new Date(Date.now() + 600 * 1000) // Placeholder expiry time, not actually used
            });
        }

        // Check if the reservation has expired
        const createdAt = new Date(reservation.createdAt);
        const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes in milliseconds
        const now = new Date();

        if (now > expiryTime) {
            console.log(`Reservation ${reservationId} has expired. Created at ${createdAt}, expired at ${expiryTime}, now is ${now}`);
            return res.status(200).json({
                success: true,
                expired: true,
                message: 'Reservation has expired',
                isPaid: false,
                timeRemaining: 0
            });
        }

        // Calculate remaining time in seconds
        const remainingSeconds = Math.floor((expiryTime - now) / 1000);
        console.log(`Reservation ${reservationId} is still valid. ${remainingSeconds} seconds remaining`);

        return res.status(200).json({
            success: true,
            expired: false,
            message: 'Reservation is still valid',
            isPaid: false,
            remainingSeconds,
            timeRemaining: remainingSeconds,
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

/**
 * Confirm a reservation permanently after successful payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const confirmReservation = async (req, res) => {
    const { reservationId, ticketId, bookingId } = req.body;

    console.log(`DEBUGGING - Request received: reservationId=${reservationId}, ticketId=${ticketId}, bookingId=${bookingId}`);

    // Validate inputs
    if (!reservationId && !ticketId) {
        console.log(`DEBUGGING - Error: Both reservationId and ticketId are missing`);
        return res.status(400).json({
            success: false,
            message: 'Either reservationId or ticketId is required'
        });
    }

    try {
        // Get the models
        console.log(`DEBUGGING - Getting mongoose models`);
        const Reservation = mongoose.model('Reservation');
        const Seat = mongoose.model('Seat');
        const Ticket = mongoose.model('Ticket');

        // Get proper BK-format booking ID from ticket if available
        let properBookingId = bookingId;
        let ticket = null;

        // Step 1: Get or find the ticket
        if (ticketId) {
            try {
                ticket = await Ticket.findById(ticketId);
                console.log(`DEBUGGING - Found ticket by ID: ${ticket ? 'Yes' : 'No'}`);

                if (ticket && ticket.bookingId && ticket.bookingId.startsWith('BK-')) {
                    properBookingId = ticket.bookingId;
                    console.log(`DEBUGGING - Using ticket's booking ID: ${properBookingId}`);
                }
            } catch (error) {
                console.error(`DEBUGGING - Error finding ticket by ID: ${error.message}`);
                // Continue execution, we'll try other methods
            }
        }

        // If no ticket yet but we have a bookingId, try to find by bookingId
        if (!ticket && bookingId) {
            try {
                ticket = await Ticket.findOne({ bookingId });
                console.log(`DEBUGGING - Found ticket by bookingId: ${ticket ? 'Yes' : 'No'}`);

                if (ticket) {
                    ticketId = ticket._id;
                }
            } catch (error) {
                console.error(`DEBUGGING - Error finding ticket by bookingId: ${error.message}`);
            }
        }

        // Step 2: Get or create the reservation
        let reservation = null;

        if (reservationId) {
            try {
                // Try to find by direct ID first
                try {
                    reservation = await Reservation.findById(reservationId);
                } catch (idError) {
                    console.error(`DEBUGGING - Error finding reservation by direct ID: ${idError.message}`);
                    // If that fails, try to find by string comparison (for non-standard IDs)
                    try {
                        reservation = await Reservation.findOne({
                            $or: [
                                { _id: reservationId },
                                { reservationId: reservationId }
                            ]
                        });
                    } catch (secondError) {
                        console.error(`DEBUGGING - Error in fallback reservation lookup: ${secondError.message}`);
                    }
                }
                console.log(`DEBUGGING - Found reservation by ID: ${reservation ? 'Yes' : 'No'}`);
            } catch (error) {
                console.error(`DEBUGGING - Error finding reservation: ${error.message}`);
            }
        }

        // Step 3: Update the ticket if we found one
        if (ticket) {
            console.log(`DEBUGGING - Updating ticket ${ticketId}`);

            // Handle ticket update
            try {
                // Ensure the ticket has seat IDs if needed
                if ((!ticket.seatIds || ticket.seatIds.length === 0) &&
                    ticket.ticketInfo && ticket.ticketInfo.selectedSeats &&
                    ticket.ticketInfo.selectedSeats.length > 0) {
                    ticket.seatIds = ticket.ticketInfo.selectedSeats;
                }

                ticket.status = 'confirmed';
                ticket.paymentStatus = 'paid';
                ticket.isPermanent = true;

                // Ensure proper booking ID format
                if (properBookingId && (!ticket.bookingId || !ticket.bookingId.startsWith('BK-'))) {
                    ticket.bookingId = properBookingId;
                } else if (!ticket.bookingId || !ticket.bookingId.startsWith('BK-')) {
                    // Generate a new booking ID if needed
                    const timestamp = Math.floor(Date.now() / 1000);
                    ticket.bookingId = `BK-${timestamp}${Math.floor(Math.random() * 1000)}`;
                    properBookingId = ticket.bookingId;
                }

                await ticket.save();
                console.log(`DEBUGGING - Ticket updated successfully with bookingId: ${ticket.bookingId}`);

                // Update properBookingId from ticket
                properBookingId = ticket.bookingId;
            } catch (error) {
                console.error(`DEBUGGING - Error updating ticket: ${error.message}`);
            }
        }

        // Step 4: Handle seat updates if we have a ticket or reservation
        let seatIds = [];
        let busId = null;

        if (reservation) {
            seatIds = reservation.seatIds || [];
            busId = reservation.busId;
        } else if (ticket) {
            seatIds = ticket.ticketInfo?.selectedSeats || ticket.seatIds || [];
            busId = ticket.busId || ticket.ticketInfo?.busId;
        }

        console.log(`DEBUGGING - Seat update info: ${seatIds.length} seats, busId: ${busId}`);

        // Skip seat updates if we don't have necessary info
        if (seatIds.length > 0 && busId) {
            try {
                // Sanitize seat IDs - ensure they're all valid strings
                const sanitizedSeatIds = seatIds.map(id => {
                    if (id && typeof id === 'object' && id.toString) {
                        return id.toString();
                    }
                    return String(id);
                }).filter(id => id && id.length > 0);

                console.log(`DEBUGGING - Sanitized ${sanitizedSeatIds.length} seat IDs for update`);

                // First, check if these seats actually exist
                const existingSeats = await Seat.find({
                    $or: [
                        { _id: { $in: sanitizedSeatIds } },
                        { seatId: { $in: sanitizedSeatIds }, busId: busId }
                    ]
                });

                console.log(`DEBUGGING - Found ${existingSeats.length} existing seats`);

                if (existingSeats.length > 0) {
                    // Update only seats that actually exist
                    const existingSeatIds = existingSeats.map(seat => seat._id.toString());

                    await Seat.updateMany(
                        { _id: { $in: existingSeatIds } },
                        {
                            $set: {
                                status: 'booked',
                                isPermanentlyBooked: true,
                                ticketId: ticketId || null,
                                bookingId: properBookingId || null
                            }
                        }
                    );
                    console.log(`DEBUGGING - Updated ${existingSeatIds.length} seats to permanently booked`);
                } else {
                    console.log(`DEBUGGING - No existing seats found to update`);
                }
            } catch (error) {
                console.error(`DEBUGGING - Error updating seats: ${error.message}`);
                // Continue execution even if seat update fails
            }
        }

        // Step 5: Update the reservation if it exists
        if (reservation) {
            try {
                reservation.isPermanent = true;
                reservation.expiry = null;

                if (ticketId) {
                    reservation.ticketId = ticketId;
                }

                if (properBookingId && (!reservation.bookingId || !reservation.bookingId.startsWith('BK-'))) {
                    reservation.bookingId = properBookingId;
                }

                await reservation.save();
                console.log(`DEBUGGING - Reservation updated successfully`);
            } catch (error) {
                console.error(`DEBUGGING - Error updating reservation: ${error.message}`);
                // Continue execution even if reservation update fails
            }
        }

        // Return success with the proper booking ID
        console.log(`DEBUGGING - Returning success response with bookingId: ${properBookingId}`);
        return res.status(200).json({
            success: true,
            message: ticket ? 'Ticket confirmed successfully' : (reservation ? 'Reservation confirmed permanently' : 'Confirmation partially successful'),
            bookingId: properBookingId || (ticket ? ticket.bookingId : (reservation ? reservation.bookingId : bookingId))
        });

    } catch (error) {
        console.error('DEBUGGING - Critical error in confirmReservation:', error);
        console.error('DEBUGGING - Error stack:', error.stack);
        console.error('DEBUGGING - Request params:', { reservationId, ticketId, bookingId });

        // Try to get booking ID from ticket if available
        let finalBookingId = bookingId;
        try {
            if (ticketId) {
                const Ticket = mongoose.model('Ticket');
                const ticket = await Ticket.findById(ticketId);
                if (ticket && ticket.bookingId) {
                    finalBookingId = ticket.bookingId;
                }
            }
        } catch (lookupError) {
            console.error('Error looking up booking ID:', lookupError);
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to confirm reservation',
            error: error.message,
            bookingId: finalBookingId
        });
    }
}; 