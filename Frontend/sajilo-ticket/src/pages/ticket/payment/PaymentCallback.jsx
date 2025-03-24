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

    const verifyPayment = async (pidx, status, purchase_order_id) => {
        try {
            setLoading(true);
            setVerificationAttempted(true);

            // Check if reservation has expired
            const expiryTime = localStorage.getItem('reservationExpiry');
            if (expiryTime && new Date(expiryTime) < new Date()) {
                // Reservation expired
                setStatus('failed');
                toast.error('Your reservation has expired. Please try again.');
                releaseReservation();
                setTimeout(() => {
                    navigate('/bus-tickets');
                }, 2000);
                return;
            }

            const reservationId = localStorage.getItem('reservationId');
            if (!reservationId) {
                setStatus('failed');
                toast.error('Reservation information is missing.');
                setTimeout(() => {
                    navigate('/bus-tickets');
                }, 2000);
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
                setTicketId(response.data.ticketId);
                setStatus('success');
                // Store verification state
                localStorage.setItem('paymentVerified', 'true');
                localStorage.setItem('ticketId', response.data.ticketId);
                toast.success('Payment successful! Redirecting to your ticket.');

                // Redirect to invoice page after a short delay
                setTimeout(() => {
                    navigate('/bus-tickets/invoice', {
                        state: {
                            ticketId: response.data.ticketId,
                            invoiceData: response.data.invoiceData,
                            paymentVerified: true
                        }
                    });
                }, 2000);
            } else {
                // Payment verification failed
                setStatus('failed');
                releaseReservation();
                toast.error(response.data.message || 'Payment verification failed.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('failed');
            releaseReservation();
            toast.error('Failed to verify payment. Please contact support.');
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
                            <p className="text-neutral-500">Please try again or contact support.</p>
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