import React from 'react'
import Hero from './hero/Hero'
import Services from './services/Services'
import TopSearch from './topsearch/TopSearch'
import HomeSupportRequest from './support/HomeSupportRequest'

const Home = () => {
    return (
        <div className='space-y-16 w-full min-h-screen pb-16'>
            {/* Hero */}
            <Hero />

            {/* Services */}
            <Services />

            {/* Top Search */}
            {/* <TopSearch /> */}

            {/* Support Request */}
            <HomeSupportRequest />
        </div>
    )
}

export default Home
