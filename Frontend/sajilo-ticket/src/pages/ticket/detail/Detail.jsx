import React from 'react'
import TopLayout from '../../../layout/toppage/TopLayout'
import RootLayout from '../../../layout/RootLayout'
import { Link } from 'react-router-dom'
import WarningAlert from '../../../components/alertmessage/WarningAlert'
import BusSeat from './seat/busseat/BusSeat'
import ToggleBtn from '../../../components/togglebtn/ToggleBtn'
import Amenities from './seat/amenities/Amenities'
import ReservationPolicy from './reservationpolicy/ReservationPolicy'
import BusImage from './busimage/BusImage'

const Detail = () => {

  //show the warning message box
  const message = (
    <>
      one individual only can book 10 seats. if you want to book more than 10 seats.
      please <Link to={"/support-team"} className='text-yellow-700 font-medium'>Contact our support team.</Link>
    </>
  );

  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        // bgImg={bus}
        bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
        title={"Bus Details"}
      />

      <RootLayout className="space-y-12 w-full pb-16">

        {/* Seat Layout and selection action detail */}
        <div className="w-full space-y-8">

          {/* warning message */}
          <WarningAlert message={message} />

          {/* Seat layout */}
          <BusSeat />

        </div>

        {/* Bus Detail */}
        <div className="w-full flex items-center justify-center flex-col gap-8 text-center">

          {/* Short Description about the bus */}
          <p className="text-base text-neutral-500 font-normal text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
            sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam,
            nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,
            vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
            <span className='text-lg to-neutral-600 font-medium ml-2'>
              Want to see more about the bus?
            </span>
          </p>

          {/* Button */}
          <div className="w-full flex items-center justify-center gap-6 flex-col">

            <ToggleBtn
              buttonText={"See Bus Details"}
              buttonTextHidden={"Hide Bus Details"}
            >
              <div className="w-full space-y-10">

                {/* Reservation policy and amenities */}
                <div className="w-full grid grid-cols-7 gap-20">

                  {/* Amenities */}
                  <Amenities />

                  {/* Reservation policy */}
                  <ReservationPolicy />

                </div>

                {/* Bus images */}
                <BusImage />

              </div>

            </ToggleBtn>

          </div>

        </div>

      </RootLayout>
    </div>
  )
}

export default Detail
