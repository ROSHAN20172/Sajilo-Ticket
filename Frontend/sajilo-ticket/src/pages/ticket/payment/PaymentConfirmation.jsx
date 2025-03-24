import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import axios from 'axios';
import { IoTimeOutline } from 'react-icons/io5';

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    const [countdown, setCountdown] = useState('00:00');
    const [paymentData, setPaymentData] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(false);

    // Use refs to store timer and time left to avoid re-renders
    const timerRef = useRef(null);
    const timeLeftRef = useRef(600); // Default 10 minutes in seconds
    // Track toast notifications to prevent duplicates
    const toastDisplayedRef = useRef({
        initial: false,
        fiveMinutes: false,
        twoMinutes: false,
        oneMinute: false
    });

    // Extract data from location state
    const { ticketDetails, passengerInfo, reservation } = location.state || {};

    // Format time as MM:SS (without triggering re-renders)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get color class based on time left (without using state)
    const getTimerColorClass = () => {
        const timeLeft = timeLeftRef.current;
        if (timeLeft < 60) return 'text-red-600'; // Less than 1 minute
        if (timeLeft < 180) return 'text-amber-600'; // Less than 3 minutes
        return 'text-green-600';
    };

    useEffect(() => {
        // Fetch the current reservation status to get the exact remaining time
        const checkReservation = async () => {
            if (!reservation || !reservation.id || !backendUrl) return;

            try {
                const response = await axios.get(`${backendUrl}/api/bus/reservation/${reservation.id}`);
                if (response.data.success) {
                    // Get the server-provided remaining time
                    const remainingTime = response.data.data.timeRemaining;
                    timeLeftRef.current = remainingTime;

                    // Update display once
                    setCountdown(formatTime(remainingTime));

                    // Store the exact expiry time in localStorage for consistency
                    const expiryTime = new Date(Date.now() + remainingTime * 1000);
                    localStorage.setItem('reservationExpiry', expiryTime.toISOString());

                    // Show initial toast notification
                    if (!toastDisplayedRef.current.initial) {
                        toast.info("Please complete your payment before the reservation expires", {
                            position: "top-right",
                            autoClose: 5000
                        });
                        toastDisplayedRef.current.initial = true;
                    }
                } else {
                    // Reservation expired or doesn't exist
                    navigate('/bus-tickets');
                }
            } catch (error) {
                console.error('Error checking reservation:', error);
                navigate('/bus-tickets');
            }
        };

        checkReservation();

        // Set up timer DOM updates outside of React's render cycle to avoid scrolling issues
        const setupTimer = () => {
            // Clear any existing timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Setup timer that updates DOM directly without state updates
            timerRef.current = setInterval(() => {
                // Decrement the time left
                timeLeftRef.current -= 1;

                // Check toast notification thresholds without causing re-renders
                if (timeLeftRef.current === 300 && !toastDisplayedRef.current.fiveMinutes) { // 5 minutes
                    toast.warning("Only 5 minutes left to complete your payment!", {
                        position: "top-right",
                        autoClose: 5000,
                        style: { backgroundColor: '#FEFCE8', color: '#92400E' }
                    });
                    toastDisplayedRef.current.fiveMinutes = true;
                } else if (timeLeftRef.current === 120 && !toastDisplayedRef.current.twoMinutes) { // 2 minutes
                    toast.warning("Only 2 minutes left to complete your payment!", {
                        position: "top-right",
                        autoClose: 5000,
                        style: { backgroundColor: '#FEF3C7', color: '#9A3412' }
                    });
                    toastDisplayedRef.current.twoMinutes = true;
                } else if (timeLeftRef.current === 60 && !toastDisplayedRef.current.oneMinute) { // 1 minute
                    toast.error("FINAL WARNING: Only 1 minute left to complete payment!", {
                        position: "top-right",
                        autoClose: 10000,
                        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: 'bold' }
                    });
                    toastDisplayedRef.current.oneMinute = true;
                }

                // Direct DOM updates instead of state changes to avoid re-renders
                const timerElement = document.getElementById('reservation-timer');
                if (timerElement) {
                    timerElement.textContent = formatTime(timeLeftRef.current);

                    // Update color class directly
                    timerElement.className = `font-bold text-xl ${getTimerColorClass()}`;
                }

                // Check if time expired
                if (timeLeftRef.current <= 0) {
                    clearInterval(timerRef.current);
                    toast.error("Your reservation time has expired. Please try booking again.", {
                        position: "top-right",
                        autoClose: 5000
                    });
                    releaseReservation();
                }
            }, 1000);
        };

        // Start the timer
        setupTimer();

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [reservation, backendUrl, navigate]);

    useEffect(() => {
        initiatePayment();
    }, [backendUrl, ticketDetails, passengerInfo, reservation]);

    const releaseReservation = async () => {
        try {
            if (reservation && reservation.id) {
                await axios.post(`${backendUrl}/api/reservation/release`, {
                    reservationId: reservation.id
                });
            }
            navigate('/bus-tickets');
        } catch (error) {
            console.error('Error releasing reservation:', error);
            navigate('/bus-tickets');
        }
    };

    const initiatePayment = async () => {
        try {
            // Don't attempt if we don't have required data
            if (!ticketDetails?.totalPrice || !reservation?.id || !passengerInfo?.name || !backendUrl) {
                return;
            }

            setLoading(true);

            // Create an object with the data needed for payment
            const paymentData = {
                amount: ticketDetails.totalPrice,
                reservationId: reservation.id,
                passengerInfo: {
                    name: passengerInfo.name,
                    email: passengerInfo.email,
                    phone: passengerInfo.phone,
                    alternatePhone: passengerInfo.alternatePhone,
                },
                ticketInfo: {
                    busId: ticketDetails.busId,
                    busName: ticketDetails.busName,
                    busNumber: ticketDetails.busNumber,
                    fromLocation: ticketDetails.fromLocation,
                    toLocation: ticketDetails.toLocation,
                    departureTime: ticketDetails.departureTime,
                    arrivalTime: ticketDetails.arrivalTime,
                    selectedSeats: ticketDetails.selectedSeats,
                    pickupPoint: ticketDetails.pickupPoint,
                    dropPoint: ticketDetails.dropPoint,
                    date: ticketDetails.date || location.state?.date,
                },
                pickupPointId: passengerInfo.pickupPointId,
                dropPointId: passengerInfo.dropPointId,
            };

            // Send request to backend to initiate Khalti payment
            const response = await axios.post(`${backendUrl}/api/payment/initiate`, paymentData);

            // If successful, store payment URL but don't redirect yet
            if (response.data.success) {
                setPaymentData(paymentData);
                setPaymentUrl(response.data.paymentUrl);
                setBookingId(response.data.bookingId || '');

                // Store payment state in localStorage
                localStorage.setItem('paymentInitiated', 'true');
                localStorage.setItem('paymentData', JSON.stringify(paymentData));
                localStorage.setItem('reservationId', reservation.id);
            } else {
                toast.error(response.data.message || 'Payment initiation failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            if (error.response) {
                console.log('Error response data:', error.response.data);
                toast.error(error.response.data.message || 'Payment service error. Please try again.');
            } else {
                toast.error('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = () => {
        // Only redirect to payment URL if we have one
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            toast.error('Payment gateway not available. Please try again.');
        }
    };

    return (
        <div className='w-full space-y-12 pb-16'>
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Confirm Your Payment"}
            />

            <RootLayout className="space-y-8 w-full pb-16">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-bold text-neutral-800">Booking Confirmation</h2>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Booking ID</p>
                                <p className="font-medium text-primary">{bookingId}</p>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="bg-neutral-100 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <IoTimeOutline className="text-xl mr-2" />
                                <p className="font-medium text-neutral-700">Reservation expires in:</p>
                            </div>
                            <p id="reservation-timer" className={`font-bold text-xl ${getTimerColorClass()}`}>{countdown}</p>
                        </div>
                        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded mt-2">
                            <p className="text-amber-800 font-semibold flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Please complete your payment before the reservation expires
                            </p>
                        </div>

                        {/* Journey Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-700">Journey Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">From</p>
                                    <p className="font-medium">{ticketDetails?.fromLocation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">To</p>
                                    <p className="font-medium">{ticketDetails?.toLocation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{new Date(ticketDetails?.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium">{ticketDetails?.departureTime}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Bus</p>
                                    <p className="font-medium">{ticketDetails?.busName} ({ticketDetails?.busNumber})</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Seats</p>
                                    <p className="font-medium">{Array.isArray(ticketDetails?.selectedSeats) ? ticketDetails.selectedSeats.join(', ') : ticketDetails?.selectedSeats}</p>
                                </div>
                            </div>
                        </div>
                        <hr className="my-4 border-gray-300" />

                        {/* Pickup/Drop Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-700">Pickup & Drop Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Pickup Point</p>
                                    <p className="font-medium">{ticketDetails?.pickupPoint}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Drop Point</p>
                                    <p className="font-medium">{ticketDetails?.dropPoint}</p>
                                </div>
                            </div>
                        </div>
                        <hr className="my-4 border-gray-300" />

                        {/* Passenger Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-700">Passenger Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{passengerInfo?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{passengerInfo?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{passengerInfo?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-neutral-50 p-4 rounded-lg border-t border-b border-neutral-200">
                            <div className="flex items-center justify-between font-bold">
                                <p className="text-lg">Total Amount</p>
                                <p className="text-xl text-primary">NPR {ticketDetails?.totalPrice}</p>
                            </div>
                        </div>

                        {/* Pay Now Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handlePayNow}
                                disabled={loading || !paymentUrl}
                                className="w-full max-w-md h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg flex items-center justify-center gap-x-2 disabled:bg-gray-400"
                            >
                                {loading ? 'Preparing Payment...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </RootLayout>
        </div>
    );
};

export default PaymentConfirmation;