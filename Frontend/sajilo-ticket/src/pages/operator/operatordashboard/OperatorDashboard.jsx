// // // May uninstall if not used in future npm uninstall @mui/x-data-grid recharts @emotion/styled

import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const OperatorLayout = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsOperatorLoggedin, operatorData, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/operator/auth/logout`);
      // Set suppression flag to avoid the protected route toast after logout
      setSuppressUnauthorizedToast(true);
      setIsOperatorLoggedin(false);
      toast.success("Operator logged out successfully!");
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Operator Panel</h2>
          <p className="text-sm text-gray-600 mt-1">Welcome, {operatorData?.name}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/operator/dashboard" className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/operator/add-bus" className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Bus
              </Link>
            </li>
            <li>
              <Link to="/operator/buses" className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Manage Buses
              </Link>
            </li>
            <li>
              <Link to="/operator/bookings" className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Bookings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-1 mb-1">
        <header className="bg-white shadow-sm mb-8"> {/* Added header with shadow */}
          <div className="flex justify-between items-center px-8 py-4"> {/* Added padding */}
            <h1 className="text-2xl font-bold text-gray-800">Operator Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ml-8 mr-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Total Buses</h3>
            <p className="text-3xl font-bold text-gray-800">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Active Bookings</h3>
            <p className="text-3xl font-bold text-gray-800">142</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-gray-800">$12,450</p>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 ml-8 mr-8">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Route</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Add table rows here */}
              </tbody>
            </table>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default OperatorLayout;