import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TbArrowsExchange } from 'react-icons/tb';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { UserAppContext } from '../../../../context/UserAppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Search = ({ setSearchResults }) => {
  const { backendUrl } = useContext(UserAppContext);
  const navigate = useNavigate();
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  // Fetch suggestions for the "From" input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (fromValue) {
        axios
          .get(`${backendUrl}/api/search/routes?query=${fromValue}`)
          .then((response) => {
            const routes = Array.isArray(response.data) ? response.data : [];
            const locationsSet = new Set();
            routes.forEach((route) => {
              if (route.from && route.from.toLowerCase().includes(fromValue.toLowerCase())) {
                locationsSet.add(route.from);
              }
              if (route.to && route.to.toLowerCase().includes(fromValue.toLowerCase())) {
                locationsSet.add(route.to);
              }
              if (Array.isArray(route.pickupPoints)) {
                route.pickupPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(fromValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
              if (Array.isArray(route.dropPoints)) {
                route.dropPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(fromValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
            });
            setFromSuggestions(Array.from(locationsSet));
          })
          .catch((error) => {
            setFromSuggestions([]);
          });
      } else {
        setFromSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fromValue, backendUrl]);

  // Fetch suggestions for the "To" input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (toValue) {
        axios
          .get(`${backendUrl}/api/search/routes?query=${toValue}`)
          .then((response) => {
            const routes = Array.isArray(response.data) ? response.data : [];
            const locationsSet = new Set();
            routes.forEach((route) => {
              if (route.from && route.from.toLowerCase().includes(toValue.toLowerCase())) {
                locationsSet.add(route.from);
              }
              if (route.to && route.to.toLowerCase().includes(toValue.toLowerCase())) {
                locationsSet.add(route.to);
              }
              if (Array.isArray(route.pickupPoints)) {
                route.pickupPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(toValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
              if (Array.isArray(route.dropPoints)) {
                route.dropPoints.forEach((point) => {
                  if (point && point.toLowerCase().includes(toValue.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
            });
            setToSuggestions(Array.from(locationsSet));
          })
          .catch((error) => {
            setToSuggestions([]);
          });
      } else {
        setToSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [toValue, backendUrl]);

  // When a suggestion is clicked, update the corresponding input
  const handleFromSuggestionClick = (location) => {
    setFromValue(location);
    setFromSuggestions([]);
  };

  const handleToSuggestionClick = (location) => {
    setToValue(location);
    setToSuggestions([]);
  };

  // Date functions
  const setToday = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    setDate(today.toISOString().split('T')[0]);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);
    setDate(tomorrow.toISOString().split('T')[0]);
  };

  // Submit handler for search
  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate that all fields have values
    if (!fromValue.trim() || !toValue.trim() || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check that the entered date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Date cannot be in the past");
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/search/bus?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}&date=${date}`
      );

      if (!response.data || response.data.length === 0) {
        toast.info("No buses found");
      } else {
        toast.success("Buses found!");
      }

      // Navigate to the bus-tickets page with query parameters
      navigate(`/bus-tickets?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}&date=${date}`);
    } catch (error) {
      toast.error("No buses found");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -800 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-5 relative"
    >
      <div className="w-full flex items-center gap-5 justify-between">
        {/* From and To Input Section */}
        <div className="w-[60%] flex items-center gap-5 relative">
          {/* From Input */}
          <div className="w-1/2 relative">
            <div className="h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
              <input
                type="text"
                placeholder="From"
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                onFocus={() => setIsFromFocused(true)}
                onBlur={() => setTimeout(() => setIsFromFocused(false), 100)}
              />
              <FaMapMarkerAlt className="w-5 h-5 text-neutral-400" />
            </div>
            {/* Suggestion list for From input */}
            {isFromFocused && fromSuggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 bg-white border border-neutral-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {fromSuggestions.map((location, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleFromSuggestionClick(location)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* To Input */}
          <div className="w-1/2 relative">
            <div className="h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
              <input
                type="text"
                placeholder="To"
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
                value={toValue}
                onChange={(e) => setToValue(e.target.value)}
                onFocus={() => setIsToFocused(true)}
                onBlur={() => setTimeout(() => setIsToFocused(false), 100)}
              />
              <FaMapMarkerAlt className="w-5 h-5 text-neutral-400" />
            </div>
            {/* Suggestion list for To input */}
            {isToFocused && toSuggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 bg-white border border-neutral-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {toSuggestions.map((location, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleToSuggestionClick(location)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Exchange Button */}
          <button className="absolute w-11 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center bg-primary">
            <TbArrowsExchange className="w-6 h-6 text-neutral-50" />
          </button>
        </div>

        {/* Date & Search Button Section */}
        <div className="flex-1 h-14 flex items-center gap-3">
          <button onClick={setToday} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-400">
            Today
          </button>
          <button onClick={setTomorrow} className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-400">
            Tomorrow
          </button>
          <div className="flex-1 h-full border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
            <input
              type="date"
              className="flex-1 h-full border-none bg-transparent focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {/* Search Button with submit handler */}
          <button
            onClick={handleSearch}
            className="w-fit px-5 h-full bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-base font-medium text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300"
          >
            <FaSearch />
            Search
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Search;
