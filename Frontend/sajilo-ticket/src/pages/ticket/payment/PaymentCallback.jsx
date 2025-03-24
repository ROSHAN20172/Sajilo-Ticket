import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing');
    const [ticketId, setTicketId] = useState(null);
    const [bookingId, setBookingId] = useState('');
    const [verificationAttempted, setVerificationAttempted] = useState(false);

    useEffect(() => {
        // Parse the URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const pidx = searchParams.get('pidx');
        const status = searchParams.get('status');
        const purchase_order_id = searchParams.get('purchase_order_id');

        if (!pidx) {
            toast.error('Invalid payment response. Missing transaction identifier.');
            setStatus('failed');
            setLoading(false);
            // Release reservation if payment was initiated
            releaseReservation();
            return;
        }

        // Only verify payment if it hasn't been attempted yet
        if (!verificationAttempted) {
            verifyPayment(pidx, status, purchase_order_id);
        }
    }, [location, backendUrl, navigate, verificationAttempted]);

    // Release reservation if payment failed
    const releaseReservation = async () => {
        try {
            const reservationId = localStorage.getItem('reservationId');
            if (reservationId) {
                await axios.post(`${backendUrl}/api/reservation/release`, {
                    reservationId
                });
                console.log('Reservation released');
            }
        } catch (error) {
            console.error('Error releasing reservation:', error);
        } finally {
            // Clear storage
            localStorage.removeItem('paymentInitiated');
            localStorage.removeItem('paymentVerified');
            localStorage.removeItem('paymentData');
            localStorage.removeItem('reservationId');
            localStorage.removeItem('reservationExpiry');
        }
    };

    // Mark reservation as confirmed (permanent) after successful payment
    const confirmReservation = async (ticketId, bookingId) => {
        try {
            // Prevent duplicate confirmations
            const alreadyConfirmed = localStorage.getItem('confirmationAttempted');
            if (alreadyConfirmed === 'true') {
                console.log("Confirmation already attempted, using booking ID:", bookingId);
                return bookingId;
            }

            // Mark that we've attempted confirmation
            localStorage.setItem('confirmationAttempted', 'true');

            console.log("Starting reservation confirmation process with ticketId:", ticketId, "bookingId:", bookingId);
            const reservationId = localStorage.getItem('reservationId');

            // Validate the payload data before sending
            const payload = {};

            if (ticketId && typeof ticketId === 'string' && ticketId.trim() !== '') {
                payload.ticketId = ticketId.trim();
            }

            if (bookingId && typeof bookingId === 'string' && bookingId.trim() !== '') {
                payload.bookingId = bookingId.trim();
            }

            if (reservationId && typeof reservationId === 'string' && reservationId.trim() !== '') {
                payload.reservationId = reservationId.trim();
                console.log("Including reservationId in confirmation request:", reservationId);
            } else {
                console.log("No reservationId found in localStorage");
            }

            // Only proceed if we have at least one valid identifier
            if (Object.keys(payload).length === 0) {
                console.log("No valid identifiers available for confirmation");
                return bookingId;
            }

            // Add a timeout to the request and handle race conditions
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            try {
                const response = await axios.post(`${backendUrl}/api/reservation/confirm`, payload, {
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                console.log('Reservation confirmation API response:', response.data);

                // If server returns a booking ID (in BK format), use it
                if (response.data && response.data.bookingId && response.data.bookingId.startsWith('BK-')) {
                    console.log("Using booking ID from API response:", response.data.bookingId);
                    return response.data.bookingId;
                }
            } catch (requestError) {
                clearTimeout(timeoutId);

                if (requestError.name === 'AbortError' || requestError.code === 'ECONNABORTED') {
                    console.error('Confirmation request timed out after 15 seconds');
                } else {
                    console.error('Error during confirmation request:', requestError);
                }

                // Try to extract booking ID from error response if available
                if (requestError.response && requestError.response.data && requestError.response.data.bookingId) {
                    console.log("Using booking ID from error response:", requestError.response.data.bookingId);
                    return requestError.response.data.bookingId;
                }

                // If we get here, just use the original booking ID
                throw requestError;
            }

            console.log("Using original booking ID:", bookingId);
            return bookingId; // Return original booking ID if API didn't return a new one
        } catch (error) {
            console.error('Error confirming reservation:', error);

            // Try to extract booking ID from error response if available
            if (error.response && error.response.data && error.response.data.bookingId) {
                console.log("Using booking ID from error response:", error.response.data.bookingId);
                return error.response.data.bookingId;
            }

            console.log("Falling back to original booking ID after error:", bookingId);
            return bookingId; // Return original booking ID on error
        }
    };

    const verifyPayment = async (pidx, status, purchase_order_id) => {
        try {
            setLoading(true);
            setVerificationAttempted(true);

            // Check if reservation has expired
            const expiryTime = localStorage.getItem('reservationExpiry');
            if (expiryTime && new Date(expiryTime) < new Date()) {
                // Reservation expired
                setStatus('failed');

                // Get the latest booking ID from the ticket by API first
                try {
                    // First directly check for ticket using the purchase_order_id
                    if (purchase_order_id) {
                        console.log('Fetching ticket by order ID:', purchase_order_id);
                        const ticketByOrderResponse = await axios.get(`${backendUrl}/api/payment/ticket-by-order/${purchase_order_id}`);
                        if (ticketByOrderResponse.data.success &&
                            ticketByOrderResponse.data.ticket &&
                            ticketByOrderResponse.data.ticket.bookingId) {
                            setBookingId(ticketByOrderResponse.data.ticket.bookingId);
                            console.log('Set booking ID from ticket by order:', ticketByOrderResponse.data.ticket.bookingId);
                            toast.error('Your reservation has expired. Please try again.');
                            setTimeout(() => {
                                releaseReservation();
                            }, 500);
                            return;
                        }
                    }

                    // Then try from localStorage
                    const ticketId = localStorage.getItem('ticketId');
                    if (ticketId) {
                        console.log('Fetching ticket by ID:', ticketId);
                        const ticketResponse = await axios.get(`${backendUrl}/api/payment/ticket/${ticketId}`);
                        if (ticketResponse.data.success &&
                            ticketResponse.data.ticket &&
                            ticketResponse.data.ticket.bookingId) {
                            setBookingId(ticketResponse.data.ticket.bookingId);
                            console.log('Set booking ID from ticket:', ticketResponse.data.ticket.bookingId);
                            toast.error('Your reservation has expired. Please try again.');
                            setTimeout(() => {
                                releaseReservation();
                            }, 500);
                            return;
                        }
                    }

                    // Fallback: Get from payment data in localStorage
                    const paymentData = localStorage.getItem('paymentData');
                    if (paymentData) {
                        try {
                            const parsedData = JSON.parse(paymentData);
                            if (parsedData.bookingId && parsedData.bookingId.startsWith('BK-')) {
                                setBookingId(parsedData.bookingId);
                                console.log('Set booking ID from payment data:', parsedData.bookingId);
                            }
                        } catch (error) {
                            console.error('Error parsing payment data:', error);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching ticket information:', error);
                    // Last resort fallback
                    if (purchase_order_id) {
                        setBookingId(purchase_order_id);
                    }
                }

                toast.error('Your reservation has expired. Please try again.');

                // Show toast with redirect message
                toast.info('Redirecting to bus tickets page in 10 seconds...', {
                    position: "top-right",
                    autoClose: 10000,
                    closeOnClick: false
                });

                setTimeout(() => {
                    releaseReservation();
                    setTimeout(() => {
                        navigate('/bus-tickets');
                    }, 500);
                }, 10000);
                return;
            }

            const reservationId = localStorage.getItem('reservationId');
            if (!reservationId) {
                setStatus('failed');
                // Try to get booking ID from payment data if reservation is missing
                const paymentData = localStorage.getItem('paymentData');
                if (paymentData) {
                    try {
                        const parsedData = JSON.parse(paymentData);
                        if (parsedData.bookingId) {
                            setBookingId(parsedData.bookingId);
                        }
                    } catch (error) {
                        console.error('Error parsing payment data:', error);
                    }
                }
                toast.error('Reservation information is missing.');
                return;
            }

            const response = await axios.post(`${backendUrl}/api/payment/verify`, {
                pidx,
                status,
                purchase_order_id,
                reservationId
            });

            if (response.data.success) {
                // Payment verification successful
                const ticketId = response.data.ticketId;
                const originalBookingId = response.data.bookingId || '';

                // Set these values first so the UI can update
                setTicketId(ticketId);
                setBookingId(originalBookingId);
                setStatus('success');

                // Confirm the reservation permanently BEFORE clearing storage
                try {
                    // Mark payment as completed in localStorage to ensure seats remain booked
                    // even if confirmation API fails
                    localStorage.setItem('paymentCompleted', 'true');
                    localStorage.setItem('paymentTicketId', ticketId);
                    localStorage.setItem('paymentBookingId', originalBookingId);

                    // confirmReservation may return an updated booking ID
                    const confirmedBookingId = await confirmReservation(ticketId, originalBookingId);
                    console.log('Reservation confirmed permanently after payment');

                    // If we got a new booking ID (that starts with 'BK-'), update the state
                    if (confirmedBookingId && confirmedBookingId !== originalBookingId && confirmedBookingId.startsWith('BK-')) {
                        setBookingId(confirmedBookingId);
                    }

                    // Clear all reservation-related data since payment is now complete
                    localStorage.removeItem('paymentInitiated');
                    localStorage.removeItem('paymentData');
                    localStorage.removeItem('reservationId');
                    localStorage.removeItem('reservationExpiry');
                    localStorage.removeItem('confirmationAttempted');
                    localStorage.removeItem('paymentCompleted');
                    localStorage.removeItem('paymentTicketId');
                    localStorage.removeItem('paymentBookingId');

                    // Only store verification state and ticket ID
                    localStorage.setItem('paymentVerified', 'true');
                    localStorage.setItem('ticketId', ticketId);
                    toast.success('Payment successful! Redirecting to your ticket.');

                    // Redirect to invoice page after a short delay
                    setTimeout(() => {
                        navigate('/bus-tickets/invoice', {
                            state: {
                                ticketId: ticketId,
                                invoiceData: response.data.invoiceData,
                                paymentVerified: true
                            }
                        });
                    }, 2000);
                } catch (confirmError) {
                    console.error('Error during reservation confirmation:', confirmError);
                    // Even if confirmation fails, we want to show success to the user
                    // since payment was successful. The backend can handle this case.

                    // Clear all reservation-related data
                    localStorage.removeItem('paymentInitiated');
                    localStorage.removeItem('paymentData');
                    localStorage.removeItem('reservationId');
                    localStorage.removeItem('reservationExpiry');
                    localStorage.removeItem('confirmationAttempted');
                    localStorage.removeItem('paymentCompleted');
                    localStorage.removeItem('paymentTicketId');
                    localStorage.removeItem('paymentBookingId');

                    localStorage.setItem('paymentVerified', 'true');
                    localStorage.setItem('ticketId', ticketId);
                    toast.success('Payment successful! Redirecting to your ticket.');

                    setTimeout(() => {
                        navigate('/bus-tickets/invoice', {
                            state: {
                                ticketId: ticketId,
                                invoiceData: response.data.invoiceData,
                                paymentVerified: true
                            }
                        });
                    }, 2000);
                }
            } else {
                // Payment verification failed
                setStatus('failed');
                if (response.data.bookingId) {
                    setBookingId(response.data.bookingId);
                } else {
                    // Try to get booking ID from payment data if not in response
                    const paymentData = localStorage.getItem('paymentData');
                    if (paymentData) {
                        try {
                            const parsedData = JSON.parse(paymentData);
                            if (parsedData.bookingId) {
                                setBookingId(parsedData.bookingId);
                            }
                        } catch (error) {
                            console.error('Error parsing payment data:', error);
                        }
                    }
                }
                releaseReservation();
                toast.error(response.data.message || 'Payment verification failed.');

                // Show toast with redirect message
                toast.info('Redirecting to bus tickets page in 10 seconds...', {
                    position: "top-right",
                    autoClose: 10000,
                    closeOnClick: false
                });

                // Set timeout for redirection
                setTimeout(() => {
                    navigate('/bus-tickets');
                }, 10000);
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('failed');
            // Try to get booking ID from error response if available
            if (error.response && error.response.data && error.response.data.bookingId) {
                setBookingId(error.response.data.bookingId);
            } else {
                // Try to get booking ID from payment data if not in error response
                const paymentData = localStorage.getItem('paymentData');
                if (paymentData) {
                    try {
                        const parsedData = JSON.parse(paymentData);
                        if (parsedData.bookingId) {
                            setBookingId(parsedData.bookingId);
                        }
                    } catch (error) {
                        console.error('Error parsing payment data:', error);
                    }
                }
            }
            releaseReservation();
            toast.error('Failed to verify payment. Please contact support.');

            // Show toast with redirect message
            toast.info('Redirecting to bus tickets page in 10 seconds...', {
                position: "top-right",
                autoClose: 10000,
                closeOnClick: false
            });

            // Set timeout for redirection
            setTimeout(() => {
                navigate('/bus-tickets');
            }, 10000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Layout */}
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Payment Verification"}
            />

            <RootLayout className="space-y-8 w-full pb-16 min-h-[50vh] flex items-center justify-center">
                <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md text-center space-y-6">
                    {loading ? (
                        <>
                            <LoadingSpinner size="large" />
                            <h2 className="text-xl font-semibold text-neutral-700">Verifying Payment</h2>
                            <p className="text-neutral-500">Please wait while we verify your payment...</p>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <div className="text-green-500 text-6xl">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                            <p className="text-lg text-neutral-600">
                                Your ticket has been booked successfully.
                            </p>
                            <p className="text-neutral-500">Ticket ID: {ticketId}</p>
                            <p className="text-neutral-500">You will be redirected to your ticket shortly...</p>
                        </>
                    ) : status === 'failed' ? (
                        <>
                            <div className="text-red-500 text-6xl">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                            <p className="text-lg text-neutral-600">
                                We were unable to process your payment.
                            </p>
                            {bookingId && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-neutral-700">Booking ID: <span className="font-semibold">{bookingId}</span></p>
                                </div>
                            )}
                            <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-neutral-700">
                                    If you have any issues or questions, please contact our customer support with your Booking ID.
                                </p>
                                <p className="mt-2 text-blue-600 font-medium">
                                    <i className="fas fa-phone-alt mr-2"></i> +977 9800000000
                                </p>
                                <p className="text-blue-600 font-medium">
                                    <i className="fas fa-envelope mr-2"></i> support@sajiloticket.com
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/bus-tickets')}
                                className="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Back to Tickets
                            </button>
                        </>
                    ) : null}
                </div>
            </RootLayout>
        </div>
    );
};

export default PaymentCallback; 