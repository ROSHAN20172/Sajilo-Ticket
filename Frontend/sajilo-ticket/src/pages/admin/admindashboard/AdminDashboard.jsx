// import React, { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AdminAppContext } from '../../../context/AdminAppContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { backendUrl, setIsAdminLoggedin, adminData, setSuppressUnauthorizedToast } = useContext(AdminAppContext);

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${backendUrl}/api/admin/auth/logout`);
//       setIsAdminLoggedin(false);
//       setSuppressUnauthorizedToast(true); // Suppress the unauthorized toast here.
//       toast.success("Admin logged out successfully!");
//       navigate('/admin/login');
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleSignup = () => {
//     navigate('/admin/register');
//   };

//   return (
//     <div>
//       <h2>Admin Dashboard</h2>
//       {adminData && <p>Welcome, {adminData.name}!</p>}
//       <button onClick={handleLogout}>Logout</button>
//       <button onClick={handleSignup}>Signup</button>
//     </div>
//   );
// };

// export default AdminDashboard;



















































// import React, { useState, useEffect, useContext } from 'react';
// import { AdminAppContext } from '../../../context/AdminAppContext';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { 
//   FaBus, 
//   FaRoute, 
//   FaTicketAlt, 
//   FaUserTie, 
//   FaChartLine, 
//   FaCog 
// } from "react-icons/fa";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { backendUrl, setIsAdminLoggedin, adminData } = useContext(AdminAppContext);

//   // Active tab for sidebar navigation
//   const [activeTab, setActiveTab] = useState('overview');
//   // Dummy metrics state
//   const [metrics, setMetrics] = useState({
//     totalBookings: 0,
//     totalRevenue: 0,
//     totalBuses: 0,
//     totalRoutes: 0,
//     totalOperators: 0,
//   });
//   // Dummy bookings data
//   const [bookings, setBookings] = useState([]);

//   useEffect(() => {
//     fetchMetrics();
//     fetchRecentBookings();
//   }, []);

//   const fetchMetrics = async () => {
//     try {
//       // In a real application, replace with an API call.
//       const data = {
//         totalBookings: 1200,
//         totalRevenue: 50000,
//         totalBuses: 25,
//         totalRoutes: 15,
//         totalOperators: 5,
//       };
//       setMetrics(data);
//     } catch (error) {
//       toast.error("Failed to fetch metrics");
//     }
//   };

//   const fetchRecentBookings = async () => {
//     try {
//       // In a real application, replace with an API call.
//       const data = [
//         { id: 1, customer: 'John Doe', route: 'City A to City B', date: '2023-02-20', amount: 50 },
//         { id: 2, customer: 'Jane Smith', route: 'City B to City C', date: '2023-02-21', amount: 45 },
//         { id: 3, customer: 'Mike Johnson', route: 'City A to City D', date: '2023-02-22', amount: 60 },
//       ];
//       setBookings(data);
//     } catch (error) {
//       toast.error("Failed to fetch recent bookings");
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${backendUrl}/api/admin/auth/logout`);
//       setIsAdminLoggedin(false);
//       toast.success("Admin logged out successfully!");
//       navigate('/admin/login');
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Render main content based on active sidebar tab
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Total Bookings Card */}
//               <div className="bg-white shadow p-4 rounded">
//                 <div className="flex items-center">
//                   <FaTicketAlt className="text-3xl text-blue-500" />
//                   <div className="ml-4">
//                     <h3 className="text-lg font-semibold">Total Bookings</h3>
//                     <p className="text-2xl">{metrics.totalBookings}</p>
//                   </div>
//                 </div>
//               </div>
//               {/* Total Revenue Card */}
//               <div className="bg-white shadow p-4 rounded">
//                 <div className="flex items-center">
//                   <FaChartLine className="text-3xl text-green-500" />
//                   <div className="ml-4">
//                     <h3 className="text-lg font-semibold">Total Revenue</h3>
//                     <p className="text-2xl">${metrics.totalRevenue}</p>
//                   </div>
//                 </div>
//               </div>
//               {/* Total Buses Card */}
//               <div className="bg-white shadow p-4 rounded">
//                 <div className="flex items-center">
//                   <FaBus className="text-3xl text-red-500" />
//                   <div className="ml-4">
//                     <h3 className="text-lg font-semibold">Total Buses</h3>
//                     <p className="text-2xl">{metrics.totalBuses}</p>
//                   </div>
//                 </div>
//               </div>
//               {/* Total Routes Card */}
//               <div className="bg-white shadow p-4 rounded">
//                 <div className="flex items-center">
//                   <FaRoute className="text-3xl text-purple-500" />
//                   <div className="ml-4">
//                     <h3 className="text-lg font-semibold">Total Routes</h3>
//                     <p className="text-2xl">{metrics.totalRoutes}</p>
//                   </div>
//                 </div>
//               </div>
//               {/* Total Operators Card */}
//               <div className="bg-white shadow p-4 rounded">
//                 <div className="flex items-center">
//                   <FaUserTie className="text-3xl text-yellow-500" />
//                   <div className="ml-4">
//                     <h3 className="text-lg font-semibold">Total Operators</h3>
//                     <p className="text-2xl">{metrics.totalOperators}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-8">
//               <h3 className="text-xl font-bold mb-2">Recent Bookings</h3>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full bg-white shadow rounded">
//                   <thead>
//                     <tr>
//                       <th className="px-4 py-2 border">ID</th>
//                       <th className="px-4 py-2 border">Customer</th>
//                       <th className="px-4 py-2 border">Route</th>
//                       <th className="px-4 py-2 border">Date</th>
//                       <th className="px-4 py-2 border">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {bookings.map((booking) => (
//                       <tr key={booking.id}>
//                         <td className="px-4 py-2 border">{booking.id}</td>
//                         <td className="px-4 py-2 border">{booking.customer}</td>
//                         <td className="px-4 py-2 border">{booking.route}</td>
//                         <td className="px-4 py-2 border">{booking.date}</td>
//                         <td className="px-4 py-2 border">${booking.amount}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         );
//       case 'buses':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Manage Buses</h2>
//             <p>Here you can add, update, or remove bus records.</p>
//             {/* Add your bus management components or forms here */}
//           </div>
//         );
//       case 'routes':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Manage Routes</h2>
//             <p>Here you can define, update, or remove bus routes.</p>
//             {/* Add your route management components or forms here */}
//           </div>
//         );
//       case 'bookings':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>
//             <p>Manage all bookings, filter by date or status, and update records.</p>
//             {/* Add your bookings management components or tables here */}
//           </div>
//         );
//       case 'operators':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Manage Operators</h2>
//             <p>Manage operator accounts and permissions. (Operators have their own panel.)</p>
//             {/* Add your operator management components or forms here */}
//           </div>
//         );
//       case 'reports':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Reports</h2>
//             <p>Generate and view sales, booking, and revenue reports.</p>
//             {/* Add your reports/chart components here */}
//           </div>
//         );
//       case 'settings':
//         return (
//           <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Settings</h2>
//             <p>Configure system settings and admin preferences.</p>
//             {/* Add your settings components or forms here */}
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar Navigation */}
//       <div className="w-64 bg-gray-800 text-white flex flex-col">
//         <div className="p-4 text-3xl font-bold">Admin Panel</div>
//         <nav className="flex-1">
//           <ul>
//             <li
//               onClick={() => setActiveTab('overview')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'overview' ? 'bg-gray-700' : ''}`}
//             >
//               Overview
//             </li>
//             <li
//               onClick={() => setActiveTab('buses')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'buses' ? 'bg-gray-700' : ''}`}
//             >
//               <div className="flex items-center gap-2">
//                 <FaBus /> Manage Buses
//               </div>
//             </li>
//             <li
//               onClick={() => setActiveTab('routes')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'routes' ? 'bg-gray-700' : ''}`}
//             >
//               <div className="flex items-center gap-2">
//                 <FaRoute /> Manage Routes
//               </div>
//             </li>
//             <li
//               onClick={() => setActiveTab('bookings')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'bookings' ? 'bg-gray-700' : ''}`}
//             >
//               <div className="flex items-center gap-2">
//                 <FaTicketAlt /> Manage Bookings
//               </div>
//             </li>
//             <li
//               onClick={() => setActiveTab('operators')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'operators' ? 'bg-gray-700' : ''}`}
//             >
//               <div className="flex items-center gap-2">
//                 <FaUserTie /> Manage Operators
//               </div>
//             </li>
//             <li
//               onClick={() => setActiveTab('reports')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'reports' ? 'bg-gray-700' : ''}`}
//             >
//               <div className="flex items-center gap-2">
//                 <FaChartLine /> Reports
//               </div>
//             </li>
//             <li
//               onClick={() => setActiveTab('settings')}
//               className={`p-4 cursor-pointer hover:bg-gray-700 ${activeTab === 'settings' ? 'bg-gray-700' : ''}`}
//             >
//               <div className="flex items-center gap-2">
//                 <FaCog /> Settings
//               </div>
//             </li>
//           </ul>
//         </nav>
//         <div className="p-4">
//           <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 py-2 rounded">
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 p-6">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;



































































// import React, { useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AdminAppContext } from '../../../context/AdminAppContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { IoBus } from 'react-icons/io5';
// import { FaChartBar, FaUsers, FaTicketAlt, FaCog, FaUserPlus, FaChartLine, FaShieldAlt, FaMap, FaClock, FaDollarSign, FaIdCard, FaThList, FaSearch, FaPlusCircle, FaBell } from 'react-icons/fa';
// import { LineChart, Line, PieChart, Pie, Tooltip } from 'recharts';
// import { DataGrid } from '@mui/x-data-grid';
// import { Select, MenuItem } from '@mui/material';
// import UserManagementView from '../../../components/adminrenderview/usermanagement/UserManagementView';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { backendUrl, setIsAdminLoggedin, adminData, setSuppressUnauthorizedToast } = useContext(AdminAppContext);
//   const [activeView, setActiveView] = useState('dashboard');
//   const [selectedTable, setSelectedTable] = useState('users');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [users, setUsers] = useState([]);
//   const [operators, setOperators] = useState([]);

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${backendUrl}/api/admin/auth/logout`);
//       setIsAdminLoggedin(false);
//       setSuppressUnauthorizedToast(true);
//       toast.success("Admin logged out successfully!");
//       navigate('/');
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleSignup = () => navigate('/admin/register');

//   const userColumns = [
//     {
//       field: 'sno', headerName: 'S.No', width: 100,
//       renderCell: (params) => {
//         const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
//         return <span className="text-gray-600">{rowIndex}</span>;
//       }
//     },
//     { field: 'name', headerName: 'Name', width: 270, headerClassName: 'font-semibold' },
//     { field: 'email', headerName: 'Email', width: 380, headerClassName: 'font-semibold' },
//     {
//       field: 'isAccountVerified', headerName: 'Verified Status', width: 200,
//       renderCell: (params) => (
//         <span className={`font-medium ${params.value ? 'text-green-600' : 'text-red-600'}`}>
//           {params.value ? 'Verified' : 'Unverified'}
//         </span>
//       )
//     },
//     {
//       field: 'isBlocked', headerName: 'Blocked Status', width: 200,
//       renderCell: (params) => (
//         <Select
//           value={params.value ? 'blocked' : 'active'}
//           onChange={(e) => handleStatusChange(params.row._id, 'user', e.target.value)}
//           className="w-full"
//           sx={{
//             '& .MuiSelect-select': {
//               color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500
//             }
//           }}
//         >
//           <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>Active</MenuItem>
//           <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>Blocked</MenuItem>
//         </Select>
//       )
//     },
//   ];

//   const operatorColumns = [
//     {
//       field: 'sno', headerName: 'S.No', width: 80,
//       renderCell: (params) => {
//         const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
//         return <span className="text-gray-600">{rowIndex}</span>;
//       }
//     },
//     { field: 'name', headerName: 'Name', width: 200, headerClassName: 'font-semibold' },
//     { field: 'email', headerName: 'Email', width: 320, headerClassName: 'font-semibold' },
//     { field: 'panNo', headerName: 'PAN Number', width: 130, headerClassName: 'font-semibold' },
//     {
//       field: 'panImage', headerName: 'PAN Image', width: 130,
//       renderCell: (params) => (
//         <a
//           href={params.value}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
//         >View Image</a>
//       )
//     },
//     {
//       field: 'isAccountVerified', headerName: 'Verified Status', width: 150,
//       renderCell: (params) => (
//         <Select
//           value={params.value ? 'verified' : 'unverified'}
//           onChange={(e) => handleVerificationChange(params.row._id, e.target.value)}
//           className="w-full"
//           sx={{
//             '& .MuiSelect-select': {
//               color: params.value ? '#16a34a' : '#dc2626', fontWeight: 500
//             }
//           }}
//         >
//           <MenuItem value="verified" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>Verified</MenuItem>
//           <MenuItem value="unverified" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>Unverified</MenuItem>
//         </Select>
//       )
//     },
//     {
//       field: 'isBlocked', headerName: 'Blocked Status', width: 150,
//       renderCell: (params) => (
//         <Select
//           value={params.value ? 'blocked' : 'active'}
//           onChange={(e) => handleStatusChange(params.row._id, 'operator', e.target.value)}
//           className="w-full"
//           sx={{
//             '& .MuiSelect-select': {
//               color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500
//             }
//           }}
//         >
//           <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>Active</MenuItem>
//           <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>Blocked</MenuItem>
//         </Select>
//       )
//     },
//   ];

//   const handleStatusChange = async (id, type, status) => {
//     try {
//       const isBlocked = status === 'blocked';
//       const endpoint = type === 'user'
//         ? `${backendUrl}/api/admin/users/${id}/blocked`
//         : `${backendUrl}/api/admin/operators/${id}/status`;
//       const response = await axios.put(
//         endpoint,
//         { isBlocked },
//         { headers: { Authorization: `Bearer ${adminData?.token}` } }
//       );
//       // Update local state
//       if (type === 'user') {
//         setUsers(users.map(user =>
//           user._id === id ? { ...user, isBlocked } : user
//         ));
//       } else {
//         setOperators(operators.map(operator =>
//           operator._id === id ? { ...operator, isBlocked } : operator
//         ));
//       }
//       toast.success('Status updated successfully');
//     } catch (error) {
//       toast.error('Failed to update status');
//     }
//   };

//   const handleVerificationChange = async (id, status) => {
//     try {
//       const isAccountVerified = status === 'verified';
//       const response = await axios.put(
//         `${backendUrl}/api/admin/operators/${id}/status`,
//         { isAccountVerified },
//         { headers: { Authorization: `Bearer ${adminData?.token}` } }
//       );
//       setOperators(operators.map(operator =>
//         operator._id === id ? { ...operator, isAccountVerified } : operator
//       ));
//       toast.success('Verification status updated');
//     } catch (error) {
//       toast.error('Failed to update verification status');
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const endpoint = selectedTable === 'users'
//           ? `${backendUrl}/api/admin/users`
//           : `${backendUrl}/api/admin/operators`;
//         const response = await axios.get(endpoint, {
//           params: {
//             search: searchQuery,
//             status: statusFilter === 'all' ? null : statusFilter
//           },
//           headers: { Authorization: `Bearer ${adminData?.token}` }
//         });
//         selectedTable === 'users'
//           ? setUsers(response.data)
//           : setOperators(response.data);
//       } catch (error) {
//         toast.error('Error fetching data');
//       }
//     };
//     if (activeView === 'users') fetchData();
//   }, [activeView, selectedTable, searchQuery, statusFilter]);

//   const chartData = [
//     { name: 'Mon', bookings: 4000, revenue: 2400 },
//     { name: 'Tue', bookings: 3000, revenue: 1398 },
//     // ... more data
//   ];

//   const bookingsColumns = [
//     { field: 'id', headerName: 'ID', width: 70 },
//     { field: 'passenger', headerName: 'Passenger', width: 150 },
//     { field: 'route', headerName: 'Route', width: 200 },
//     { field: 'status', headerName: 'Status', width: 120 },
//     { field: 'actions', headerName: 'Actions', width: 150 },
//   ];

//   const navigationItems = [
//     { name: 'Dashboard', icon: FaChartBar, view: 'dashboard' },
//     { name: 'User Management', icon: FaUsers, view: 'users' },
//     { name: 'Bookings', icon: FaTicketAlt, view: 'bookings' },
//     { name: 'Routes', icon: FaMap, view: 'routes' },
//     { name: 'Schedules', icon: FaClock, view: 'schedules' },
//     { name: 'Passengers', icon: FaIdCard, view: 'passengers' },
//     { name: 'Finance', icon: FaDollarSign, view: 'finance' },
//     { name: 'Reports', icon: FaThList, view: 'reports' },
//     { name: 'Analytics', icon: FaChartLine, view: 'analytics' },
//     { name: 'Admin Management', icon: FaShieldAlt, view: 'admin' },
//     { name: 'Settings', icon: FaCog, view: 'settings' },
//   ];

//   const renderView = () => {
//     switch (activeView) {
//       case 'users':
//         return (
//           <UserManagementView
//             selectedTable={selectedTable}
//             columns={selectedTable === 'users' ? userColumns : operatorColumns}
//             rows={selectedTable === 'users' ? users : operators}
//             searchQuery={searchQuery}
//             statusFilter={statusFilter}
//             onSearchChange={(e) => setSearchQuery(e.target.value)}
//             onFilterChange={(e) => setStatusFilter(e.target.value)}
//             onTableChange={(e) => setSelectedTable(e.target.value)}
//           />
//         );

//       case 'bookings':
//         return (
//           <div className="p-6 bg-white rounded-lg shadow-sm">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold">Booking Management</h2>
//               <button className="btn-primary">
//                 <FaPlusCircle className="w-5 h-5 mr-2" />
//                 New Booking
//               </button>
//             </div>
//             <DataGrid
//               rows={[]}
//               columns={bookingsColumns}
//               pageSize={5}
//               rowsPerPageOptions={[5]}
//               checkboxSelection
//               className="h-96"
//             />
//           </div>
//         );

//       case 'finance':
//         return (
//           <div className="grid gap-6 md:grid-cols-2">
//             <div className="p-6 bg-white rounded-lg shadow-sm">
//               <h3 className="mb-4 text-lg font-semibold">Revenue Trend</h3>
//               <LineChart width={500} height={300} data={chartData}>
//                 <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
//                 <Tooltip />
//               </LineChart>
//             </div>
//             <div className="p-6 bg-white rounded-lg shadow-sm">
//               <h3 className="mb-4 text-lg font-semibold">Payment Methods</h3>
//               <PieChart width={500} height={300}>
//                 <Pie data={[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} />
//                 <Tooltip />
//               </PieChart>
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-500">Active Buses</h3>
//                   <p className="mt-2 text-3xl font-bold">42</p>
//                 </div>
//                 <IoBus className="w-12 h-12 p-2 text-blue-100 bg-blue-600 rounded-lg" />
//               </div>
//               <div className="mt-4 flex items-center text-sm">
//                 <span className="text-green-600">▲ 3%</span>
//                 <span className="ml-2 text-gray-500">vs last month</span>
//               </div>
//             </div>

//             <div className="p-6 bg-white rounded-lg shadow-sm">
//               <h3 className="text-lg font-medium text-gray-500">Live Updates</h3>
//               <div className="mt-4 space-y-3">
//                 <div className="flex items-center text-sm">
//                   <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
//                   <span className="ml-2">Bus #234 arrived at Station A</span>
//                   <span className="ml-auto text-gray-500">2 min ago</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//     <div className="fixed inset-y-0 w-64 px-4 py-6 bg-white shadow-lg">
//       <div className="flex flex-col items-start pl-2">
//         <span className="text-xl font-bold">Admin Panel</span>
//         <p className="text-sm text-gray-600 mt-1">Welcome, {adminData?.name}</p>
//       </div>

//       <hr className="border-t border-gray-200 -mx-4 my-4 shadow-lg" />
//       <nav className="space-y-1">
//         {navigationItems.map((item) => (
//           <button
//             key={item.name}
//             onClick={() => setActiveView(item.view)}
//             className={`w-full flex items-center px-3 py-2 rounded-lg ${activeView === item.view
//               ? 'bg-blue-50 text-blue-700'
//               : 'text-gray-600 hover:bg-gray-100'
//               }`}
//           >
//             <item.icon className="w-5 h-5 mr-3" />
//             {item.name}
//           </button>
//         ))}
//       </nav>
//     </div>


//       <div className="pl-64">
//         <header className="bg-white shadow-sm">
//           <div className="flex items-center justify-between px-8 py-4">
//             <div className="flex-1 max-w-2xl">
//               <div className="relative">
//                 <FaSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search bookings, routes, or passengers..."
//                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={handleSignup}
//                 className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//               >
//                 <FaUserPlus className="w-5 h-5 mr-2" />
//                 Create Admin
//               </button>

//               <button
//                 onClick={handleLogout}
//                 className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
//               >
//                 Logout
//               </button>

//             </div>
//           </div>
//         </header>

//         <main className="px-8 py-6">
//           {renderView()}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;




















import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAppContext } from '../../../context/AdminAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoBus } from 'react-icons/io5';
import { FaChartBar, FaUsers, FaTicketAlt, FaCog, FaUserPlus, FaChartLine, FaShieldAlt, FaMap, FaClock, FaDollarSign, FaIdCard, FaThList, FaSearch, FaPlusCircle, FaBell } from 'react-icons/fa';
import { LineChart, Line, PieChart, Pie, Tooltip } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { Select, MenuItem } from '@mui/material';
import UserManagementView from '../../../components/adminrenderview/usermanagement/UserManagementView';
import BusManagementView from '../../../components/adminrenderview/busmanagement/BusManagementView';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsAdminLoggedin, adminData, setSuppressUnauthorizedToast } = useContext(AdminAppContext);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTable, setSelectedTable] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [buses, setBuses] = useState([]);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/admin/auth/logout`);
      setIsAdminLoggedin(false);
      setSuppressUnauthorizedToast(true);
      toast.success("Admin logged out successfully!");
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignup = () => navigate('/admin/register');

  const userColumns = [
    {
      field: 'sno', headerName: 'S.No', width: 100,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span className="text-gray-600">{rowIndex}</span>;
      }
    },
    { field: 'name', headerName: 'Name', width: 270, headerClassName: 'font-semibold' },
    { field: 'email', headerName: 'Email', width: 380, headerClassName: 'font-semibold' },
    {
      field: 'isAccountVerified', headerName: 'Verified Status', width: 200,
      renderCell: (params) => (
        <span className={`font-medium ${params.value ? 'text-green-600' : 'text-red-600'}`}>
          {params.value ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    {
      field: 'isBlocked', headerName: 'Blocked Status', width: 200,
      renderCell: (params) => (
        <Select
          value={params.value ? 'blocked' : 'active'}
          onChange={(e) => handleStatusChange(params.row._id, 'user', e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': {
              color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500
            }
          }}
        >
          <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>Active</MenuItem>
          <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>Blocked</MenuItem>
        </Select>
      )
    },
  ];

  const operatorColumns = [
    {
      field: 'sno', headerName: 'S.No', width: 80,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span className="text-gray-600">{rowIndex}</span>;
      }
    },
    { field: 'name', headerName: 'Name', width: 200, headerClassName: 'font-semibold' },
    { field: 'email', headerName: 'Email', width: 320, headerClassName: 'font-semibold' },
    { field: 'panNo', headerName: 'PAN Number', width: 130, headerClassName: 'font-semibold' },
    {
      field: 'panImage', headerName: 'PAN Image', width: 130,
      renderCell: (params) => (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >View Image</a>
      )
    },
    {
      field: 'isAccountVerified', headerName: 'Verified Status', width: 150,
      renderCell: (params) => (
        <Select
          value={params.value ? 'verified' : 'unverified'}
          onChange={(e) => handleVerificationChange(params.row._id, e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': {
              color: params.value ? '#16a34a' : '#dc2626', fontWeight: 500
            }
          }}
        >
          <MenuItem value="verified" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>Verified</MenuItem>
          <MenuItem value="unverified" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>Unverified</MenuItem>
        </Select>
      )
    },
    {
      field: 'isBlocked', headerName: 'Blocked Status', width: 150,
      renderCell: (params) => (
        <Select
          value={params.value ? 'blocked' : 'active'}
          onChange={(e) => handleStatusChange(params.row._id, 'operator', e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': {
              color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500
            }
          }}
        >
          <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>Active</MenuItem>
          <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>Blocked</MenuItem>
        </Select>
      )
    },
  ];

  const handleStatusChange = async (id, type, status) => {
    try {
      const isBlocked = status === 'blocked';
      const endpoint = type === 'user'
        ? `${backendUrl}/api/admin/users/${id}/blocked`
        : `${backendUrl}/api/admin/operators/${id}/status`;
      const response = await axios.put(
        endpoint,
        { isBlocked },
        { headers: { Authorization: `Bearer ${adminData?.token}` } }
      );
      // Update local state
      if (type === 'user') {
        setUsers(users.map(user =>
          user._id === id ? { ...user, isBlocked } : user
        ));
      } else {
        setOperators(operators.map(operator =>
          operator._id === id ? { ...operator, isBlocked } : operator
        ));
      }
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVerificationChange = async (id, status) => {
    try {
      const isAccountVerified = status === 'verified';
      const response = await axios.put(
        `${backendUrl}/api/admin/operators/${id}/status`,
        { isAccountVerified },
        { headers: { Authorization: `Bearer ${adminData?.token}` } }
      );
      setOperators(operators.map(operator =>
        operator._id === id ? { ...operator, isAccountVerified } : operator
      ));
      toast.success('Verification status updated');
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  // Fetch data based on active view
  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = '';
        let params = {
          search: searchQuery,
          status: statusFilter === 'all' ? null : statusFilter
        };

        if (activeView === 'users') {
          // Determine endpoint based on selectedTable
          endpoint = selectedTable === 'users'
            ? `${backendUrl}/api/admin/users`
            : `${backendUrl}/api/admin/operators`;

          const response = await axios.get(endpoint, {
            params,
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });

          // Update state based on selectedTable
          if (selectedTable === 'users') {
            setUsers(response.data);
          } else {
            setOperators(response.data);
          }
        } else if (activeView === 'buses') {
          endpoint = `${backendUrl}/api/admin/buses`;
          const response = await axios.get(endpoint, {
            params: { search: searchQuery },
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });
          setBuses(response.data);
        }
      } catch (error) {
        toast.error('Error fetching data');
      }
    };

    if (['users', 'buses'].includes(activeView)) {
      fetchData();
    }
  }, [activeView, selectedTable, searchQuery, statusFilter]);

  const chartData = [
    { name: 'Mon', bookings: 4000, revenue: 2400 },
    { name: 'Tue', bookings: 3000, revenue: 1398 },
    // ... more data
  ];

  const bookingsColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'passenger', headerName: 'Passenger', width: 150 },
    { field: 'route', headerName: 'Route', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'actions', headerName: 'Actions', width: 150 },
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: FaChartBar, view: 'dashboard' },
    { name: 'User Management', icon: FaUsers, view: 'users' },
    { name: 'Bus Management', icon: IoBus, view: 'buses' },
    { name: 'Bookings', icon: FaTicketAlt, view: 'bookings' },
    { name: 'Routes', icon: FaMap, view: 'routes' },
    { name: 'Schedules', icon: FaClock, view: 'schedules' },
    { name: 'Passengers', icon: FaIdCard, view: 'passengers' },
    { name: 'Finance', icon: FaDollarSign, view: 'finance' },
    { name: 'Reports', icon: FaThList, view: 'reports' },
    { name: 'Analytics', icon: FaChartLine, view: 'analytics' },
    { name: 'Admin Management', icon: FaShieldAlt, view: 'admin' },
    { name: 'Settings', icon: FaCog, view: 'settings' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'users':
        return (
          <UserManagementView
            selectedTable={selectedTable}
            columns={selectedTable === 'users' ? userColumns : operatorColumns}
            rows={selectedTable === 'users' ? users : operators}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onFilterChange={(e) => setStatusFilter(e.target.value)}
            onTableChange={(e) => setSelectedTable(e.target.value)}
          />
        );

      case 'buses':
        return (
          <BusManagementView
            buses={buses}
            searchQuery={searchQuery}
            selectedFilter={statusFilter}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onFilterChange={(e) => setStatusFilter(e.target.value)}
            filterOptions={[
              { value: 'all', label: 'All Buses' },
            ]}
          />
        );

      case 'bookings':
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Booking Management</h2>
              <button className="btn-primary">
                <FaPlusCircle className="w-5 h-5 mr-2" />
                New Booking
              </button>
            </div>
            <DataGrid
              rows={[]}
              columns={bookingsColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              className="h-96"
            />
          </div>
        );

      case 'finance':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Revenue Trend</h3>
              <LineChart width={500} height={300} data={chartData}>
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
                <Tooltip />
              </LineChart>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Payment Methods</h3>
              <PieChart width={500} height={300}>
                <Pie data={[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} />
                <Tooltip />
              </PieChart>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500">Active Buses</h3>
                  <p className="mt-2 text-3xl font-bold">42</p>
                </div>
                <IoBus className="w-12 h-12 p-2 text-blue-100 bg-blue-600 rounded-lg" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600">▲ 3%</span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-500">Live Updates</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="ml-2">Bus #234 arrived at Station A</span>
                  <span className="ml-auto text-gray-500">2 min ago</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 w-64 px-4 py-6 bg-white shadow-lg">
        <div className="flex flex-col items-start pl-2">
          <span className="text-xl font-bold">Admin Panel</span>
          <p className="text-sm text-gray-600 mt-1">Welcome, {adminData?.name}</p>
        </div>

        <hr className="border-t border-gray-200 -mx-4 my-4 shadow-lg" />
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.view)}
              className={`w-full flex items-center px-3 py-2 rounded-lg ${activeView === item.view
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>


      <div className="pl-64">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings, routes, or passengers..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignup}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <FaUserPlus className="w-5 h-5 mr-2" />
                Create Admin
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                Logout
              </button>

            </div>
          </div>
        </header>

        <main className="px-8 py-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;