// // // May uninstall if not used in future npm uninstall @mui/x-data-grid recharts @emotion/styled

import React, { useContext, useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLogOut } from 'react-icons/fi';
import { FaEye, FaArrowRight, FaTicketAlt } from 'react-icons/fa';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';

const OperatorLayout = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsOperatorLoggedin, operatorData, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);
  const [dashboardData, setDashboardData] = useState({
    totalBuses: 0,
    totalCompletedBookings: 0,
    totalRevenue: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        axios.defaults.withCredentials = true;

        // Fetch buses
        const busesRes = await axios.get(`${backendUrl}/api/operator/bus/buses`);

        // Fetch bookings
        const bookingsRes = await axios.get(`${backendUrl}/api/operator/bookings`);

        // Calculate stats
        const totalBuses = busesRes.data.length || 0;

        // Filter completed/confirmed bookings
        const completedBookings = bookingsRes.data.bookings ?
          bookingsRes.data.bookings.filter(booking =>
            booking.status === 'confirmed' || booking.paymentStatus === 'paid'
          ) : [];

        // Calculate total revenue from completed bookings
        const revenue = completedBookings.reduce((total, booking) => {
          const bookingAmount = booking.price ||
            (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0;
          return total + Number(bookingAmount);
        }, 0);

        // Get 5 most recent bookings
        const recentBookings = bookingsRes.data.bookings ?
          [...bookingsRes.data.bookings]
            .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
            .slice(0, 5) : [];

        setDashboardData({
          totalBuses,
          totalCompletedBookings: completedBookings.length,
          totalRevenue: revenue,
          recentBookings
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl]);

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status class for display
  const getStatusClass = (status, paymentStatus) => {
    if (status === 'confirmed' || paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'canceled' || paymentStatus === 'refunded') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-red-100 text-red-800';
  };

  // Get display text for status
  const getStatusText = (status, paymentStatus) => {
    if (status === 'confirmed' || paymentStatus === 'paid') {
      return 'Success';
    } else if (status === 'canceled' || paymentStatus === 'refunded') {
      return 'Canceled';
    }
    return 'Failed';
  };

  // Handle view ticket action
  const handleViewTicket = (booking) => {
    navigate(`/bus-tickets/invoice?bookingId=${booking.bookingId || booking._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="p-5 border-b">
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
              <Link to="/operator/bus-routes" className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Manage Routes
              </Link>
            </li>
            <li>
              <Link to="/operator/bus-schedules" className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bus Schedule
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
        <header className="bg-white shadow-sm mb-8">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-4xl text-primary font-bold mt-2 mb-2">SAJILO TICKET</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              Logout
              <FiLogOut className='ml-2' />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ml-8 mr-8">
              <div className="bg-white p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
                <h3 className="text-gray-500 text-sm mb-2">Total Buses</h3>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.totalBuses}</p>
                <div className="mt-2">
                  <Link to="/operator/buses" className="text-primary text-sm hover:underline flex items-center">
                    Manage buses <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
                <h3 className="text-gray-500 text-sm mb-2">Completed Bookings</h3>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.totalCompletedBookings}</p>
                <div className="mt-2">
                  <Link to="/operator/bookings" className="text-primary text-sm hover:underline flex items-center">
                    View all bookings <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
                <h3 className="text-gray-500 text-sm mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-800">Rs. {dashboardData.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">From completed bookings</p>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 ml-8 mr-8 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Bookings</h2>
                <Link to="/operator/bookings" className="text-primary hover:text-primary/80 flex items-center text-sm">
                  View all <FaArrowRight className="ml-1" />
                </Link>
              </div>

              {dashboardData.recentBookings.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No bookings found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 pl-3">Booking ID</th>
                        <th className="pb-3">Passenger</th>
                        <th className="pb-3">Route</th>
                        <th className="pb-3">Travel Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentBookings.map((booking) => (
                        <tr key={booking._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 pl-3 pr-2 text-sm">
                            {booking.bookingId || booking._id}
                          </td>
                          <td className="py-3 pr-2 text-sm">
                            {booking.passengerInfo?.name || 'N/A'}
                          </td>
                          <td className="py-3 pr-2 text-sm">
                            {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
                          </td>
                          <td className="py-3 pr-2 text-sm">
                            {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
                          </td>
                          <td className="py-3 pr-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
                              {getStatusText(booking.status, booking.paymentStatus)}
                            </span>
                          </td>
                          <td className="py-3 pr-2 text-sm font-medium">
                            Rs. {booking.price || (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0}
                          </td>
                          <td className="py-3 pr-3 text-right w-24">
                            {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
                              <button
                                onClick={() => handleViewTicket(booking)}
                                className="text-primary hover:text-primary/80 flex items-center text-sm"
                              >
                                <FaTicketAlt className="mr-1" />Ticket
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default OperatorLayout;