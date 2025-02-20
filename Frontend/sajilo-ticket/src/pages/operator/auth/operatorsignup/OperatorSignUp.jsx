import React, { useContext, useState, useEffect } from 'react';
import { FaUser, FaLock } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const OperatorSignUp = () => {
    const navigate = useNavigate();
    const { backendUrl, isOperatorLoggedin, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isOperatorLoggedin) {
            toast.info("Already logged in.");
            navigate('/operator/dashboard');
        }
    }, [isOperatorLoggedin, navigate]);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;

    const validateForm = () => {
        if (email !== email.toLowerCase()) {
            toast.error("Email must be in lowercase.");
            return false;
        }
        if (!name || !email || !password) {
            toast.error("Please fill in all fields.");
            return false;
        }
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return false;
        }
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 6 characters long and contain at least one special character.");
            return false;
        }
        return true;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const { data } = await axios.post(`${backendUrl}/api/operator/auth/signup`, {
                name,
                email,
                password,
            });

            if (data.success) {
                toast.success("Operator registered successfully!");
                // Suppress unauthorized error toasts when redirecting immediately after signup
                setSuppressUnauthorizedToast(true);
                navigate('/operator/dashboard');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>Register Operator</h2>
                <p className='text-center text-sm mb-6'>Create an Operator Account</p>
                <form onSubmit={onSubmitHandler} noValidate>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaUser />
                        <input
                            onChange={e => setName(e.target.value)}
                            value={name}
                            className='bg-transparent outline-none w-full text-white'
                            type="text"
                            placeholder='Full Name'
                            required
                        />
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <MdEmail />
                        <input
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            className='bg-transparent outline-none w-full text-white'
                            type="email"
                            placeholder='Operator Email'
                            required
                        />
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaLock />
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            className='bg-transparent outline-none w-full text-white'
                            type="password"
                            placeholder='Password'
                            required
                        />
                    </div>
                    <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                        Sign Up
                    </button>
                </form>
                <p className='text-gray-400 text-center text-xs mt-4'>
                    Already have an Account? <Link to="/operator/login" className='text-blue-400 underline'>Login here</Link>
                </p>
                <div className="mt-6 text-center">
                    <Link to="/" className="text-blue-400 underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default OperatorSignUp;
