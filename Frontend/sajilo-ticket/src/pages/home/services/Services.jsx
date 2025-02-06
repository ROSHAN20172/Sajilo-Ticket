import React from 'react'
import RootLayout from '../../../layout/RootLayout'
import ServiceCard from '../../../components/service/ServiceCard'
import { RiRefund2Line, RiSecurePaymentLine } from 'react-icons/ri';
import { PiHeadsetFill } from 'react-icons/pi';

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
                <ServiceCard icon={RiSecurePaymentLine} title={"Secure Payment"} desc={"We ensure that your paymet is safe and secure through Khalti."}/>
                <ServiceCard icon={RiRefund2Line} title={"Refund Policy"} desc={"Offer option for the user to purchase refundable tickets with clear terms and conditions."}/>
                <ServiceCard icon={PiHeadsetFill} title={"24/7 Support"} desc={"Get assistance anytime through chat, email, or phone."}/>
                <ServiceCard icon={PiHeadsetFill} title={"24/7 Support"} desc={"Get assistance anytime through chat, email, or phone."}/>
                <ServiceCard icon={PiHeadsetFill} title={"24/7 Support"} desc={"Get assistance anytime through chat, email, or phone."}/>
                <ServiceCard icon={PiHeadsetFill} title={"24/7 Support"} desc={"Get assistance anytime through chat, email, or phone."}/>
            </div>

        </RootLayout>
    )
}

export default Services
