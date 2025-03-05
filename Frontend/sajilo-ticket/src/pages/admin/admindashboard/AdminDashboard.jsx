import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAppContext } from '../../../context/AdminAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoBus } from 'react-icons/io5';
import {
  FaChartBar,
  FaUsers,
  FaTicketAlt,
  FaCog,
  FaUserPlus,
  FaChartLine,
  FaShieldAlt,
  FaMap,
  FaClock,
  FaDollarSign,
  FaIdCard,
  FaThList,
  FaSearch,
  FaPlusCircle
} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Tooltip } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { Select, MenuItem } from '@mui/material';
import UserManagementView from '../../../components/adminrenderview/usermanagement/UserManagementView';
import BusManagementView from '../../../components/adminrenderview/busmanagement/BusManagementView';
import RouteManagementView from '../../../components/adminrenderview/busroutesmanagement/BusRoutesManagementView';
import ScheduleManagementView from '../../../components/adminrenderview/busschedulemanagement/BusScheduleManagementView';

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
  const [routes, setRoutes] = useState([]); // New state for routes

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
      field: 'sno',
      headerName: 'S.No',
      width: 100,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span className="text-gray-600">{rowIndex}</span>;
      }
    },
    { field: 'name', headerName: 'Name', width: 270, headerClassName: 'font-semibold' },
    { field: 'email', headerName: 'Email', width: 380, headerClassName: 'font-semibold' },
    {
      field: 'isAccountVerified',
      headerName: 'Verified Status',
      width: 200,
      renderCell: (params) => (
        <span className={`font-medium ${params.value ? 'text-green-600' : 'text-red-600'}`}>
          {params.value ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    {
      field: 'isBlocked',
      headerName: 'Blocked Status',
      width: 200,
      renderCell: (params) => (
        <Select
          value={params.value ? 'blocked' : 'active'}
          onChange={(e) => handleStatusChange(params.row._id, 'user', e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': { color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500 }
          }}
        >
          <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>
            Active
          </MenuItem>
          <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
            Blocked
          </MenuItem>
        </Select>
      )
    }
  ];

  const operatorColumns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 80,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span className="text-gray-600">{rowIndex}</span>;
      }
    },
    { field: 'name', headerName: 'Name', width: 200, headerClassName: 'font-semibold' },
    { field: 'email', headerName: 'Email', width: 320, headerClassName: 'font-semibold' },
    { field: 'panNo', headerName: 'PAN Number', width: 130, headerClassName: 'font-semibold' },
    {
      field: 'panImage',
      headerName: 'PAN Image',
      width: 130,
      renderCell: (params) => (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          View Image
        </a>
      )
    },
    {
      field: 'isAccountVerified',
      headerName: 'Verified Status',
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.value ? 'verified' : 'unverified'}
          onChange={(e) => handleVerificationChange(params.row._id, e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': { color: params.value ? '#16a34a' : '#dc2626', fontWeight: 500 }
          }}
        >
          <MenuItem value="verified" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>
            Verified
          </MenuItem>
          <MenuItem value="unverified" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
            Unverified
          </MenuItem>
        </Select>
      )
    },
    {
      field: 'isBlocked',
      headerName: 'Blocked Status',
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.value ? 'blocked' : 'active'}
          onChange={(e) => handleStatusChange(params.row._id, 'operator', e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': { color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500 }
          }}
        >
          <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>
            Active
          </MenuItem>
          <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
            Blocked
          </MenuItem>
        </Select>
      )
    }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = '';
        let params = {
          search: searchQuery,
          status: statusFilter === 'all' ? null : statusFilter
        };

        if (activeView === 'users') {
          endpoint = selectedTable === 'users'
            ? `${backendUrl}/api/admin/users`
            : `${backendUrl}/api/admin/operators`;

          const response = await axios.get(endpoint, {
            params,
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });

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
        } else if (activeView === 'routes') {
          endpoint = `${backendUrl}/api/admin/routes`;
          const response = await axios.get(endpoint, {
            params: { search: searchQuery },
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });
          setRoutes(response.data);
        }
      } catch (error) {
        toast.error('Error fetching data');
      }
    };

    if (['users', 'buses', 'routes'].includes(activeView)) {
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
    { field: 'actions', headerName: 'Actions', width: 150 }
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
    { name: 'Settings', icon: FaCog, view: 'settings' }
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
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Unverified' }
            ]}
          />
        );

      case 'routes':
        return (
          <RouteManagementView
            routes={routes}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
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
        case 'schedules':
        return <ScheduleManagementView />;

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
                <h1 className="text-4xl text-primary font-bold mt-3 mb-2">SAJILO TICKET</h1>
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
                <FiLogOut className="ml-2" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-8 py-6">{renderView()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;