// // // May uninstall if not used in future npm uninstall @mui/x-data-grid recharts @emotion/styled

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowRight, FaTicketAlt } from 'react-icons/fa';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import OperatorLayout from '../../../layout/operator/OperatorLayout';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(OperatorAppContext);
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
    <OperatorLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
              <h3 className="text-gray-500 text-xs md:text-sm mb-2">Total Buses</h3>
              <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalBuses}</p>
              <div className="mt-2">
                <Link to="/operator/buses" className="text-primary text-xs md:text-sm hover:underline flex items-center">
                  Manage buses <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
              <h3 className="text-gray-500 text-xs md:text-sm mb-2">Completed Bookings</h3>
              <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalCompletedBookings}</p>
              <div className="mt-2">
                <Link to="/operator/bookings" className="text-primary text-xs md:text-sm hover:underline flex items-center">
                  View all bookings <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
              <h3 className="text-gray-500 text-xs md:text-sm mb-2">Total Revenue</h3>
              <p className="text-xl md:text-3xl font-bold text-gray-800">Rs. {dashboardData.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">From completed bookings</p>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-semibold">Recent Bookings</h2>
              <Link to="/operator/bookings" className="text-primary hover:text-primary/80 flex items-center text-xs md:text-sm">
                View all <FaArrowRight className="ml-1" />
              </Link>
            </div>

            {dashboardData.recentBookings.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile Booking Cards */}
                <div className="lg:hidden space-y-4">
                  {dashboardData.recentBookings.map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">ID: {booking.bookingId || booking._id}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
                          {getStatusText(booking.status, booking.paymentStatus)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Passenger: {booking.passengerInfo?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Date: {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-medium">
                          Rs. {booking.price || (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0}
                        </p>
                        {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
                          <button
                            onClick={() => handleViewTicket(booking)}
                            className="text-primary hover:text-primary/80 flex items-center text-xs"
                          >
                            <FaTicketAlt className="mr-1" /> View Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <table className="hidden lg:table w-full">
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
                        <td className="py-3 pr-3 text-right">
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
    </OperatorLayout>
  );
};

export default OperatorDashboard;