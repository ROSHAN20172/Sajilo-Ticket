import React from 'react'
import TicketCard from '../../../components/ticket/TicketCard'
import { FaBus } from 'react-icons/fa6'
import { GrRefresh } from 'react-icons/gr'

const SearchResult = () => {
  return (
    <div className='w-full col-span-3 space-y-10 pt-11'>

      <div className="space-y-6">

        <TicketCard icon={FaBus} busName={"Sworgadwari Deluxe"} routeFrom={"Kathmandu"} routeTo={"Pyuthan"} arrivalTime={"06:00 PM"} departureTime={"06:30 PM"} price={"1200"} availableSeats={"5"} />
        <TicketCard icon={FaBus} busName={"Sworgadwari Deluxe"} routeFrom={"Kathmandu"} routeTo={"Pyuthan"} arrivalTime={"06:00 PM"} departureTime={"06:30 PM"} price={"1200"} availableSeats={"5"} />
        <TicketCard icon={FaBus} busName={"Sworgadwari Deluxe"} routeFrom={"Kathmandu"} routeTo={"Pyuthan"} arrivalTime={"06:00 PM"} departureTime={"06:30 PM"} price={"1200"} availableSeats={"5"} />
        <TicketCard icon={FaBus} busName={"Sworgadwari Deluxe"} routeFrom={"Kathmandu"} routeTo={"Pyuthan"} arrivalTime={"06:00 PM"} departureTime={"06:30 PM"} price={"1200"} availableSeats={"5"} />
        <TicketCard icon={FaBus} busName={"Sworgadwari Deluxe"} routeFrom={"Kathmandu"} routeTo={"Pyuthan"} arrivalTime={"06:00 PM"} departureTime={"06:30 PM"} price={"1200"} availableSeats={"5"} />

      </div>

      <div className="w-full flex items-center justify-center">
        <button className="w-fit px-8 py-3 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-base font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
          <GrRefresh />
          Load More
        </button>
      </div>

    </div>
  )
}

export default SearchResult
