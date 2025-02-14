import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TbArrowsExchange } from 'react-icons/tb';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

const Search = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const setToday = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Add 1 extra day
        today.setHours(0, 0, 0, 0); // Set time to midnight
        setDate(today.toISOString().split('T')[0]);
    };

    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2); // Add 1 extra day
        tomorrow.setHours(0, 0, 0, 0); // Set time to midnight
        setDate(tomorrow.toISOString().split('T')[0]);
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-5"
        >
            <div className="w-full flex items-center gap-5 justify-between">
                {/* From and to input section */}
                <div className="w-[60%] flex items-center gap-5 relative">
                    {/* From */}
                    <div className="w-1/2 h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
                        <input type="text" placeholder="From" className="flex-1 h-full border-none bg-transparent focus:outline-none" />
                        <FaMapMarkerAlt className='w-5 h-5 text-neutral-400' />
                    </div>

                    {/* To */}
                    <div className="w-1/2 h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
                        <input type="text" placeholder="To" className="flex-1 h-full border-none bg-transparent focus:outline-none" />
                        <FaMapMarkerAlt className='w-5 h-5 text-neutral-400' />
                    </div>

                    {/* Exchange button */}
                    <button className="absolute w-11 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center bg-primary">
                        <TbArrowsExchange className='w-6 h-6 text-neutral-50' />
                    </button>
                </div>

                {/* Date and button input section */}
                <div className="flex-1 h-14 flex items-center gap-3">
                    {/* Today & Tomorrow Buttons */}
                    <button onClick={setToday} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-400">
                        Today
                    </button>
                    <button onClick={setTomorrow} className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-400">
                        Tomorrow
                    </button>

                    {/* Date Input */}
                    <div className="flex-1 h-full border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
                        <input
                            type="date"
                            className="flex-1 h-full border-none bg-transparent focus:outline-none"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Search button */}
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
