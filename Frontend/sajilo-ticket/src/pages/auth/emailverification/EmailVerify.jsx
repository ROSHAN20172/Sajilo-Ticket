import React, { useEffect } from 'react';
import { useContext } from 'react';
import { AppContent } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const { backendUrl, isLoggedin, getUserData, setIsLoggedin, setUserData } = useContext(AppContent);
    const navigate = useNavigate();
    const inputRefs = React.useRef([]);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    }

    const { state } = useLocation();
    const email = state?.email || '';

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const otpArray = inputRefs.current.map(e => e.value);
            const otp = otpArray.join('');

            const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { email, otp });

            if (data.success) {
                toast.success("Email Verified Successfully!");
                setIsLoggedin(true);
                getUserData(data.user);
                navigate('/'); 
            } else {
                toast.error(data.message || "Verification failed. Please try again.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        if (isLoggedin && getUserData?.isAccountVerified) {
            navigate('/');
        }
    }, [isLoggedin, getUserData, navigate]);

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
            <form onSubmit={onSubmitHandler} noValidate className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm '>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify Otp</h1>
                <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit Code Sent to your Email</p>
                <div className='flex justify-between mb-8' onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input type="text" maxLength='1' key={index} required
                            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                            ref={e => inputRefs.current[index] = e}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)} />
                    ))}
                </div>
                <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                    Verify Email
                </button>

                {/* Back to Home link */}
                <div className="mt-6 text-center">
                    <Link to="/" className="text-blue-400 underline">
                        Back to Home
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EmailVerify;
