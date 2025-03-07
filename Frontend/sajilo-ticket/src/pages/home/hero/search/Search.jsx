import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TbArrowsExchange } from 'react-icons/tb';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { UserAppContext } from '../../../../context/UserAppContext';

const Search = () => {
  const { backendUrl } = useContext(UserAppContext);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);

  // Debounced effect: when activeInput or its value changes, fetch suggestions.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let searchTerm = '';
      if (activeInput === 'from') {
        searchTerm = fromValue;
      } else if (activeInput === 'to') {
        searchTerm = toValue;
      }
      if (searchTerm) {
        axios
          .get(`${backendUrl}/api/search/routes?query=${searchTerm}`)
          .then((response) => {
            const routes = Array.isArray(response.data) ? response.data : [];
            const locationsSet = new Set();
            routes.forEach(route => {
              if (route.from && route.from.toLowerCase().includes(searchTerm.toLowerCase())) {
                locationsSet.add(route.from);
              }
              if (route.to && route.to.toLowerCase().includes(searchTerm.toLowerCase())) {
                locationsSet.add(route.to);
              }
              if (Array.isArray(route.pickupPoints)) {
                route.pickupPoints.forEach(point => {
                  if (point && point.toLowerCase().includes(searchTerm.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
              if (Array.isArray(route.dropPoints)) {
                route.dropPoints.forEach(point => {
                  if (point && point.toLowerCase().includes(searchTerm.toLowerCase())) {
                    locationsSet.add(point);
                  }
                });
              }
            });
            setSuggestions(Array.from(locationsSet));
          })
          .catch((error) => {
            console.error(error);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [activeInput, fromValue, toValue, backendUrl]);

  // When a suggestion is clicked, update the appropriate input and hide suggestions.
  const handleSuggestionClick = (location) => {
    if (activeInput === 'from') {
      setFromValue(location);
    } else if (activeInput === 'to') {
      setToValue(location);
    }
    setSuggestions([]);
    setActiveInput(null);
  };

  // Functions to update the date.
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

  // Helper to hide suggestions with a slight delay on blur
  const handleBlur = () => {
    setTimeout(() => {
      setActiveInput(null);
      setSuggestions([]);
    }, 100);
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
                onFocus={() => setActiveInput('from')}
                onBlur={handleBlur}
              />
              <FaMapMarkerAlt className="w-5 h-5 text-neutral-400" />
            </div>
            {/* Suggestion list for From input */}
            {activeInput === 'from' && suggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 bg-white border border-neutral-300 rounded-md mt-1 max-h-[calc(5*2.5rem)] overflow-y-auto">
                {suggestions.map((location, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleSuggestionClick(location)}
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
                onFocus={() => setActiveInput('to')}
                onBlur={handleBlur}
              />
              <FaMapMarkerAlt className="w-5 h-5 text-neutral-400" />
            </div>
            {/* Suggestion list for To input */}
            {activeInput === 'to' && suggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 bg-white border border-neutral-300 rounded-md mt-1 max-h-[calc(5*2.5rem)] overflow-y-auto">
                {suggestions.map((location, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleSuggestionClick(location)}
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
          <button className="w-fit px-5 h-full bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-base font-medium text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
            <FaSearch />
            Search
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Search;












