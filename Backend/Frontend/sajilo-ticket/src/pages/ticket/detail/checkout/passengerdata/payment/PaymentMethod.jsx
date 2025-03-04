// import React, { useState } from 'react'
// import PaymentCard from '../../../../../../components/payment/PaymentCard';
// import khalti from '../../../../../../assets/khalti.png';
//
// const PaymentMethod = () => {

//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

//   const handleChange = (e) => {
//     setSelectedPaymentMethod(e.target.value);
//   }
//   return (
//     <div className='w-full space-y-3'>
//       <h6 className="text-sm text-neutral-600 font-medium">
//         Select Payment Method
//       </h6>

//       <div className="w-1/2">
//         <PaymentCard 
//         selectedPayment={selectedPaymentMethod}
//         value={"khalti"}
//         onChange={handleChange}
//         cardholderName={""}
//         cardNumber={""}
//         cardImage={khalti}
//         />
//       </div>

//       <div className="w-full flex justify-end"></div>
//     </div>
//   )
// }

// export default PaymentMethod













import React, { useState } from 'react';
import PaymentCard from '../../../../../../components/payment/PaymentCard';
import khalti from '../../../../../../assets/khalti.png';

const PaymentMethod = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const handleChange = (value) => {
    setSelectedPaymentMethod((prev) => (prev === value ? '' : value));
  };

  return (
    <div className='w-full space-y-3'>
      <h6 className="text-sm text-neutral-600 font-medium">
        Select Payment Method
      </h6>

      <div className="w-1/2">
        <PaymentCard 
          selectedPayment={selectedPaymentMethod}
          value={"khalti"}
          onChange={handleChange}
          cardholderName={""}
          cardNumber={""}
          cardImage={khalti}
        />
      </div>
    </div>
  );
};

export default PaymentMethod