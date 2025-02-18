import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAppContext } from '../../../context/AdminAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsAdminLoggedin, adminData, setSuppressUnauthorizedToast } = useContext(AdminAppContext);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/admin/auth/logout`);
      setIsAdminLoggedin(false);
      setSuppressUnauthorizedToast(true); // Suppress the unauthorized toast here.
      toast.success("Admin logged out successfully!");
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignup = () => {
    navigate('/admin/register');
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {adminData && <p>Welcome, {adminData.name}!</p>}
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
};

export default AdminDashboard;
