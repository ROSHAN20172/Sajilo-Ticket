import React from 'react'
import { FaPhone } from 'react-icons/fa6'

const CompanyInvoice = ({ data }) => {
    // Format date to display in a readable format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Format time to display in 12-hour format
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(`2000-01-01T${timeString}`);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Join seat numbers with commas
    const formatSeats = (seats) => {
        if (!seats || !Array.isArray(seats)) return '';
        return seats.join(', ');
    };

    return (
        <div className='w-full col-span-1 border-dashed border-l-2 border-neutral-400 relative'>
            <div className="w-full bg-primary px-4 py-5 rounded-tr-3xl">
                <h1 className="text-2xl text-neutral-50 font-bold text-center">
                    Bus Ticket
                </h1>
            </div>

            <div className="w-full px-4 py-7 space-y-1">
                <p className="text-sm text-neutral-600 font-normal">
                    Bill No.: {data?.bookingId || data?.ticketId || data?.invoiceNumber || 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Bus No.: {data?.busNumber || 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Date: {formatDate(data?.journeyDate) || 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Name: {data?.passengerName || 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    From: {data?.fromLocation || 'N/A'}
                    {data?.pickupPoint && <span className="text-xs"> ({data.pickupPoint})</span>}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    To: {data?.toLocation || 'N/A'}
                    {data?.dropPoint && <span className="text-xs"> ({data.dropPoint})</span>}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Dept. Time: {formatTime(data?.departureTime) || 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Seat No.: {formatSeats(data?.selectedSeats) || 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Total Passenger: {data?.selectedSeats?.length || 0}
                </p>
                <p className="text-sm text-neutral-600 font-normal">
                    Total Price: NPR {data?.totalPrice || 0}
                </p>
            </div>

            {/* Right bottom section */}
            <div className="w-full bg-primary absolute bottom-0 right-0 rounded-br-3xl flex items-center justify-center px-5 py-1.5">
                <div className="flex items-center gap-x-2">
                    <FaPhone className='w-3 h-3 text-neutral-100' />
                    <p className="text-sm text-neutral-100 font-light">
                        {data?.contactPhone?.split(',')[0] || '+977-9800000000'}
                    </p>
                </div>
            </div>

        </div>
    )
}

export default CompanyInvoice
