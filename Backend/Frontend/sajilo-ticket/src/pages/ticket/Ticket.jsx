import React from 'react'
import TopLayout from '../../layout/toppage/TopLayout'
import RootLayout from '../../layout/RootLayout'
import { motion } from 'framer-motion'
import Search from '../home/hero/search/Search'
import Filter from './filter/Filter'
import SearchResult from './searchresult/SearchResult'
// import bus from "../../assets/herobg.png";

const Ticket = () => {
    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Layout */}
            <TopLayout
                // bgImg={bus}
                bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
                title={"Reserve your ticket"}
            />

            <RootLayout className="space-y-12 relative">

                {/* Search Section */}
                <div className="space-y-5 w-full bg-neutral-50 flex py-4 items-center justify-center flex-col sticky top-0 z-30">
                    <motion.h1
                        initial={{ opacity: 0, y: -800 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -800 }}
                        transition={{ duration: 1.35, ease: "easeOut" }}
                        className="text-3xl text-neutral-700 font-semibold"
                    >
                        Want to change the route?
                    </motion.h1>

                    {/* Search */}
                    <Search />

                </div>

                {/* Searched bus tickets */}
                <div className="w-full h-auto grid grid-cols-4 gap-16 relative">

                    {/* Filter Section */}
                    <div className="col-span-1">
                        <Filter className="space-y-4 sticky top-52' z-20" />
                    </div>

                    {/* Search Tickets */}
                    <SearchResult />

                </div>

            </RootLayout>

        </div>
    )
}

export default Ticket
