import React from 'react'
import { FaCircleCheck, FaPhone } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { QRCodeSVG } from 'qrcode.react';

import BusImg from "../../../../assets/bus.png"
import QrImg from "../../../../assets/QrImg.jpg"

const PassengerInvoice = ({ data }) => {
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
        <div className='w-full col-span-4 rounded-3xl relative'>

            {/* Top bus detail */}
            <div className="w-full flex items-center justify-between bg-primary px-6 py-3 rounded-tl-3xl">
                <div className="flex items-center gap-x-3">
                    <img src={BusImg} alt="bus img" className='w-auto h-12 object-cover object-center' />
                    <h1 className="text-xl text-neutral-50 font-bold uppercase tracking-wider pt-1">
                        {data?.busName || 'Bus Name'}
                    </h1>
                </div>

                <div className="flex items-center gap-x-2">
                    <p className="text-xl text-neutral-50 font-bold">
                        <span className='text-lg'>(Bus No.)</span>
                        {data?.busNumber || 'Bus Number'}
                    </p>
                </div>
            </div>

            <div className="w-full grid grid-cols-5 gap-8 items-center px-5 py-7 mb-7">

                <div className="col-span-4 space-y-3.5">

                    {/* Billno, seat and date */}
                    <div className="w-full flex items-center justify-between border-dashed border-b-2 border-neutral-200 pb-3">
                        <p className="text-base text-neutral-500 font-normal">
                            Bill No.: {data?.bookingId || data?.ticketId || data?.invoiceNumber || 'N/A'}
                        </p>
                        <p className="text-base text-neutral-500 font-normal">
                            NPR {data?.pricePerSeat || 0} <span className='text-xs'>/seat</span>
                        </p>
                        <p className="text-base text-neutral-500 font-normal">
                            Date: {formatDate(data?.journeyDate) || 'N/A'}
                        </p>
                    </div>

                    {/* Passenger detail */}
                    <div className="w-full flex items-center justify-between">
                        <div className="space-y-1.5">
                            <p className="text-base text-neutral-600 font-normal">
                                Name of Passenger:
                                <span className="font-medium"> {data?.passengerName || 'N/A'}</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Total Seat No.:
                                <span className="font-medium"> {formatSeats(data?.selectedSeats) || 'N/A'}</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Total No. of Passenger:
                                <span className="font-medium"> {data?.selectedSeats?.length || 0}</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Pickup Point:
                                <span className="font-medium"> {data?.pickupPoint || 'N/A'}</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Drop Point:
                                <span className="font-medium"> {data?.dropPoint || 'N/A'}</span>
                            </p>
                        </div>

                        <div className="space-y-4 flex items-center justify-center flex-col">
                            <div className="space-y-1 text-center">
                                <p className="text-base text-neutral-600 font-normal">
                                    Total Price:
                                </p>
                                <h1 className="text-xl text-neutral-600 font-bold">
                                    NPR {data?.totalPrice || 0}
                                </h1>
                            </div>

                            <div className="w-fit px-3 py-1 rounded-full bg-green-500/5 border border-green-600 text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                                <FaCircleCheck size={16} />
                                <span>Bill Paid</span>
                            </div>
                        </div>
                    </div>

                    {/* Route detail */}
                    <div className="w-full flex items-center justify-between border-dashed border-t-2 border-neutral-200 pt-3">
                        <p className="text-base text-neutral-600 font-normal">
                            {data?.fromLocation || 'From'}
                            <span className="text-neutral-400 px-2">-----</span>
                            {data?.toLocation || 'To'}
                        </p>
                        <p className="text-base text-neutral-600 font-normal">
                            Departure at {formatTime(data?.departureTime) || 'N/A'}
                        </p>
                        <p className="text-base text-neutral-600 font-normal">
                            Arrive at {formatTime(data?.arrivalTime) || 'N/A'}
                        </p>
                    </div>

                </div>

                <div className="col-span-1 border border-neutral-200 rounded-xl shadow-sm p-1">
                    {data?.qrCodeData ? (
                        <QRCodeSVG
                            value={data.qrCodeData}
                            size={150}
                            level="M"
                            className="w-full aspect-square rounded-xl"
                            includeMargin={true}
                            bgColor={"#FFFFFF"}
                            fgColor={"#000000"}
                        />
                    ) : (
                        <img src={QrImg} alt="Qr Img" className="w-full aspect-square object-cover object-center rounded-xl" />
                    )}
                </div>

            </div>

            {/* Left button section */}
            <div className="w-full bg-primary absolute bottom-0 left-0 rounded-bl-3xl flex items-center justify-between px-5 py-1.5">
                <p className="text-xs text-neutral-100 font-light">
                    Note: Ticket is Non Refundable
                </p>
                <div className="flex items-center gap-x-2">
                    <FaPhone className='w-3 h-3 text-neutral-100' />
                    <p className="text-sm text-neutral-100 font-light">
                        {data?.contactPhone || '+977-9800000000, +9770123456789'}
                    </p>
                </div>
            </div>

        </div>
    )
}

export default PassengerInvoice
