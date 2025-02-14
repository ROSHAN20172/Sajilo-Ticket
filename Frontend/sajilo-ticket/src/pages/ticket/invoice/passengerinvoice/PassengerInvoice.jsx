import React from 'react'
import { FaCircleCheck, FaPhone } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";

import BusImg from "../../../../assets/bus.png"
import QrImg from "../../../../assets/QrImg.jpg"

const PassengerInvoice = () => {
    return (
        <div className='w-full col-span-4 rounded-3xl relative'>

            {/* Top bus detail */}
            <div className="w-full flex items-center justify-between bg-primary px-6 py-3 rounded-tl-3xl">
                <div className="flex items-center gap-x-3">
                    <img src={BusImg} alt="bus img" className='w-auto h-12 object-cover object-center' />
                    <h1 className="text-xl text-neutral-50 font-bold uppercase tracking-wider pt-1">
                        Bullet AC Deluxe
                    </h1>
                </div>

                <div className="flex items-center gap-x-2">
                    <p className="text-xl text-neutral-50 font-bold">
                        <span className='text-lg'>(Bus No.)</span>
                        Ba. 2 Kha 1234
                    </p>
                </div>
            </div>

            <div className="w-full grid grid-cols-5 gap-8 items-center px-5 py-7 mb-7">

                <div className="col-span-4 space-y-3.5">

                    {/* Billno, seat and date */}
                    <div className="w-full flex items-center justify-between border-dashed border-b-2 border-neutral-200 pb-3">
                        <p className="text-base text-neutral-500 font-normal">
                            Bill No.: 1234
                        </p>
                        <p className="text-base text-neutral-500 font-normal">
                            NPR 1600 <span className='text-xs'>/seat</span>
                        </p>
                        <p className="text-base text-neutral-500 font-normal">
                            Date: 2025-02-12
                        </p>
                    </div>

                    {/* Passenger detail */}
                    <div className="w-full flex items-center justify-between">
                        <div className="space-y-1.5">
                            <p className="text-base text-neutral-600 font-normal">
                                Name of Passenger:
                                <span className="font-medium"> Roshan Shah</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Total Seat No.:
                                <span className="font-medium"> A1, A2, B1, B2</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Total No. of Passenger:
                                <span className="font-medium"> 4</span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Pickup Point:
                                <span className="font-medium"> Kalanki, KTM</span>
                            </p>
                        </div>

                        <div className="space-y-4 flex items-center justify-center flex-col">
                            <div className="space-y-1 text-center">
                                <p className="text-base text-neutral-600 font-normal">
                                    Total Price:
                                </p>
                                <h1 className="text-xl text-neutral-600 font-bold">
                                    NPR 8000
                                </h1>
                            </div>

                            <div className="w-fit px-3 py-1 rounded-full bg-green-500/5 border border-green-600 text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                                <FaCircleCheck size={16} />
                                <span>Bill Paid</span>
                            </div>

                            {/* <div className="w-fit px-3 py-1 rounded-full bg-primary/5 border border-primary text-primary text-sm font-medium flex items-center justify-center gap-2">
                                <IoCloseCircle size={16} />
                                <span>Pending</span>
                            </div> */}
                        </div>
                    </div>

                    {/* Route detail */}
                    <div className="w-full flex items-center justify-between border-dashed border-t-2 border-neutral-200 pt-3">
                        <p className="text-base text-neutral-600 font-normal">
                            Kathmandu
                            <span className="text-neutral-400 px-2">-----</span>
                            Janakpur
                        </p>
                        <p className="text-base text-neutral-600 font-normal">
                            Departure at 06:30 PM
                        </p>
                        <p className="text-base text-neutral-600 font-normal">
                            Arrive at 06:00 AM
                        </p>
                    </div>

                </div>

                <div className="col-span-1 border border-neutral-200 rounded-xl shadow-sm p-1">
                    <img src={QrImg} alt="Qr Img" className="w-full aspect-square object-cover object-center rounded-xl" />
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
                        +977-9800000000, +9770123456789
                    </p>
                </div>
            </div>

        </div>
    )
}

export default PassengerInvoice
