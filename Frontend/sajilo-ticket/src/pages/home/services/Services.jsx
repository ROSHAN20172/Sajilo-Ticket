import React from 'react';
import RootLayout from '../../../layout/RootLayout';
import ServiceCard from '../../../components/service/ServiceCard';
import { RiRefund2Line, RiSecurePaymentLine } from 'react-icons/ri';
import { PiHeadsetFill } from 'react-icons/pi';
import { MdOutlineTrackChanges, MdAirlineSeatReclineExtra } from 'react-icons/md';
import { GiPathDistance } from 'react-icons/gi';

const Services = () => {
    return (
        <RootLayout className="space-y-12">

            {/* Tag */}
            <div className="w-full flex items-center justify-center text-center">
                <h1 className="text-3xl text-neutral-800 font-bold">
                    Our <span className="text-primary">Services</span>
                </h1>
            </div>

            {/* Services Card */}
            <div className="w-full grid grid-cols-3 gap-10">
                <ServiceCard 
                    icon={RiSecurePaymentLine} 
                    title={"Secure Payment"} 
                    desc={"We ensure that your payment is safe and secure through Khalti, offering a smooth and hassle-free transaction experience."}
                />
                <ServiceCard 
                    icon={RiRefund2Line} 
                    title={"Refund Policy"} 
                    desc={"Easily purchase refundable tickets with clear terms and conditions, ensuring flexibility for your travel plans."}
                />
                <ServiceCard 
                    icon={PiHeadsetFill} 
                    title={"24/7 Customer Support"} 
                    desc={"Get assistance anytime via live chat, email, or phone. Our dedicated support team is here to help you."}
                />
                <ServiceCard 
                    icon={MdOutlineTrackChanges} 
                    title={"Real-Time Bus Tracking"} 
                    desc={"Track your bus live and stay updated with accurate arrival and departure times for a stress-free journey."}
                />
                <ServiceCard 
                    icon={MdAirlineSeatReclineExtra} 
                    title={"Comfortable & Safe Travel"} 
                    desc={"Travel with ease in well-maintained buses featuring WiFi, charging ports, spacious seats, AC, and onboard entertainment."}
                />
                <ServiceCard 
                    icon={GiPathDistance} 
                    title={"Wide Route Network"} 
                    desc={"We connect major cities and destinations across Nepal, offering multiple routes and bus options to suit your needs."}
                />
            </div>

        </RootLayout>
    )
}

export default Services
