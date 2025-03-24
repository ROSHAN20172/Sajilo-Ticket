import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiSteeringWheel } from 'react-icons/gi';
import { MdOutlineChair } from 'react-icons/md';
import { RiMoneyRupeeCircleLine } from 'react-icons/ri';
import { UserAppContext } from '../../../../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReservationWarningModal from '../../../../../components/modals/ReservationWarningModal';

const BusSeat = ({ busId, date }) => {
  const { backendUrl } = useContext(UserAppContext);
  const navigate = useNavigate();
  // Track seat selection
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [busSeatData, setBusSeatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [routeInfo, setRouteInfo] = useState({
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    pickupPoint: '',
    dropPoint: '',
    basePrice: 0,
    busName: '',
    busNumber: ''
  });

  // Track pickup and drop points
  const [pickupPoints, setPickupPoints] = useState([]);
  const [dropPoints, setDropPoints] = useState([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');
  const [selectedDropPoint, setSelectedDropPoint] = useState('');
  const [selectedPickupDetails, setSelectedPickupDetails] = useState({ name: "Not Selected", time: null });
  const [selectedDropDetails, setSelectedDropDetails] = useState({ name: "Not Selected", time: null });

  // Track custom price
  const [customPrice, setCustomPrice] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // Fetch seat data when component mounts
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
            basePrice: response.data.data.busSeatData.length > 0 ? response.data.data.busSeatData[0].price : 0,
            busName: response.data.data.bus?.name || '',
            busNumber: response.data.data.bus?.busNumber || ''
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

  // Fetch pickup and drop points
  const fetchRoutePoints = async () => {
    if (!busId) return;

    try {
      const response = await axios.get(`${backendUrl}/api/bus/route-points`, {
        params: { busId, date }
      });

      if (response.data.success) {
        const { pickupPoints, dropPoints } = response.data.data;
        setPickupPoints(pickupPoints || []);
        setDropPoints(dropPoints || []);
      }
    } catch (error) {
      toast.error("Error loading pickup and drop points");
    }
  };

  // Fetch custom price for selected pickup and drop points
  const fetchCustomPrice = async () => {
    if (!selectedPickupPoint || !selectedDropPoint || !busId) {
      setCustomPrice(null);
      return;
    }

    try {
      setIsLoadingPrice(true);
      console.log('Fetching custom price with params:', {
        busId,
        pickupPointId: selectedPickupPoint,
        dropPointId: selectedDropPoint,
        date
      });

      // Try with the main endpoint format
      const response = await axios.get(`${backendUrl}/api/bus/custom-price`, {
        params: {
          busId,
          pickupPointId: selectedPickupPoint,
          dropPointId: selectedDropPoint,
          date
        }
      });

      console.log('Custom price API response:', response.data);

      // Handle different possible response formats
      if (response.data.success) {
        // Format 1: { success: true, data: { customPrice: 100 } }
        if (response.data.data?.customPrice) {
          console.log(`Custom price found in data.customPrice: ${response.data.data.customPrice}`);
          setCustomPrice(response.data.data.customPrice);
          return;
        }
        // Format 2: { success: true, data: { price: 100 } }
        else if (response.data.data?.price) {
          console.log(`Custom price found in data.price: ${response.data.data.price}`);
          setCustomPrice(response.data.data.price);
          return;
        }
        // Format 3: { success: true, customPrice: 100 }
        else if (response.data.customPrice) {
          console.log(`Custom price found directly in response: ${response.data.customPrice}`);
          setCustomPrice(response.data.customPrice);
          return;
        }
        // Format 4: { success: true, price: 100 }
        else if (response.data.price) {
          console.log(`Price found directly in response: ${response.data.price}`);
          setCustomPrice(response.data.price);
          return;
        }
        else {
          console.log('No custom price found in the response data');

          // Try an alternative endpoint format
          try {
            const altResponse = await axios.get(`${backendUrl}/api/route/price`, {
              params: {
                busId,
                pickupId: selectedPickupPoint,
                dropId: selectedDropPoint,
                date
              }
            });

            console.log('Alternative endpoint response:', altResponse.data);

            if (altResponse.data.success && (altResponse.data.data?.price || altResponse.data.price)) {
              const price = altResponse.data.data?.price || altResponse.data.price;
              console.log(`Custom price found in alternative endpoint: ${price}`);
              setCustomPrice(price);
              return;
            }
          } catch (altError) {
            console.log('Alternative endpoint failed:', altError.message);
          }

          setCustomPrice(null);
        }
      } else {
        console.log('API response indicates failure:', response.data.message);
        setCustomPrice(null);
      }
    } catch (error) {
      console.error("Error fetching custom price:", error);

      // Log more detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      // Try a different endpoint format as fallback
      try {
        console.log('Trying alternative endpoint format...');
        const fallbackResponse = await axios.get(`${backendUrl}/api/routes/custom-fare`, {
          params: {
            busId,
            from: selectedPickupPoint,
            to: selectedDropPoint,
            date
          }
        });

        console.log('Fallback endpoint response:', fallbackResponse.data);

        if (fallbackResponse.data.success && fallbackResponse.data.fare) {
          console.log(`Custom price found in fallback endpoint: ${fallbackResponse.data.fare}`);
          setCustomPrice(fallbackResponse.data.fare);
          return;
        }
      } catch (fallbackError) {
        console.log('Fallback endpoint also failed:', fallbackError.message);
        toast.error("Failed to check for custom pricing");
      }

      setCustomPrice(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  useEffect(() => {
    fetchSeatData();
    fetchRoutePoints();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchSeatData, 30000);
    setRefreshInterval(interval);

    // Cleanup on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [busId, date, backendUrl]);

  // Check if there are any custom prices for this route when points are loaded
  useEffect(() => {
    const checkAvailableCustomPrices = async () => {
      if (pickupPoints.length === 0 || dropPoints.length === 0) return;

      try {
        const response = await axios.get(`${backendUrl}/api/bus/available-custom-prices`, {
          params: { busId, date }
        }).catch(err => {
          console.log('Available custom prices endpoint not available, this is expected');
          return null;
        });

        if (response && response.data && response.data.success) {
          console.log('Available custom prices:', response.data.data);
          // If available custom prices found, select the first combination for demonstration
          if (response.data.data && response.data.data.length > 0) {
            const firstCustomPrice = response.data.data[0];
            console.log('Auto-selecting first available custom price route:', firstCustomPrice);

            // Only auto-select if user hasn't made a selection yet
            if (!selectedPickupPoint && !selectedDropPoint) {
              if (firstCustomPrice.pickupPointId) {
                setSelectedPickupPoint(firstCustomPrice.pickupPointId);
              }
              if (firstCustomPrice.dropPointId) {
                setSelectedDropPoint(firstCustomPrice.dropPointId);
              }
              // The price will be fetched when the pickup and drop points are set
            }
          }
        }
      } catch (error) {
        console.log('Error checking available custom prices:', error);
      }
    };

    checkAvailableCustomPrices();
  }, [pickupPoints, dropPoints, busId, date, backendUrl, selectedPickupPoint, selectedDropPoint]);

  // Update pickup details when selection changes
  useEffect(() => {
    if (!selectedPickupPoint) {
      setSelectedPickupDetails({ name: "Not Selected", time: null });
      return;
    }

    const point = pickupPoints.find(p => p.id === selectedPickupPoint);
    if (point) {
      setSelectedPickupDetails({ name: point.name, time: point.time });
    }
  }, [selectedPickupPoint, pickupPoints]);

  // Update drop details when selection changes
  useEffect(() => {
    if (!selectedDropPoint) {
      setSelectedDropDetails({ name: "Not Selected", time: null });
      return;
    }

    const point = dropPoints.find(p => p.id === selectedDropPoint);
    if (point) {
      setSelectedDropDetails({ name: point.name, time: point.time });
    }
  }, [selectedDropPoint, dropPoints]);

  // Update custom price when pickup or drop point changes
  useEffect(() => {
    if (selectedPickupPoint && selectedDropPoint) {
      console.log(`Pickup point changed to: ${selectedPickupPoint}, Drop point changed to: ${selectedDropPoint}`);
      fetchCustomPrice();

      // Also double-check the endpoint directly
      const verifyEndpoint = async () => {
        try {
          const testResponse = await axios.get(`${backendUrl}/api/bus/verify-custom-price-endpoint`, {
            params: {
              busId,
              pickupPointId: selectedPickupPoint,
              dropPointId: selectedDropPoint
            }
          }).catch(err => {
            // This endpoint might not exist, just log the error
            console.log('Verification endpoint not available, this is expected');
            return null;
          });

          if (testResponse && testResponse.data) {
            console.log('Verification endpoint response:', testResponse.data);
          }
        } catch (err) {
          // Ignore errors from this test endpoint
        }
      };

      verifyEndpoint();
    } else {
      setCustomPrice(null);
    }
  }, [selectedPickupPoint, selectedDropPoint, busId, date, backendUrl]);

  // Add event listener to debug pickup and drop point changes
  useEffect(() => {
    console.log('Current pickup point:', selectedPickupPoint);
    console.log('Current pickup details:', selectedPickupDetails);
  }, [selectedPickupPoint, selectedPickupDetails]);

  useEffect(() => {
    console.log('Current drop point:', selectedDropPoint);
    console.log('Current drop details:', selectedDropDetails);
  }, [selectedDropPoint, selectedDropDetails]);

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

  // Calculate the total price of selected seats with custom price if available
  const calculateTotalPrice = () => {
    const pricePerSeat = customPrice !== null ? customPrice : routeInfo.basePrice;
    return selectedSeats.length * pricePerSeat;
  };

  // Get the current price to display (custom or base)
  const getCurrentPrice = () => {
    if (isLoadingPrice) {
      return <span className="text-sm text-neutral-500">Loading price...</span>;
    }
    return customPrice !== null ? customPrice : routeInfo.basePrice;
  };

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

  // Handle pickup point selection
  const handlePickupChange = (e) => {
    setSelectedPickupPoint(e.target.value);
  };

  // Handle drop point selection
  const handleDropChange = (e) => {
    setSelectedDropPoint(e.target.value);
  };

  // Handle reservation confirmation with custom price
  const handleReservationConfirm = async () => {
    try {
      // Validate pickup and drop points
      if (!selectedPickupPoint) {
        toast.error("Please select a pickup point");
        setShowWarningModal(false);
        return;
      }

      if (!selectedDropPoint) {
        toast.error("Please select a drop point");
        setShowWarningModal(false);
        return;
      }

      setShowWarningModal(false);
      setLoading(true);

      const response = await axios.post(`${backendUrl}/api/bus/reserve-seats`, {
        busId,
        date,
        seatIds: selectedSeats
      });

      if (response.data.success) {
        const { reservationId, expirationTime } = response.data.data;

        // Refresh seat data to show updated status
        await fetchSeatData();

        // Use custom price if available
        const priceUsed = customPrice !== null ? customPrice : routeInfo.basePrice;

        // Navigate to checkout with reservation data
        navigate('/bus-tickets/checkout', {
          state: {
            busId,
            date,
            selectedSeats,
            pickupPointId: selectedPickupPoint,
            dropPointId: selectedDropPoint,
            totalPrice: selectedSeats.length * priceUsed,
            pricePerSeat: priceUsed,
            isCustomPrice: customPrice !== null,
            route: {
              ...routeInfo,
              busName: routeInfo.busName,
              busNumber: routeInfo.busNumber
            },
            reservation: {
              id: reservationId,
              expirationTime
            }
          }
        });
      } else {
        toast.error(response.data.message || "Failed to reserve seats. Please try again.");
        // Refresh seat data to show current status
        await fetchSeatData();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to reserve seats. Please try again.");
      }
      // Refresh seat data to show current status
      await fetchSeatData();
    } finally {
      setLoading(false);
    }
  };

  // Handle proceed to checkout button click
  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.warning("Please select at least one seat to proceed");
      return;
    }

    if (!selectedPickupPoint) {
      toast.error("Please select a pickup point");
      return;
    }

    if (!selectedDropPoint) {
      toast.error("Please select a drop point");
      return;
    }

    setShowWarningModal(true);
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
    <div className='w-full space-y-5'>
      {/* Pickup and Drop Points Selection Box */}
      <div className="w-full bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
        <h1 className="text-lg text-neutral-600 font-medium mb-4">
          Select Pickup & Drop Points
        </h1>

        <p className="text-sm text-neutral-500 italic mb-4">
          Price may vary based on pickup and drop point selection
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Pickup Point Selection */}
          <div className="w-full space-y-2">
            <label className='text-sm text-neutral-500 font-medium'>Pickup Point</label>
            <select
              value={selectedPickupPoint}
              onChange={handlePickupChange}
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
              className="w-full h-10 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
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

          {/* Drop Point Selection */}
          <div className="w-full space-y-2">
            <label className='text-sm text-neutral-500 font-medium'>Drop Point</label>
            <select
              value={selectedDropPoint}
              onChange={handleDropChange}
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
              className="w-full h-10 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
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
      </div>

      {/* Main Content */}
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

              {isLoadingPrice ? (
                <div className="flex items-center gap-x-2">
                  <RiMoneyRupeeCircleLine className='text-xl text-neutral-500' />
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : customPrice !== null ? (
                <div className="flex items-center gap-x-2">
                  <RiMoneyRupeeCircleLine className='text-xl text-neutral-500' />
                  <p className="text-sm text-neutral-500 font-medium">NPR. {customPrice}</p>
                </div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <RiMoneyRupeeCircleLine className='text-xl text-neutral-500' />
                  <p className="text-sm text-neutral-500 font-medium">NPR. {routeInfo.basePrice}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seat Selection action */}
        <div className="col-span-2 w-full space-y-5">
          {/* Main Box */}
          <div className="w-full space-y-2 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
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
                  {routeInfo.from} <span className='font-medium'>({formatTime(routeInfo.departureTime)})</span>
                </h1>

                <div className="flex-1 border-dashed border border-neutral-300" />

                <h1 className="text-sm text-neutral-600 font-normal">
                  {routeInfo.to} <span className='font-medium'>({formatTime(routeInfo.arrivalTime)})</span>
                </h1>
              </div>

              {/* Pickup and Drop Point Section */}
              <div className="w-full flex items-center justify-between gap-x-5 mt-3">
                <p className="text-sm text-neutral-400 font-normal">
                  Pickup Point
                </p>
                <p className="text-sm text-neutral-400 font-normal">
                  Drop Point
                </p>
              </div>

              <div className="w-full flex items-center justify-between gap-x-4">
                <h1 className="text-sm text-neutral-600 font-normal">
                  {selectedPickupDetails.name !== "Not Selected" ? (
                    <>
                      {selectedPickupDetails.name}
                      {selectedPickupDetails.time && (
                        <span className='font-medium'> ({formatTime(selectedPickupDetails.time)})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-400">Not Selected</span>
                  )}
                </h1>

                <div className="flex-1 border-dashed border border-neutral-300" />

                <h1 className="text-sm text-neutral-600 font-normal">
                  {selectedDropDetails.name !== "Not Selected" ? (
                    <>
                      {selectedDropDetails.name}
                      {selectedDropDetails.time && (
                        <span className='font-medium'> ({formatTime(selectedDropDetails.time)})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-400">Not Selected</span>
                  )}
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

            {/* Selected Seats Section */}
            <div className="w-full space-y-2 mt-4">
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

            {/* Fare Details Section */}
            <div className="w-full space-y-2 mt-4">
              <h1 className="text-lg text-neutral-600 font-medium">
                Fare Details
              </h1>

              <div className="w-full flex items-center justify-between border-dashed border-l-[1.5px] border-neutral-400 pl-2">
                <h3 className="text-sm text-neutral-500 font-medium">
                  Regular Fare:
                </h3>
                <div className="text-sm font-medium flex items-center">
                  <span className={customPrice !== null ? "text-neutral-400 line-through" : "text-neutral-600"}>
                    NPR. {routeInfo.basePrice}
                  </span>
                </div>
              </div>

              {customPrice !== null && (
                <div className="w-full flex items-center justify-between border-dashed border-l-[1.5px] border-neutral-400 pl-2">
                  <h3 className="text-sm text-neutral-500 font-medium">Custom Fare:</h3>
                  <div className="text-sm font-medium flex items-center">
                    {isLoadingPrice ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <span className="text-green-600">NPR. {customPrice}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <div className="flex gap-y-0.5 flex-col">
                  <h3 className="text-base text-neutral-500 font-medium">Total Price:</h3>
                  <span className='text-xs to-neutral-500 font-normal'>
                    (Including all taxes)
                  </span>
                </div>

                <p className="text-base text-neutral-600 font-semibold">
                  NPR {" "}
                  {calculateTotalPrice()}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center">
            <button
              onClick={handleProceedToCheckout}
              className='w-full bg-primary hover:bg-primary/90 text-sm text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition'>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Warning Modal */}
      <ReservationWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleReservationConfirm}
        selectedSeats={selectedSeats}
      />
    </div>
  );
};

export default BusSeat;
