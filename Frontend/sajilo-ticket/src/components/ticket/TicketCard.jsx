import React from 'react'
import { FaBus, FaStar } from 'react-icons/fa6'
import { TbAirConditioning } from 'react-icons/tb'

const TicketCard = ({ icon: Icon, busName, routeFrom, routeTo, arrivalTime, price, availableSeats }) => {
    return (
        <div className='w-full rounded-xl p-5 border-2 border-neutral-300 space-y-4'>

            <div className="space-y-5 w-full border-b border-neutral-300/60 pb-4">

                {/* Route */}
                <div className="space-y-0">

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
                        </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-0.5">
                        <p className="text-xs text-neutral-400 font-normal">From</p>
                        <p className="text-xs text-neutral-400 font-normal">To</p>
                    </div>

                </div>

            </div>

            {/* price, available seats, and reservee button */}
            <div className="w-full flex items-center justify-between">
                {/* price */}
                <h1 className="text-xl text-neutral-700 font-semibold">
                    Rs. {price}
                </h1>

                <button className="w-fit px-5 py-1.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-sm font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
                    Reserve Seat
                </button>

            </div>
        </div >
    )
}

export default TicketCard
