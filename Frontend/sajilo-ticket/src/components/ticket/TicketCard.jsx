import React from 'react'
import { Link } from 'react-router-dom';
import { FaBus, FaStar } from 'react-icons/fa6'
import { TbAirConditioning } from 'react-icons/tb'
import { RiVipFill } from 'react-icons/ri'
import { MdOutlineChair } from 'react-icons/md'

const TicketCard = ({ 
  icon: Icon, 
  busName, 
  routeFrom, 
  routeTo, 
  arrivalTime, 
  departureTime, 
  price, 
  availableSeats,
  amenities = [] 
}) => {
  return (
    <div className='w-full rounded-xl p-5 border-2 border-neutral-300 space-y-5'>

      {/* Bus info, Routes */}
      <div className="space-y-5 w-full border-b border-neutral-300/60 pb-4">

        {/* Bus Info */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <FaBus className='h-5 w-5 text-primary' />
            <p className="text-lg text-neutral-700 font-semibold">
              {busName}
            </p>
          </div>

          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-1 bg-neutral-200/65 w-fit rounded-full px-1.5 py-0.5">
              <TbAirConditioning className='w-4 h-4 text-primary' />
              <p className="text-xs text-neutral-600 font-normal">
                AC
              </p>
            </div>

            <div className="flex items-center gap-x-1 bg-neutral-200/65 w-fit rounded-full px-1.5 py-0.5">
              <FaStar className='w-4 h-4 text-yellow-600' />
              <p className="text-xs text-yellow-600 font-normal pt-0.5">
                4.5
              </p>
            </div>

            <div className="flex items-center gap-x-1 bg-neutral-200/65 w-fit rounded-full px-1.5 py-0.5">
              <RiVipFill className='w-4 h-4 text-primary' />
              <p className="text-xs text-neutral-600 font-normal">
                Sofa
              </p>
            </div>

            <div className="flex items-center gap-x-1 bg-neutral-200/65 w-fit rounded-full px-1.5 py-0.5">
              <MdOutlineChair className='w-4 h-4 text-primary -rotate-90' />
              <p className="text-xs text-neutral-600 font-normal">
                35 Seats
              </p>
            </div>
          </div>
        </div>

        {/* Route Section */}
        <div className="space-y-5">
          <div className="w-full flex items-center justify-between gap-x-2.5">
            <h1 className="text-2xl text-neutral-600 font-semibold">
              {arrivalTime}
            </h1>

            <div className="flex-1 border-dashed border border-neutral-300 relative">
              <p className="absolute w-14 h-14 p-0.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 border-dashed border border-neutral-400 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-primary" />
              </p>
            </div>

            <h1 className="text-2xl text-neutral-600 font-semibold">
              {departureTime}
            </h1>
          </div>

          <div className="w-full flex items-center justify-between gap-x-5">
            <p className="text-base text-neutral-500 font-normal">
              {routeFrom}
            </p>
            <p className="text-base text-neutral-500 font-normal">
              {routeTo}
            </p>
          </div>
        </div>

        {/* Amenities Section */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-x-2 flex-wrap">
            {amenities.map((amenity, index) => (
              <span key={index} className="bg-blue-100 px-2 py-1 rounded-full text-xs text-neutral-600">
                {amenity}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Price, Available Seats and Reserve Button */}
      <div className="w-full flex items-center justify-between">
        <h1 className="text-xl text-neutral-700 font-semibold">
          Rs. {price} <span className="text-sm text-neutral-500 font-normal">/ per seat</span>
        </h1>

        <h1 className="text-sm text-neutral-600 font-normal flex items-center justify-center gap-x-1.5">
          <span className="text-lg text-green-700 font-bold pt-0.5">
            {availableSeats} Seats Available
          </span>
        </h1>

        <Link 
          to="/bus-tickets/detail" 
          className="w-fit px-5 py-1.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-sm font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
          Reserve Seat
        </Link>
      </div>
    </div>
  )
}

export default TicketCard;
