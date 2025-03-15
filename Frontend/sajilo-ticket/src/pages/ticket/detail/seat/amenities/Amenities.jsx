import React from 'react';
import { IoMdCheckboxOutline } from 'react-icons/io';

const Amenities = ({ amenities }) => {
  return (
    <div className='col-span-3 w-full'>
      <div className="w-full space-y-3">
        <h1 className="text-lg text-neutral-600 font-medium text-start">
          Bus Amenities
        </h1>
        {amenities && amenities.length > 0 ? (
          <div className="w-full grid grid-cols-2 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-x-2">
                <IoMdCheckboxOutline className='w-5 h-5 text-green-500' />
                <p className="text-base text-neutral-700 font-normal">
                  {amenity}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 font-normal">No amenities available.</p>
        )}
      </div>
    </div>
  );
};

export default Amenities;
