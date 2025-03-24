import React, { useState, useEffect, useContext } from 'react';
import { UserAppContext } from '../../../context/UserAppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import RootLayout from '../../../layout/RootLayout';
import TopLayout from '../../../layout/toppage/TopLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { FaDownload, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

const UserBookings = () => {
    const { backendUrl, userData } = useContext(UserAppContext);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState({
        bookingId: '',
        route: '',
        date: '',
        seats: '',
        amount: ''
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRangeFilter, setDateRangeFilter] = useState('all');

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                setLoading(true);
                // Set withCredentials to true to send cookies with the request
                axios.defaults.withCredentials = true;
                const response = await axios.get(`${backendUrl}/api/user/bookings`);

                if (response.data.success) {
                    setBookings(response.data.bookings);
                    setFilteredBookings(response.data.bookings);
                } else {
                    setError('Failed to fetch bookings.');
                    toast.error('Failed to fetch your bookings.');
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setError('Error fetching your bookings. Please try again later.');
                toast.error('Error fetching your bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserBookings();
    }, [backendUrl]);

    // Apply filters whenever search query or status filter changes
    useEffect(() => {
        filterBookings();
    }, [searchQuery, statusFilter, bookings]);

    // Function to filter bookings based on search query and status filter
    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => {
                const status = booking.paymentStatus || booking.status || 'pending';
                if (statusFilter === 'success') {
                    return status === 'confirmed' || status === 'paid';
                } else if (statusFilter === 'failed') {
                    return status === 'canceled' || status === 'refunded' || status === 'pending';
                }
                return true;
            });
        }

        // Filter by date range
        if (dateRangeFilter !== 'all') {
            filtered = filtered.filter(booking => {
                const journeyDate = getNestedProperty(booking, 'ticketInfo.date') || booking.journeyDate || booking.date;
                if (!journeyDate) return false;

                const bookingDate = new Date(journeyDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Calculate start of week (Sunday)
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());

                // Calculate start of month
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                // Calculate start of year
                const startOfYear = new Date(today.getFullYear(), 0, 1);

                switch (dateRangeFilter) {
                    case 'today':
                        // Check if the booking date is today
                        const todayEnd = new Date(today);
                        todayEnd.setHours(23, 59, 59, 999);
                        return bookingDate >= today && bookingDate <= todayEnd;

                    case 'week':
                        // Check if the booking date is in this week
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 7);
                        return bookingDate >= startOfWeek && bookingDate < endOfWeek;

                    case 'month':
                        // Check if the booking date is in this month
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        endOfMonth.setHours(23, 59, 59, 999);
                        return bookingDate >= startOfMonth && bookingDate <= endOfMonth;

                    case 'year':
                        // Check if the booking date is in this year
                        const endOfYear = new Date(today.getFullYear(), 11, 31);
                        endOfYear.setHours(23, 59, 59, 999);
                        return bookingDate >= startOfYear && bookingDate <= endOfYear;

                    default:
                        return true;
                }
            });
        }

        // Filter by search queries
        if (searchQuery.bookingId) {
            filtered = filtered.filter(booking =>
                (booking.bookingId || booking._id || '').toString().toLowerCase().includes(searchQuery.bookingId.toLowerCase())
            );
        }

        if (searchQuery.route) {
            filtered = filtered.filter(booking => {
                const fromLocation = getNestedProperty(booking, 'ticketInfo.fromLocation') || booking.fromLocation || '';
                const toLocation = getNestedProperty(booking, 'ticketInfo.toLocation') || booking.toLocation || '';
                const route = `${fromLocation} to ${toLocation}`.toLowerCase();
                return route.includes(searchQuery.route.toLowerCase());
            });
        }

        if (searchQuery.date) {
            filtered = filtered.filter(booking => {
                const journeyDate = getNestedProperty(booking, 'ticketInfo.date') || booking.journeyDate || booking.date || '';
                if (!journeyDate) return false;

                const formattedDate = formatDate(journeyDate).toLowerCase();
                return formattedDate.includes(searchQuery.date.toLowerCase());
            });
        }

        if (searchQuery.seats) {
            filtered = filtered.filter(booking => {
                const seats = getNestedProperty(booking, 'ticketInfo.selectedSeats') || booking.selectedSeats || [];
                const seatsStr = Array.isArray(seats) ? seats.join(', ') : seats.toString();
                return seatsStr.toLowerCase().includes(searchQuery.seats.toLowerCase());
            });
        }

        if (searchQuery.amount) {
            filtered = filtered.filter(booking => {
                const price = booking.price || getNestedProperty(booking, 'ticketInfo.totalPrice') || booking.totalPrice || 0;
                return price.toString().includes(searchQuery.amount);
            });
        }

        setFilteredBookings(filtered);
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchQuery(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Handle date range filter change
    const handleDateRangeFilterChange = (e) => {
        setDateRangeFilter(e.target.value);
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery({
            bookingId: '',
            route: '',
            date: '',
            seats: '',
            amount: ''
        });
        setStatusFilter('all');
        setDateRangeFilter('all');
    };

    const handleViewInvoice = (ticketId) => {
        // Set verified payment info in localStorage for the invoice page to use
        localStorage.setItem('ticketId', ticketId);
        localStorage.setItem('paymentVerified', 'true');

        // Navigate to invoice page with required state
        navigate('/bus-tickets/invoice', {
            state: {
                ticketId,
                paymentVerified: true
            }
        });
    };

    // Helper function to format date string
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'canceled':
            case 'refunded':
            case 'pending':
            default:
                return 'bg-red-100 text-red-800';
        }
    };

    // Function to format the status display text
    const formatStatus = (status) => {
        switch (status) {
            case 'confirmed':
            case 'paid':
                return 'Success';
            case 'canceled':
            case 'refunded':
            case 'pending':
                return 'Failed';
            default:
                return 'Failed'; // Default to Failed
        }
    };

    // Function to safely get nested properties
    const getNestedProperty = (obj, path, defaultValue = 'N/A') => {
        const travel = path.split('.');
        let result = obj;

        for (const key of travel) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return defaultValue;
            }
            result = result[key];
        }

        return result || defaultValue;
    };

    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Layout */}
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"My Bookings"}
            />

            <RootLayout className="space-y-8 w-full pb-16">
                <div className="w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Booking History</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingSpinner size="large" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => navigate('/bus-tickets')}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Browse Bus Tickets
                            </button>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-lg shadow-sm p-8">
                            <div className="text-gray-500 text-6xl mb-4">
                                <i className="fas fa-ticket-alt"></i>
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No Bookings Found</h3>
                            <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
                            <button
                                onClick={() => navigate('/bus-tickets')}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Browse Bus Tickets
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Search and Filter Section */}
                            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 md:mb-0 flex items-center">
                                        <FaSearch className="mr-2" />
                                        Search Bookings
                                    </h3>
                                    <div className="flex items-center">
                                        <label className="text-gray-600 mr-2 flex items-center">
                                            <FaFilter className="mr-1" />
                                            Status:
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={handleStatusFilterChange}
                                            className="form-select border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">All</option>
                                            <option value="success">Success</option>
                                            <option value="failed">Failed</option>
                                        </select>

                                        <label className="text-gray-600 ml-4 mr-2 flex items-center">
                                            <FaFilter className="mr-1" />
                                            Date Range:
                                        </label>
                                        <select
                                            value={dateRangeFilter}
                                            onChange={handleDateRangeFilterChange}
                                            className="form-select border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="year">This Year</option>
                                        </select>

                                        <button
                                            onClick={resetFilters}
                                            className="ml-4 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
                                        <input
                                            type="text"
                                            name="bookingId"
                                            value={searchQuery.bookingId}
                                            onChange={handleSearchChange}
                                            placeholder="Search by ID"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                        <input
                                            type="text"
                                            name="route"
                                            value={searchQuery.route}
                                            onChange={handleSearchChange}
                                            placeholder="From - To"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                                        <input
                                            type="text"
                                            name="date"
                                            value={searchQuery.date}
                                            onChange={handleSearchChange}
                                            placeholder="Date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                                        <input
                                            type="text"
                                            name="seats"
                                            value={searchQuery.seats}
                                            onChange={handleSearchChange}
                                            placeholder="Seat numbers"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={searchQuery.amount}
                                            onChange={handleSearchChange}
                                            placeholder="Price"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="mb-2 text-sm text-gray-600">
                                Showing {filteredBookings.length} of {bookings.length} bookings
                            </div>

                            {/* Bookings Table */}
                            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Booking ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Route
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Travel Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Seats
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No bookings match your search criteria
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBookings.map((booking) => {
                                                // Get data from potentially nested objects
                                                const bookingId = booking.bookingId || booking._id || 'N/A';
                                                const fromLocation = getNestedProperty(booking, 'ticketInfo.fromLocation') || booking.fromLocation || 'N/A';
                                                const toLocation = getNestedProperty(booking, 'ticketInfo.toLocation') || booking.toLocation || 'N/A';
                                                const journeyDate = getNestedProperty(booking, 'ticketInfo.date') || booking.journeyDate || booking.date || 'N/A';
                                                const seats = getNestedProperty(booking, 'ticketInfo.selectedSeats') || booking.selectedSeats || [];
                                                const price = booking.price || getNestedProperty(booking, 'ticketInfo.totalPrice') || booking.totalPrice || 0;
                                                const status = booking.paymentStatus || booking.status || 'pending';

                                                return (
                                                    <tr key={booking._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {bookingId}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {fromLocation} to {toLocation}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(journeyDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {Array.isArray(seats) ? seats.join(', ') : seats || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            NPR {price}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                                                                {formatStatus(status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                {(status === 'confirmed' || status === 'paid') && (
                                                                    <button
                                                                        onClick={() => handleViewInvoice(booking._id)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="View Ticket"
                                                                    >
                                                                        <FaEye className="h-5 w-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </RootLayout>
        </div>
    );
};

export default UserBookings; 