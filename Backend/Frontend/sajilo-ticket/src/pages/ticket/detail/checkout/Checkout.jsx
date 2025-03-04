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
        bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
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
