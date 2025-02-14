// import React from 'react'
// import PaymentMethod from '../../checkout/passengerdata/payment/PaymentMethod'

// const PassengerData = () => {
//   return (
//     <div className='w-full col-span-4 py-4 space-y-6'>

//       <h1 className="text-xl text-neutral-700 font-semibold">
//         Passenger Information
//       </h1>

//       <div className="space-y-7">
//         <div className="w-full space-y-2">
//             <label htmlFor="fullname" className='text-sm text-neutral-500 font-medium'>Full Name</label>
//             <input type="text" placeholder='eg. Roshan Shah' className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400" />
//         </div>

//         <div className="w-full space-y-2">
//             <label htmlFor="email" className='text-sm text-neutral-500 font-medium'>Email Address</label>
//             <input type="email" placeholder='eg. roshan@gmail.com' className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400" />
//         </div>

//         <div className="w-full space-y-2">
//             <label htmlFor="phone" className='text-sm text-neutral-500 font-medium'>Phone Number</label>
//             <input type="number" placeholder='eg. +977-9800000000' className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400" />
//         </div>

//         <div className="w-full space-y-2">
//             <label htmlFor="altphone" className='text-sm text-neutral-500 font-medium'>Alternate Phone Number</label>
//             <input type="number" placeholder='eg. +977-9800000000' className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400" />
//         </div>

//         <div className="w-full space-y-2">
//             <label className='text-sm text-neutral-500 font-medium'>Pickup Point</label>
//             <select className='w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400'>
//                 <option selected disabled>
//                     Choose your Nearest Pickup Point
//                 </option>
//                 <option value="gaushala">Gaushala</option>
//                 <option value="tinkune">Tinkune</option>
//                 <option value="koteshwor">Koteshwor</option>
//                 <option value="balkumari">Balkumari</option>
//                 <option value="satdobato">Satdobato</option>
//                 <option value="balkhu">Balkhu</option>
//                 <option value="kalanki">Kalanki</option>
//             </select>
//         </div>
//       </div>

//       {/* Payment Method */}
//       <PaymentMethod />

//     </div>
//   )
// }

// export default PassengerData









import React from 'react'
import PaymentMethod from '../../checkout/passengerdata/payment/PaymentMethod'
import '../../../../../css/PassengerData.css'

const PassengerData = () => {
  return (
    <div className='w-full col-span-4 py-4 space-y-6'>

      <h1 className="text-xl text-neutral-700 font-semibold">
        Passenger Information
      </h1>

      <div className="space-y-7">
        <div className="w-full space-y-2">
          <label htmlFor="fullname" className='text-sm text-neutral-500 font-medium'>Full Name</label>
          <input
            type="text"
            placeholder="eg. Roshan Shah"
            className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
            onInput={(e) => e.target.value = e.target.value.replace(/[0-9]/g, '')}
          />

        </div>

        <div className="w-full space-y-2">
          <label htmlFor="email" className='text-sm text-neutral-500 font-medium'>Email Address</label>
          <input type="email" placeholder='eg. roshan@gmail.com' className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400" />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="phone" className='text-sm text-neutral-500 font-medium'>Phone Number</label>
          <input type="number" placeholder='eg. +977-9800000000'
            className="no-spinner w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="altphone" className='text-sm text-neutral-500 font-medium'>Alternate Phone Number</label>
          <input type="number" placeholder='eg. +977-9800000000'
            className="no-spinner w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label className='text-sm text-neutral-500 font-medium'>Pickup Point</label>
          <select
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
            className="w-full h-14 px-4 bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          >
            <option selected disabled>
              Choose your Nearest Pickup Point
            </option>
            <option value="gaushala">Gaushala</option>
            <option value="tinkune">Tinkune</option>
            <option value="koteshwor">Koteshwor</option>
            <option value="balkumari">Balkumari</option>
            <option value="satdobato">Satdobato</option>
            <option value="balkhu">Balkhu</option>
            <option value="kalanki">Kalanki</option>
          </select>
        </div>
      </div>

      {/* Payment Method */}
      <PaymentMethod />

    </div>
  )
}

export default PassengerData
