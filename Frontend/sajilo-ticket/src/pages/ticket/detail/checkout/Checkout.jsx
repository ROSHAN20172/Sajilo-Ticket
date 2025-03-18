import React, { createContext, useState, useEffect } from 'react'
import PassengerData from './passengerdata/PassengerData'
import TopLayout from '../../../../layout/toppage/TopLayout'
import RootLayout from '../../../../layout/RootLayout'
import BookingStatus from './bookingstatus/BookingStatus'
import { useLocation } from 'react-router-dom'

// Create a context for sharing checkout data
export const CheckoutContext = createContext()

const Checkout = () => {
  const location = useLocation();
  const [checkoutData, setCheckoutData] = useState({
    pickupPointId: '',
    dropPointId: '',
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    alternatePhone: ''
  });

  // Extract booking data from state passed from BusSeat component
  // Now the data is directly in location.state, not nested under bookingData
  const bookingData = location.state || {};

  // Log received data for debugging
  useEffect(() => {

    if (!bookingData.busId || !bookingData.selectedSeats) {
    }
  }, [location.state, bookingData]);

  // Function to update checkout data
  const updateCheckoutData = (newData) => {
    setCheckoutData(prev => ({ ...prev, ...newData }));
  };

  // Context value to be shared with child components
  const contextValue = {
    bookingData,
    checkoutData,
    updateCheckoutData
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      <div className='w-full space-y-12 pb-16'>
        {/* Top Layout */}
        <TopLayout
          bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
          title={"Checkout"}
        />

        <RootLayout className="space-y-12 w-full pb-16">
          {!bookingData || !bookingData.busId ? (
            <div className="w-full text-center py-10">
              <h2 className="text-xl text-neutral-700 font-medium">
                No booking information available. Please select seats first.
              </h2>
            </div>
          ) : (
            <div className="w-full grid grid-cols-7 items-start gap-44 relative">
              {/* Passenger Detail */}
              <PassengerData />

              {/* Ticket Report Status */}
              <BookingStatus />
            </div>
          )}
        </RootLayout>
      </div>
    </CheckoutContext.Provider>
  )
}

export default Checkout
