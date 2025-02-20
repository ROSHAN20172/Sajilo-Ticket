import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsOperatorLoggedin, operatorData, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/operator/auth/logout`);
      // Set suppression flag to avoid the protected route toast after logout
      setSuppressUnauthorizedToast(true);
      setIsOperatorLoggedin(false);
      toast.success("Operator logged out successfully!");
      navigate('/operator/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Operator Dashboard</h2>
        {operatorData && <p className="text-gray-600 mb-6">Welcome, {operatorData.name}!</p>}
        <button 
          onClick={handleLogout} 
          className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
          Logout
        </button>
      </div>
    </div>
  );
};

export default OperatorDashboard;