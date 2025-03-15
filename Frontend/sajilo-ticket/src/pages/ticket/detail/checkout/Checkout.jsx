import React from 'react'
import PassengerData from './passengerdata/PassengerData'
import TopLayout from '../../../../layout/toppage/TopLayout'
import RootLayout from '../../../../layout/RootLayout'
import BookingStatus from './bookingstatus/BookingStatus'

const Checkout = () => {
  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
        title={"Checkout"}
      />

      <RootLayout className="space-y-12 w-full pb-16">
        <div className="w-full grid grid-cols-7 items-start gap-44 relative">

            {/* Passenger Detail */}
            <PassengerData />

            {/* Ticket Report Status */}
            <BookingStatus />
            
        </div>
      </RootLayout>
    </div>
  )
}

export default Checkout
