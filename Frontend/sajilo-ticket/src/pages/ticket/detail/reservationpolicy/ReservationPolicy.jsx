import React from 'react'

const ReservationPolicy = () => {
    return (
        <div className='col-span-4 w-full border-l border-neutral-300 pl-5'>
            <div className="w-full space-y-3 text-left">
                <h1 className="text-lg text-neutral-600 font-medium text-start">
                    Reservation Policies
                </h1>

                <ul className="w-full list-disc list-outside space-y-2.5 px-4">
                    <li className="text-sm text-neutral-500 font-normal">
                        Please note that this ticket is non-refundable.
                    </li>
                    <li className="text-sm text-neutral-500 font-normal">
                        Passengers are required to show their ticket at the time of boarding.
                    </li>
                    <li className="text-sm text-neutral-500 font-normal">
                        Passengers are required to have their ticket printed or available on their mobile device.
                    </li>
                    <li className="text-sm text-neutral-500 font-normal">
                        Passenger must be present at the boarding point at least 30 minutes before the departure time. The company is not responsible for any inconvenience caused due to the late arrival of the passenger.
                    </li>
                    <li className="text-sm text-neutral-500 font-normal">
                        Bus services may be cancelled or delayed due to unforeseen circumstances.
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ReservationPolicy
