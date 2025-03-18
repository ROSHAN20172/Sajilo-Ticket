import React, { useState, useEffect, useContext } from 'react'
import PaymentMethod from '../../checkout/passengerdata/payment/PaymentMethod'
import '../../../../../css/PassengerData.css'
import { UserAppContext } from '../../../../../context/UserAppContext'
import { CheckoutContext } from '../Checkout'
import axios from 'axios'
import { toast } from 'react-toastify'

const PassengerData = () => {
  const { backendUrl } = useContext(UserAppContext);
  const { bookingData, checkoutData, updateCheckoutData } = useContext(CheckoutContext);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [dropPoints, setDropPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const { busId, selectedSeats, date } = bookingData || {};

  useEffect(() => {
    const fetchRoutePoints = async () => {
      if (!busId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/bus/route-points`, {
          params: { busId, date }
        });

        if (response.data.success) {
          const { pickupPoints, dropPoints } = response.data.data;

          setPickupPoints(pickupPoints || []);
          setDropPoints(dropPoints || []);

        } else {
          toast.error("Failed to fetch pickup and drop points");
        }
      } catch (error) {
        toast.error("Error loading pickup and drop points");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutePoints();
  }, [busId, date, backendUrl, checkoutData.pickupPointId, updateCheckoutData, bookingData]);

  // Format time to include AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';

    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    updateCheckoutData({ [field]: value });
  };

  if (loading) {
    return (
      <div className='w-full col-span-4 py-4 space-y-6'>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full col-span-4 py-4 space-y-6'>
      <h1 className="text-xl text-neutral-700 font-semibold">
        Passenger Information
      </h1>

      <div className="space-y-7">
        <div className="w-full space-y-2">
          <label htmlFor="fullname" className='text-sm text-neutral-500 font-medium'>Full Name</label>
          <input
            type="text"
            value={checkoutData.passengerName}
            onChange={(e) => handleInputChange('passengerName', e.target.value)}
            placeholder="eg. Roshan Shah"
            className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
            onInput={(e) => e.target.value = e.target.value.replace(/[0-9]/g, '')}
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="email" className='text-sm text-neutral-500 font-medium'>Email Address</label>
          <input
            type="email"
            value={checkoutData.passengerEmail}
            onChange={(e) => handleInputChange('passengerEmail', e.target.value)}
            placeholder='eg. roshan@gmail.com'
            className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="phone" className='text-sm text-neutral-500 font-medium'>Phone Number</label>
          <input
            type="number"
            value={checkoutData.passengerPhone}
            onChange={(e) => handleInputChange('passengerPhone', e.target.value)}
            placeholder='eg. +977-9800000000'
            className="no-spinner w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="altphone" className='text-sm text-neutral-500 font-medium'>Alternate Phone Number (Optional)</label>
          <input
            type="number"
            value={checkoutData.alternatePhone}
            onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
            placeholder='eg. +977-9800000000'
            className="no-spinner w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label className='text-sm text-neutral-500 font-medium'>Pickup Point</label>
          <select
            value={checkoutData.pickupPointId}
            onChange={(e) => handleInputChange('pickupPointId', e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'gray\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '25px',
              paddingRight: '40px',
            }}
            className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          >
            <option value="" disabled>
              Choose your Nearest Pickup Point
            </option>
            {pickupPoints && pickupPoints.length > 0 ? (
              pickupPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name} ({formatTime(point.time)})
                </option>
              ))
            ) : (
              <option value="" disabled>No pickup points available</option>
            )}
          </select>
        </div>

        <div className="w-full space-y-2">
          <label className='text-sm text-neutral-500 font-medium'>Drop Point</label>
          <select
            value={checkoutData.dropPointId || ""}
            onChange={(e) => handleInputChange('dropPointId', e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'gray\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '25px',
              paddingRight: '40px',
            }}
            className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
            defaultValue=""
          >
            <option value="" disabled>
              Choose your Nearest Drop Point
            </option>
            {dropPoints && dropPoints.length > 0 ? (
              dropPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name} ({formatTime(point.time)})
                </option>
              ))
            ) : (
              <option value="" disabled>No drop points available</option>
            )}
          </select>
        </div>
      </div>

      {/* Payment Method */}
      <PaymentMethod />
    </div>
  )
}

export default PassengerData
