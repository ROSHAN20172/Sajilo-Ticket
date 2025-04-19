import React, { useState, useContext, useEffect } from 'react';
import { UserAppContext } from '../../context/UserAppContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPencilAlt, FaCalendarAlt, FaMapMarkerAlt, FaHome, FaPhone, FaTicketAlt, FaSignOutAlt, FaTrash, FaExclamationTriangle, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();
    const { userData, backendUrl, getUserData, setIsLoggedin, setUserData } = useContext(UserAppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Change password states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState(1); // 1: Enter current, 2: Enter new
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        dateOfBirth: '',
        permanentAddress: '',
        temporaryAddress: '',
        contactNumber: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                permanentAddress: userData.permanentAddress || '',
                temporaryAddress: userData.temporaryAddress || '',
                contactNumber: userData.contactNumber || ''
            });
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.put(`${backendUrl}/api/user/profile`, formData);

            if (data.success) {
                toast.success('Profile updated successfully');
                await getUserData(); // Refresh user data
                setIsEditing(false);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const verifyCurrentPassword = async () => {
        if (!passwordData.currentPassword) {
            toast.error('Please enter your current password');
            return;
        }

        setPasswordLoading(true);
        try {
            // First just verify the current password without changing anything
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/user/verify-password`, {
                password: passwordData.currentPassword
            });

            if (data.success) {
                setPasswordStep(2); // Move to enter new password step
            } else {
                toast.error(data.message || 'Current password is incorrect');
            }
        } catch (error) {
            // If the verify endpoint doesn't exist or fails, we'll handle it when changing the password
            setPasswordStep(2); // Move forward anyway for this implementation
        } finally {
            setPasswordLoading(false);
        }
    };

    const submitPasswordChange = async () => {
        // Validate new password
        if (!passwordData.newPassword) {
            toast.error('Please enter a new password');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.put(`${backendUrl}/api/user/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (data.success) {
                toast.success('Password changed successfully');
                setShowPasswordModal(false);
                resetPasswordForm();
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const resetPasswordForm = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordStep(1);
        setShowPassword({
            current: false,
            new: false,
            confirm: false
        });
    };

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
            data.success && setIsLoggedin(false);
            data.success && setUserData(false);
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'delete-account') {
            toast.error('Please type "delete-account" correctly to confirm deletion');
            return;
        }

        setDeleteLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.delete(`${backendUrl}/api/user/account`);

            if (data.success) {
                toast.success('Your account has been deleted successfully');
                setIsLoggedin(false);
                setUserData(false);
                navigate('/');
            } else {
                toast.error(data.message || 'Failed to delete account');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to delete account');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    if (!userData) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 text-primary hover:text-primary/80 transition"
                    >
                        <FaArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Profile</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-primary/10 p-6 flex flex-col md:flex-row items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                                {userData.name ? userData.name[0].toUpperCase() : ''}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{userData.name}</h2>
                                <p className="text-gray-600">{userData.email}</p>
                                {userData.isAccountVerified ? (
                                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        Verified Account
                                    </span>
                                ) : (
                                    <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                        Unverified Account
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition"
                            >
                                <FaKey />
                                Change Password
                            </button>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition"
                            >
                                <FaPencilAlt />
                                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition"
                            >
                                <FaTrash />
                                Delete Account
                            </button>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="dateOfBirth">
                                            Date of Birth
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                <FaCalendarAlt />
                                            </div>
                                            <input
                                                type="date"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="contactNumber">
                                            Contact Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                <FaPhone />
                                            </div>
                                            <input
                                                type="text"
                                                id="contactNumber"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter your contact number"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="permanentAddress">
                                            Permanent Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <input
                                                type="text"
                                                id="permanentAddress"
                                                name="permanentAddress"
                                                value={formData.permanentAddress}
                                                onChange={handleInputChange}
                                                placeholder="Enter your permanent address"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="temporaryAddress">
                                            Temporary Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                <FaHome />
                                            </div>
                                            <input
                                                type="text"
                                                id="temporaryAddress"
                                                name="temporaryAddress"
                                                value={formData.temporaryAddress}
                                                onChange={handleInputChange}
                                                placeholder="Enter your temporary address"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FaCalendarAlt className="mr-2" />
                                            <span className="font-medium">Date of Birth</span>
                                        </div>
                                        <p className="text-gray-800">
                                            {userData.dateOfBirth
                                                ? new Date(userData.dateOfBirth).toLocaleDateString()
                                                : 'Not provided'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FaPhone className="mr-2" />
                                            <span className="font-medium">Contact Number</span>
                                        </div>
                                        <p className="text-gray-800">
                                            {userData.contactNumber || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-1 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FaMapMarkerAlt className="mr-2" />
                                            <span className="font-medium">Permanent Address</span>
                                        </div>
                                        <p className="text-gray-800">
                                            {userData.permanentAddress || 'Not provided'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FaHome className="mr-2" />
                                            <span className="font-medium">Temporary Address</span>
                                        </div>
                                        <p className="text-gray-800">
                                            {userData.temporaryAddress || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Actions */}
                    <div className="border-t border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                to="/bookings"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition"
                            >
                                <FaTicketAlt />
                                My Bookings
                            </Link>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md transition"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Change Password</h3>

                        {passwordStep === 1 ? (
                            <>
                                <p className="text-gray-600 mb-4">
                                    Please enter your current password to continue.
                                </p>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            resetPasswordForm();
                                        }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={verifyCurrentPassword}
                                        disabled={passwordLoading}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition disabled:opacity-50"
                                    >
                                        {passwordLoading ? 'Verifying...' : 'Continue'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-4">
                                    Enter and confirm your new password.
                                </p>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setPasswordStep(1);
                                        }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={submitPasswordChange}
                                        disabled={passwordLoading}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition disabled:opacity-50"
                                    >
                                        {passwordLoading ? 'Updating...' : 'Change Password'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                        <div className="flex items-center justify-center text-red-500 mb-4">
                            <FaExclamationTriangle size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Delete Account</h3>
                        <p className="text-gray-600 text-center mb-6">
                            This action is <span className="font-bold">permanent</span> and will delete all your account data, bookings, and payment information.
                        </p>

                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">
                                To confirm, type "delete-account" below:
                            </label>
                            <input
                                type="text"
                                placeholder="delete-account"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Please type exactly "delete-account" (case sensitive) to enable the delete button.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== 'delete-account' || deleteLoading}
                                className={`px-4 py-2 rounded-md transition ${deleteConfirmation === 'delete-account'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile; 