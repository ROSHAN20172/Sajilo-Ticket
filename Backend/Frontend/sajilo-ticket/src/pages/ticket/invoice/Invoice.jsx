import React, { useRef } from 'react'
import TopLayout from '../../../layout/toppage/TopLayout'
import RootLayout from '../../../layout/RootLayout'
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './companyinvoice/CompanyInvoice';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

const Invoice = () => {

  const invoiceRef = useRef(null);

  const handleDownload = async () => {
    if (invoiceRef.current === null) return;

    try {
      // Convert the invoice to an image
      const dataUrl = await toPng(invoiceRef.current);

      // download the image
      download(dataUrl, "Bus Ticket Invoice.png");
    } catch (error) {
      console.error("Error while downloading the invoice", error);
    }
  }

  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        bgImg={"https://th.bing.com/th?id=OIP.q3iPPIRV3Dlb1X30h5tKcwHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"}
        title={"Collet your invoice"}
      />

      <RootLayout className="space-y-12 w-full pb-16">
        <div className="w-full flex items-center justify-center">

          {/* Invoice card */}
          <div
            ref={invoiceRef} //refere to the invoice card
            className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
          >

            {/* Left side for passenger */}
            <PassengerInvoice />

            {/* Right side for company */}
            <CompanyInvoice />

            {/* Cut circle */}
            <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50 border border-neutral-50" />

            <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50 border border-neutral-50" />

          </div>
        </div>

        {/* Download Invoice card button */}
        <div className="w-full flex justify-center items-center">
          <button
            onClick={handleDownload}
            className="w-fit px-8 h-14 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary text-neutral-50 font-bold text-lg rounded-lg flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
            Download Invoice
          </button>
        </div>

      </RootLayout>

    </div>
  )
}

export default Invoice