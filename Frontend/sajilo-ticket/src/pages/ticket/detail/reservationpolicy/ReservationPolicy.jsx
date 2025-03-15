import React from 'react';

const ReservationPolicy = ({ policies }) => {
  return (
    <div className='col-span-4 w-full border-l border-neutral-300 pl-5'>
      <div className="w-full space-y-3 text-left">
        <h1 className="text-lg text-neutral-600 font-medium text-start">
          Reservation Policies
        </h1>
        {policies && policies.length > 0 ? (
          <ul className="w-full list-disc list-outside space-y-2.5 px-4">
            {policies.map((policy, index) => (
              <li key={index} className="text-sm text-neutral-500 font-normal">
                {policy}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500 font-normal">No reservation policies available.</p>
        )}
      </div>
    </div>
  );
};

export default ReservationPolicy;
