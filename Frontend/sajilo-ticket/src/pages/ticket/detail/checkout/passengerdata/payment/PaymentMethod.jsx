import React, { useState, useEffect } from 'react';
import PaymentCard from '../../../../../../components/payment/PaymentCard';
import khalti from '../../../../../../assets/khalti.png';

const PaymentMethod = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const handleChange = (value) => {
    const newValue = selectedPaymentMethod === value ? '' : value;
    setSelectedPaymentMethod(newValue);

    // Dispatch custom event with the selected payment method
    const event = new CustomEvent('paymentMethodSelected', {
      detail: { paymentMethod: newValue }
    });
    window.dispatchEvent(event);
  };

  // Dispatch initial value on component mount
  useEffect(() => {
    const event = new CustomEvent('paymentMethodSelected', {
      detail: { paymentMethod: selectedPaymentMethod }
    });
    window.dispatchEvent(event);
  }, []);

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