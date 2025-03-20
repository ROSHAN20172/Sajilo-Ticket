import React from 'react'
import { FaPhone } from 'react-icons/fa6'

const CompanyInvoice = () => {
    return (
        <div className='w-full col-span-1 border-dashed border-l-2 border-neutral-400 relative'>
            <div className="w-full bg-primary px-4 py-5 rounded-tr-3xl">
                <h1 className="text-2xl text-neutral-50 font-bold text-center">
                    Bus Ticket
                </h1>
            </div>

            <div className="w-full px-4 py-7 space-y-1">
                <p className="text-sm text-neutral-600 font-normal">
                    Bill No.: 1234
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Bus No.: Ba. 2 Kha 1234
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Date: 2025-02-12
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Name: Roshan Shah
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    From: Kathmandu <span className="text-xs">(Kalanki)</span>
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    To: Janakpur <span className="text-xs">(Ramanand Chowk)</span>
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Dept. Time: 06:30 PM
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Seat No.: A1, A2, B1, B2
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Total Passenger: 4
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Total Price: NPR 8000
                </p>
            </div>

            {/* Right bottom section */}
            <div className="w-full bg-primary absolute bottom-0 right-0 rounded-br-3xl flex items-center justify-center px-5 py-1.5">
                <div className="flex items-center gap-x-2">
                    <FaPhone className='w-3 h-3 text-neutral-100' />
                    <p className="text-sm text-neutral-100 font-light">
                        +977-9800000000
                    </p>
                </div>
            </div>

        </div>
    )
}

export default CompanyInvoice
