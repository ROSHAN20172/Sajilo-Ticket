import React, { useRef, useEffect, useState, useContext } from 'react'
import TopLayout from '../../../layout/toppage/TopLayout'
import RootLayout from '../../../layout/RootLayout'
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './companyinvoice/CompanyInvoice';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { UserAppContext } from '../../../context/UserAppContext';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

const Invoice = () => {
  const invoiceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(UserAppContext);
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);

        // Check if we have ticket ID and paymentVerified flag from location state
        if (location.state?.ticketId && location.state?.paymentVerified) {
          // Use the invoice data from location state if available
          if (location.state?.invoiceData) {
            setInvoiceData(location.state.invoiceData);
            generateQrCodeData(location.state.invoiceData);
            setLoading(false);
            return;
          }

          // Fetch invoice data if not available in location state
          const ticketId = location.state.ticketId;
          const response = await axios.get(`${backendUrl}/api/payment/invoice/${ticketId}`);

          if (response.data.success) {
            setInvoiceData(response.data.invoiceData);
            generateQrCodeData(response.data.invoiceData);
          } else {
            setError('Failed to fetch invoice data.');
            toast.error('Failed to fetch invoice data.');
          }
        }
        // Check if we have a ticket ID in localStorage (for cases when user refreshes the page)
        else if (localStorage.getItem('ticketId') && localStorage.getItem('paymentVerified') === 'true') {
          const ticketId = localStorage.getItem('ticketId');
          const response = await axios.get(`${backendUrl}/api/payment/invoice/${ticketId}`);

          if (response.data.success) {
            setInvoiceData(response.data.invoiceData);
            generateQrCodeData(response.data.invoiceData);
          } else {
            setError('Failed to fetch invoice data.');
            toast.error('Failed to fetch invoice data.');
          }
        }
        // No verified payment or ticket ID found
        else {
          setError('No valid ticket found. Please complete your payment first.');
          toast.error('No valid ticket found. Please complete your payment first.');

          // Redirect after a short delay
          setTimeout(() => {
            navigate('/bus-tickets');
          }, 3000);
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        setError('Failed to fetch invoice data. Please try again later.');
        toast.error('Failed to fetch invoice data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [location.state, backendUrl, navigate]);

  // Generate QR code data from invoice data
  const generateQrCodeData = (data) => {
    if (!data) return;

    // Create a simpler ticket information string with key details
    const qrData = `Booking ID: ${data.bookingId || 'N/A'}
Passenger: ${data.passengerName || 'N/A'}
Journey: ${data.fromLocation || 'N/A'} to ${data.toLocation || 'N/A'}
Date: ${data.journeyDate ? new Date(data.journeyDate).toLocaleDateString() : 'N/A'}
Bus Name: ${data.busName || 'N/A'}
Bus No.: ${data.busNumber || 'N/A'}
Departure at: ${data.departureTime || 'N/A'}
Arrive at: ${data.arrivalTime || 'N/A'}
Seats: ${Array.isArray(data.selectedSeats) ? data.selectedSeats.join(', ') : data.selectedSeats || 'N/A'}
Total Price: NPR ${data.totalPrice || 0}
Pickup: ${data.pickupPoint || 'N/A'}
Drop: ${data.dropPoint || 'N/A'}
Status: Paid`;

    // Use the formatted string directly instead of JSON
    setQrCodeData(qrData);
  };

  const handleDownload = async () => {
    if (invoiceRef.current === null) return;

    try {
      // Convert the invoice to an image
      const dataUrl = await toPng(invoiceRef.current);

      // download the image
      download(dataUrl, "Bus Ticket Invoice.png");
    } catch (error) {
      console.error("Error while downloading the invoice", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className='w-full space-y-12 pb-16'>
        <TopLayout
          bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
          title={"Collecting your invoice"}
        />
        <RootLayout className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="large" />
            <p className="text-lg text-neutral-700">Loading your invoice...</p>
          </div>
        </RootLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full space-y-12 pb-16'>
        <TopLayout
          bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
          title={"Invoice Error"}
        />
        <RootLayout className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md p-8 bg-white rounded-2xl shadow-md">
            <div className="text-red-500 text-6xl">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="text-2xl font-bold text-red-600">Invoice Not Available</h2>
            <p className="text-lg text-neutral-600">{error}</p>
            <button
              onClick={() => navigate('/bus-tickets')}
              className="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Bus Tickets
            </button>
          </div>
        </RootLayout>
      </div>
    );
  }

  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
        title={"Collect your invoice"}
      />

      <RootLayout className="space-y-12 w-full pb-16">
        <div className="w-full flex items-center justify-center">
          {/* Invoice card */}
          <div
            ref={invoiceRef} //refere to the invoice card
            className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
          >
            {/* Left side for passenger */}
            <PassengerInvoice data={{ ...invoiceData, qrCodeData: qrCodeData }} />

            {/* Right side for company */}
            <CompanyInvoice data={{ ...invoiceData, qrCodeData: qrCodeData }} />

            {/* Cut circle */}
            <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50 border border-neutral-50" />

            <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50 border border-neutral-50" />
          </div>
        </div>

        {/* Download Invoice card button */}
        <div className="w-full flex justify-center items-center">
          <button
            onClick={handleDownload}
            className="w-fit px-8 h-14 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary text-neutral-50 font-bold text-lg rounded-lg flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
            Download Invoice
          </button>
        </div>
      </RootLayout>
    </div>
  )
}

export default Invoice