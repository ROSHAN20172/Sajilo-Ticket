import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Button,
    Modal,
    IconButton,
    TextField,
    Typography,
    InputAdornment,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Pagination,
    TablePagination,
    Divider,
    Paper,
    Grid
} from '@mui/material';
import { FaEye, FaSearch, FaFilter, FaArrowLeft, FaFileInvoice, FaCalendarAlt, FaTimes, FaBus, FaUser, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaCouch, FaTicketAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../../../components/loading/LoadingSpinner';

// Modal style (consistent with other management pages)
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 700,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '8px'
};

const ManageBookings = () => {
    const { backendUrl, operatorData } = useContext(OperatorAppContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState('all');
    const [filteredBookings, setFilteredBookings] = useState([]);

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Bus filter states
    const [busFilter, setBusFilter] = useState('all');
    const [operatorBuses, setOperatorBuses] = useState([]);

    const navigate = useNavigate();

    // Function to go back to the previous page
    const handleClose = () => {
        navigate(-1);
    };

    // Fetch operator's buses for the filter
    useEffect(() => {
        const fetchOperatorBuses = async () => {
            try {
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${backendUrl}/api/operator/bus/buses`);
                if (res.data) {
                    setOperatorBuses(res.data);
                }
            } catch (error) {
                console.error("Error fetching operator buses:", error);
            }
        };
        fetchOperatorBuses();
    }, [backendUrl]);

    // Fetch bookings for the operator's buses
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                // Use withCredentials to send cookies with the request (matches other operator modules)
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${backendUrl}/api/operator/bookings`);
                console.log("API response:", res.data);
                setBookings(res.data.bookings || []);
                setFilteredBookings(res.data.bookings || []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error('Failed to fetch bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [backendUrl, operatorData]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        filterBookings(e.target.value, statusFilter, dateRangeFilter, dateFilter, busFilter);
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        filterBookings(searchQuery, e.target.value, dateRangeFilter, dateFilter, busFilter);
    };

    // Handle date range filter change
    const handleDateRangeFilterChange = (e) => {
        setDateRangeFilter(e.target.value);
        filterBookings(searchQuery, statusFilter, e.target.value, dateFilter, busFilter);
    };

    // Handle date filter change
    const handleDateFilterChange = (e) => {
        setDateFilter(e.target.value);
        filterBookings(searchQuery, statusFilter, dateRangeFilter, e.target.value, busFilter);
    };

    // Handle bus filter change
    const handleBusFilterChange = (e) => {
        setBusFilter(e.target.value);
        filterBookings(searchQuery, statusFilter, dateRangeFilter, dateFilter, e.target.value);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateRangeFilter('all');
        setDateFilter('');
        setBusFilter('all');
        setFilteredBookings(bookings);
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter bookings based on search query and filters
    const filterBookings = (query, status, dateRange, date, bus) => {
        let filtered = [...bookings];

        // Apply search query
        if (query) {
            const lowerCaseQuery = query.toLowerCase();
            filtered = filtered.filter(booking =>
                (booking.bookingId && booking.bookingId.toLowerCase().includes(lowerCaseQuery)) ||
                (booking.passengerInfo?.name && booking.passengerInfo.name.toLowerCase().includes(lowerCaseQuery)) ||
                (booking.ticketInfo?.busName && booking.ticketInfo.busName.toLowerCase().includes(lowerCaseQuery)) ||
                (booking.ticketInfo?.busNumber && booking.ticketInfo.busNumber.toLowerCase().includes(lowerCaseQuery)) ||
                (booking.ticketInfo?.fromLocation && booking.ticketInfo.fromLocation.toLowerCase().includes(lowerCaseQuery)) ||
                (booking.ticketInfo?.toLocation && booking.ticketInfo.toLocation.toLowerCase().includes(lowerCaseQuery))
            );
        }

        // Apply status filter
        if (status !== 'all') {
            filtered = filtered.filter(booking => {
                if (status === 'success') {
                    return booking.status === 'confirmed' || booking.paymentStatus === 'paid';
                } else if (status === 'failed') {
                    return booking.status === 'pending' || booking.paymentStatus === 'pending';
                }
                return true;
            });
        }

        // Apply date range filter
        if (dateRange !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            filtered = filtered.filter(booking => {
                const bookingDate = booking.ticketInfo?.date
                    ? new Date(booking.ticketInfo.date)
                    : new Date(booking.bookingDate);

                switch (dateRange) {
                    case 'today':
                        return bookingDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        return bookingDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        return bookingDate >= monthAgo;
                    case 'upcoming':
                        return bookingDate >= today;
                    default:
                        return true;
                }
            });
        }

        // Apply specific date filter
        if (date) {
            const filterDate = new Date(date);
            filterDate.setHours(0, 0, 0, 0);

            filtered = filtered.filter(booking => {
                const bookingDate = booking.ticketInfo?.date
                    ? new Date(booking.ticketInfo.date)
                    : new Date(booking.bookingDate);

                return bookingDate.toDateString() === filterDate.toDateString();
            });
        }

        // Apply bus filter
        if (bus !== 'all') {
            filtered = filtered.filter(booking =>
                booking.busId === bus ||
                booking.bus === bus ||
                (booking.ticketInfo && booking.ticketInfo.busId === bus)
            );
        }

        setFilteredBookings(filtered);
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

    // Open booking details modal
    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setModalOpen(true);
    };

    // View invoice
    const handleViewInvoice = (booking) => {
        // Navigate to invoice page with booking ID
        navigate(`/bus-tickets/invoice?bookingId=${booking.bookingId || booking._id}`);
    };

    // Close booking details modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedBooking(null);
    };

    // Determine CSS class for status display
    const getStatusClass = (status, paymentStatus) => {
        if (status === 'confirmed' || paymentStatus === 'paid') {
            return 'bg-green-100 text-green-800';
        } else if (status === 'canceled' || paymentStatus === 'refunded') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-red-100 text-red-800'; // Changed from yellow to red for failed status
    };

    // Get display text for status
    const getStatusText = (status, paymentStatus) => {
        if (status === 'confirmed' || paymentStatus === 'paid') {
            return 'Success'; // Changed from 'Confirmed' to 'Success'
        } else if (status === 'canceled' || paymentStatus === 'refunded') {
            return 'Canceled';
        }
        return 'Failed'; // Changed from 'Pending'
    };

    return (
        <div className="px-4 md:px-8 py-6 relative">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold">Manage Bookings</h1>
                </div>
                <IconButton onClick={handleClose} className="absolute top-4 right-4" sx={{ color: 'red' }}>
                    <FaTimes className="h-5 w-5" />
                </IconButton>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3 md:mb-0 flex items-center">
                        <FaSearch className="mr-2 text-primary" />
                        Search Bookings
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center w-full md:w-auto space-y-2 sm:space-y-0">
                        <div className="flex items-center w-full sm:w-auto">
                            <label className="text-gray-600 mr-2 flex items-center text-sm md:text-base">
                                <FaFilter className="mr-1 text-primary" />
                                Status:
                            </label>
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="form-select border border-gray-300 rounded-md px-2 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                            >
                                <option value="all">All</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="flex items-center w-full sm:w-auto sm:ml-4">
                            <label className="text-gray-600 mr-2 flex items-center text-sm md:text-base">
                                <FaCalendarAlt className="mr-1 text-primary" />
                                Date:
                            </label>
                            <select
                                value={dateRangeFilter}
                                onChange={handleDateRangeFilterChange}
                                className="form-select border border-gray-300 rounded-md px-2 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="upcoming">Upcoming</option>
                            </select>
                        </div>

                        <div className="flex items-center w-full sm:w-auto sm:ml-4">
                            <label className="text-gray-600 mr-2 flex items-center text-sm md:text-base">
                                <FaBus className="mr-1 text-primary" />
                                Bus:
                            </label>
                            <select
                                value={busFilter}
                                onChange={handleBusFilterChange}
                                className="form-select border border-gray-300 rounded-md px-2 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                            >
                                <option value="all">All Buses</option>
                                {operatorBuses.map((bus) => (
                                    <option key={bus._id} value={bus._id}>
                                        {bus.busName} ({bus.busNumber})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={resetFilters}
                            className="ml-0 sm:ml-4 px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 w-full sm:w-auto mt-2 sm:mt-0"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Advanced Search Options */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 mb-4">
                    {/* General Search - taking 3 columns */}
                    <div className="md:col-span-3">
                        <TextField
                            fullWidth
                            placeholder="Search by booking ID, passenger name, route..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>

                    {/* Date Search - taking 1 column */}
                    <div>
                        <TextField
                            fullWidth
                            type="date"
                            label="Travel Date"
                            value={dateFilter}
                            onChange={handleDateFilterChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaCalendarAlt />
                                    </InputAdornment>
                                ),
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ height: '100%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="mb-2 text-sm text-gray-600">
                Showing {Math.min(rowsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-10">
                    <LoadingSpinner />
                </div>
            )}

            {/* No Bookings State */}
            {!loading && filteredBookings.length === 0 && (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500 text-lg mb-2">No bookings found</p>
                    <p className="text-gray-400">
                        {searchQuery || statusFilter !== 'all' || dateRangeFilter !== 'all' || dateFilter || busFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'You don\'t have any bookings yet'}
                    </p>
                </div>
            )}

            {/* Bookings Table - Desktop and Mobile View */}
            {!loading && filteredBookings.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Passenger
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bus Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Route
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Travel Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {booking.bookingId || booking._id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.passengerInfo?.name || 'N/A'}
                                                <div className="text-xs text-gray-400">
                                                    {booking.passengerInfo?.phone || 'No phone'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.ticketInfo?.busName || 'N/A'}
                                                <div className="text-xs">
                                                    {booking.ticketInfo?.busNumber || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                NPR {booking.price || booking.ticketInfo?.totalPrice || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
                                                    {getStatusText(booking.status, booking.paymentStatus)}
                                                </span>
                                            </td>
                                            <td className="py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex">
                                                    <button
                                                        onClick={() => handleViewDetails(booking)}
                                                        className="text-primary hover:text-primary/80 flex items-center"
                                                    >
                                                        <FaEye className="h-5 w-5 mr-1" />
                                                        <span>Details</span>
                                                    </button>
                                                    {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
                                                        <button
                                                            onClick={() => handleViewInvoice(booking)}
                                                            className="text-primary hover:text-primary/80 flex items-center ml-5"
                                                        >
                                                            <FaTicketAlt className="h-5 w-5 mr-1" />
                                                            <span>Ticket</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={filteredBookings.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Items per page:"
                    />
                </div>
            )}

            {/* Booking Details Modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                aria-labelledby="booking-details-modal"
            >
                <Box sx={modalStyle}>
                    {selectedBooking && (
                        <>
                            {/* Modal Header */}
                            <div className="bg-primary text-white p-4 rounded-t-lg relative">
                                <div className="flex justify-between items-center">
                                    <Typography variant="h6" component="h2" className="font-bold">
                                        Booking Details
                                    </Typography>
                                    <IconButton
                                        onClick={closeModal}
                                        size="small"
                                        sx={{
                                            color: 'white',
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.3)'
                                            }
                                        }}
                                    >
                                        <FaTimes />
                                    </IconButton>
                                </div>

                                <div className="mt-2 flex items-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getStatusClass(selectedBooking.status, selectedBooking.paymentStatus)}`}>
                                        {getStatusText(selectedBooking.status, selectedBooking.paymentStatus)}
                                    </span>
                                    <div className="text-sm opacity-90">Booking ID: {selectedBooking.bookingId || selectedBooking._id}</div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Main Booking Info */}
                                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 shadow-sm">
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={3}>
                                            <div className="text-xs text-gray-500 mb-1">Booking Date</div>
                                            <div className="text-sm font-medium">{formatDate(selectedBooking.bookingDate || selectedBooking.createdAt)}</div>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <div className="text-xs text-gray-500 mb-1">Travel Date</div>
                                            <div className="text-sm font-medium">{formatDate(selectedBooking.ticketInfo?.date)}</div>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <div className="text-xs text-gray-500 mb-1">Amount</div>
                                            <div className="text-sm font-semibold text-primary">
                                                NPR {selectedBooking.price || selectedBooking.ticketInfo?.totalPrice || 0}
                                            </div>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                                            <div className="text-sm font-medium">
                                                {selectedBooking.paymentStatus === 'paid' ?
                                                    <span className="text-green-600">Paid</span> :
                                                    <span className="text-red-600">{selectedBooking.paymentStatus || 'Pending'}</span>}
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>

                                {/* Passenger Information */}
                                <div className="mb-6">
                                    <div className="flex items-center mb-3">
                                        <FaUser className="text-primary mr-2" />
                                        <Typography variant="subtitle1" className="font-bold">
                                            Passenger Information
                                        </Typography>
                                    </div>
                                    <Paper elevation={0} className="border border-gray-200 rounded-lg p-4">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Name</div>
                                                <div className="text-sm font-medium">{selectedBooking.passengerInfo?.name || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Phone</div>
                                                <div className="text-sm font-medium">{selectedBooking.passengerInfo?.phone || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Email</div>
                                                <div className="text-sm font-medium break-all">{selectedBooking.passengerInfo?.email || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Alt. Phone</div>
                                                <div className="text-sm font-medium">{selectedBooking.passengerInfo?.alternatePhone || 'N/A'}</div>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>

                                {/* Bus & Route Details */}
                                <div className="mb-6">
                                    <div className="flex items-center mb-3">
                                        <FaBus className="text-primary mr-2" />
                                        <Typography variant="subtitle1" className="font-bold">
                                            Bus & Route Details
                                        </Typography>
                                    </div>
                                    <Paper elevation={0} className="border border-gray-200 rounded-lg p-4">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Bus Name</div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.busName || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Bus Number</div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.busNumber || 'N/A'}</div>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider className="my-2" />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <div className="flex items-center mb-1">
                                                    <FaMapMarkerAlt className="text-green-600 mr-1 text-xs" />
                                                    <div className="text-xs text-gray-500">From</div>
                                                </div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.fromLocation || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="flex items-center mb-1">
                                                    <FaMapMarkerAlt className="text-red-600 mr-1 text-xs" />
                                                    <div className="text-xs text-gray-500">To</div>
                                                </div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.toLocation || 'N/A'}</div>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider className="my-2" />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Pickup Point</div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.pickupPoint || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="text-xs text-gray-500 mb-1">Drop Point</div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.dropPoint || 'N/A'}</div>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider className="my-2" />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <div className="flex items-center mb-1">
                                                    <FaClock className="text-blue-600 mr-1 text-xs" />
                                                    <div className="text-xs text-gray-500">Departure Time</div>
                                                </div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.departureTime || 'N/A'}</div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <div className="flex items-center mb-1">
                                                    <FaClock className="text-orange-600 mr-1 text-xs" />
                                                    <div className="text-xs text-gray-500">Arrival Time</div>
                                                </div>
                                                <div className="text-sm font-medium">{selectedBooking.ticketInfo?.arrivalTime || 'N/A'}</div>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>

                                {/* Seat Details */}
                                <div className="mb-6">
                                    <div className="flex items-center mb-3">
                                        <FaCouch className="text-primary mr-2" />
                                        <Typography variant="subtitle1" className="font-bold">
                                            Seat Details
                                        </Typography>
                                    </div>
                                    <Paper elevation={0} className="border border-gray-200 rounded-lg p-4">
                                        <div className="text-sm">
                                            {selectedBooking.ticketInfo?.selectedSeats
                                                ? Array.isArray(selectedBooking.ticketInfo.selectedSeats)
                                                    ? selectedBooking.ticketInfo.selectedSeats.map((seat, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-block bg-primary/10 text-primary px-2 py-1 m-1 rounded-md font-medium"
                                                        >
                                                            {seat}
                                                        </span>
                                                    ))
                                                    : selectedBooking.ticketInfo.selectedSeats
                                                : 'N/A'}
                                        </div>
                                    </Paper>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end mt-6">
                                    {(selectedBooking.status === 'confirmed' || selectedBooking.paymentStatus === 'paid') && (
                                        <Button
                                            variant="contained"
                                            startIcon={<FaTicketAlt />}
                                            onClick={() => handleViewInvoice(selectedBooking)}
                                            sx={{
                                                backgroundColor: '#e53e3e',
                                                '&:hover': { backgroundColor: '#c53030' },
                                                paddingLeft: '16px',
                                                paddingRight: '16px'
                                            }}
                                        >
                                            View Ticket
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default ManageBookings;