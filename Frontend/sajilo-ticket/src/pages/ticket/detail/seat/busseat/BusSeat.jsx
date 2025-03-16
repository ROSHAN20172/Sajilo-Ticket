import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GiSteeringWheel } from 'react-icons/gi';
import { MdOutlineChair } from 'react-icons/md';
import { RiMoneyRupeeCircleLine } from 'react-icons/ri';
import { UserAppContext } from '../../../../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const BusSeat = ({ busId, date }) => {
  const { backendUrl } = useContext(UserAppContext);
  // Track seat selection
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [busSeatData, setBusSeatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    pickupPoint: '',
    dropPoint: '',
    basePrice: 0
  });

  // Fetch seat data when component mounts
  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        if (!busId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${backendUrl}/api/bus/seat-data`, {
          params: { busId, date }
        });

        if (response.data.success) {
          setBusSeatData(response.data.data.busSeatData);

          // Update route info if available
          if (response.data.data.schedule?.route) {
            const { route, fromTime, toTime } = response.data.data.schedule;
            setRouteInfo({
              from: route.from || '',
              to: route.to || '',
              departureTime: fromTime || '',
              arrivalTime: toTime || '',
              pickupPoint: route.pickupPoints?.length > 0 ? route.pickupPoints[0] : '',
              dropPoint: route.dropPoints?.length > 0 ? route.dropPoints[0] : '',
              basePrice: response.data.data.busSeatData.length > 0 ? response.data.data.busSeatData[0].price : 0
            });
          }
        } else {
          toast.error("Could not fetch seat data, using default layout");
        }
      } catch (error) {
        toast.error("Error loading seat availability");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatData();
  }, [busId, date, backendUrl]);

  // Toggle seat selection
  const handleSeatClick = (seatId) => {
    // If the seat is already booked, ignore the click or disable it
    const selectedSeat = busSeatData.find((seat) => seat.id === seatId);
    if (selectedSeat && selectedSeat.status === 'booked') {
      return;
    }

    // If the seat is available, select it
    setSelectedSeats((prevSelectedSeats) => {
      // Check if the seat is already selected
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((Seat) => Seat !== seatId);
      } else {
        return [...prevSelectedSeats, seatId];
      }
    });
  };

  // Function to determine the seat class or seat name on status
  const getSeatName = (seat) => {
    if (seat.status === 'booked') {
      return 'text-primary cursor-not-allowed';
    } if (selectedSeats.includes(seat.id)) {
      return 'text-yellow-600 cursor-pointer';
    } else {
      return 'text-neutral-500 cursor-pointer';
    }
  };

  // Calculate the total price of selected seats
  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = busSeatData.find(busSeat => busSeat.id === seatId);
      return total + (seat ? seat.price : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-neutral-600">Loading seat availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full grid grid-cols-5 gap-10'>

      {/* Seat Layout */}
      <div className="col-span-3 w-full flex items-center justify-center shadow-sm rounded-xl p-4 border border-neutral-200">

        <div className="w-full space-y-7">
          <p className="text-base text-neutral-600 font-medium text-center">
            Click on the available seats to reserve them.
          </p>

          {/* Seat Layout */}
          <div className="w-full flex items-stretch gap-x-1.5">
            <div className="w-10 h-fit">
              <GiSteeringWheel className='text-3xl mt-7 text-primary -rotate-90' />
            </div>

            {/* Seat rows */}
            <div className="flex flex-col items-center border-l-2 border-dashed border-neutral-300 pl-7">

              <div className="flex-1 space-y-5">
                {/* First row */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {busSeatData.slice(0, 9).map((seat) => (
                    <div
                      key={seat.id}
                      className='flex items-center gap-x-0'
                      onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base to-neutral-600 font-bold">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Second row */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {busSeatData.slice(9, 18).map((seat) => (
                    <div
                      key={seat.id}
                      className='flex items-center gap-x-0'
                      onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base to-neutral-600 font-bold">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Third row */}
                <div className="w-full h-auto grid grid-cols-10 gap-x-5 justify-end">
                  <div className="col-span-9"></div>
                  {busSeatData.slice(18, 19).map((seat) => (
                    <div
                      key={seat.id}
                      className='flex items-center gap-x-0'
                      onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base to-neutral-600 font-bold">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Fourth row */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {busSeatData.slice(19, 28).map((seat) => (
                    <div
                      key={seat.id}
                      className='flex items-center gap-x-0'
                      onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base to-neutral-600 font-bold">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Fifth row */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {busSeatData.slice(28, 37).map((seat) => (
                    <div
                      key={seat.id}
                      className='flex items-center gap-x-0'
                      onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base to-neutral-600 font-bold">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* reservation info */}
          <div className="w-full flex items-center justify-center gap-6 border-t border-neutral-200 pt-5">
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className='text-xl text-neutral-500 -rotate-90' />
              <p className="text-sm text-neutral-500 font-medium">Available</p>
            </div>

            <div className="flex items-center gap-x-2">
              <MdOutlineChair className='text-xl text-primary -rotate-90' />
              <p className="text-sm text-neutral-500 font-medium">Booked</p>
            </div>

            <div className="flex items-center gap-x-2">
              <MdOutlineChair className='text-xl text-yellow-600 -rotate-90' />
              <p className="text-sm text-neutral-500 font-medium">Selected</p>
            </div>

            <div className="flex items-center gap-x-2">
              <RiMoneyRupeeCircleLine className='text-xl text-neutral-500' />
              <p className="text-sm text-neutral-500 font-medium">NPR. {routeInfo.basePrice}</p>
            </div>

          </div>

        </div>

      </div>

      {/* Seat Selection action */}
      <div className="col-span-2 w-full space-y-5 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">

        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg to-neutral-600 font-medium">
              Your Destination
            </h1>
            <Link to={"/bus-tickets"} className="text-sm text-primary font-normal">
              Change Route
            </Link>
          </div>

          <div className="space-y-0.5 w-full">
            <div className="w-full flex items-center justify-between gap-x-5">
              <p className="text-sm text-neutral-400 font-normal">
                From
              </p>
              <p className="text-sm text-neutral-400 font-normal">
                To
              </p>
            </div>

            <div className="w-full flex items-center justify-between gap-x-4">
              <h1 className="text-sm text-neutral-600 font-normal">
                {routeInfo.from} <span className='font-medium'>({routeInfo.departureTime})</span>
              </h1>

              <div className="flex-1 border-dashed border border-neutral-300" />

              <h1 className="text-sm text-neutral-600 font-normal">
                {routeInfo.to} <span className='font-medium'>({routeInfo.arrivalTime})</span>
              </h1>
            </div>
          </div>
          <div className="w-full space-y-2">
            <div className="w-full flex items-center justify-between">
              <h3 className="text-sm text-neutral-500 font-medium">Date:</h3>
              <p className="text-sm text-neutral-600 font-medium">
                {date ? new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg text-neutral-600 font-medium">
              Selected Seats
            </h1>

            <div className="bg-primary/20 rounded-lg py-0.5 px-1.5 text-xs text-neutral-600 font-normal uppercase">
              Non Refundable
            </div>
          </div>

          {
            selectedSeats.length > 0
              ?
              <div className='w-full flex items-center gap-x-3 flex-wrap'>
                {selectedSeats.map((seatId) => {
                  return (
                    <div key={seatId} className='w-9 h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-base to-neutral-700 font-semibold'>
                      {seatId}
                    </div>
                  )
                })}
              </div>
              :
              <div className='w-full flex items-center gap-x-3'>
                <p className="text-sm to-neutral-500 font-normal">No Seat Selected</p>
              </div>
          }
        </div>

        <div className="w-full space-y-2">
          <h1 className="text-lg text-neutral-600 font-medium">
            Fare Details
          </h1>

          <div className="w-full flex items-center justify-between border-dashed border-l-[1.5px] border-neutral-400 pl-2">
            <h3 className="text-sm text-neutral-500 font-medium">Basic Fare:</h3>
            <p className="text-sm text-neutral-600 font-medium">NPR. {routeInfo.basePrice}</p>
          </div>

          <div className="flex items-center justify-between gap-x-4">
            <div className="flex gap-y-0.5 flex-col">
              <h3 className="text-base text-neutral-500 font-medium">Total Price:</h3>
              <span className='text-xs to-neutral-500 font-normal'>
                (Including all taxes)
              </span>
            </div>

            {/* Calculate the total price */}
            <p className="text-base text-neutral-600 font-semibold">
              NPR {" "}
              {calculateTotalPrice()}
            </p>

          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          {
            selectedSeats.length > 0
              ?
              <Link to="/bus-tickets/checkout" className='w-full bg-primary hover:bg-primary/90 text-sm text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition'>
                Proceed to Checkout
              </Link>
              :
              <div className='w-full space-y-0.5'>
                <button
                  onClick={() => toast.warning("Please select at least one seat to proceed")}
                  className='w-full bg-primary hover:bg-primary/90 text-sm text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition'>
                  Proceed to Checkout
                </button>
              </div>
          }
        </div>

      </div>
    </div>
  );
};

export default BusSeat;
