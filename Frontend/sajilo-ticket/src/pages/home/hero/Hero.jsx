import React from 'react'
import { motion } from 'framer-motion'
import Search from './search/Search'
import RootLayout from '../../../layout/RootLayout'

import '../../../css/BusAnimator.css';
import busImage from '../../../assets/Bus Animator/bus.png';
import wheelImage from '../../../assets/Bus Animator/wheel.png';
import roadImage from '../../../assets/Bus Animator/road.jpg';
import skyImage from '../../../assets/Bus Animator/sky.jpg';
import cityImage from '../../../assets/Bus Animator/city.png';


const Hero = () => {

    const variants = {
        hidden: { opacity: 0, y: -800 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className='w-full flex-1 h-screen relative'
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration: 0.85, ease: "easeInOut" }}
        >
            <div className="hero" style={{ backgroundImage: `url(${skyImage})` }}>

                {/* Highway */}
                <div className="highway" style={{ backgroundImage: `url(${roadImage})` }}></div>

                {/* City */}
                <div className="city" style={{ backgroundImage: `url(${cityImage})` }}></div>

                {/* Bus and Wheels */}
                <div className="bus">
                    <img src={busImage} alt="Bus" />
                    <div className="wheel">
                        <img src={wheelImage} className="frontwheel" alt="Front Wheel" />
                        <img src={wheelImage} className="backwheel" alt="Back Wheel" />
                    </div>
                </div>
            </div>

            <RootLayout className="absolute top-6 left-0 w-full h-full py-[9ch] bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 flex items-center justify-start text-center flex-col gap-9">
                {/* Title Section */}
                <div className="space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: -800 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -800 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="text-lg text-neutral-500 font-medium"
                    >
                        Sajilo Ticket – Easy Online Bus Ticket Booking
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: -800 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -800 }}
                        transition={{ duration: 1.85, ease: "easeOut" }}
                        className="text-5xl text-neutral-800 font-bold capitalize"
                    >
                        Book Your Next Journey With Us
                    </motion.h1>
                </div>

                {/* Search Section */}
                <Search />
            </RootLayout>
        </motion.div>
    )
}

export default Hero

