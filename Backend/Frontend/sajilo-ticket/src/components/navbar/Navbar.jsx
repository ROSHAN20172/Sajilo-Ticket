import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { FaX, FaArrowRight } from "react-icons/fa6";
import { AppContent } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

    const [scrollPosition, setScrollPosition] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [open, setOpen] = useState(false);

    const navigate = useNavigate()
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.post(backendUrl + '/api/auth/logout')
            data.success && setIsLoggedin(false)
            data.success && setUserData(false)
            navigate('/')
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Navbar items
    const navItems = [
        { label: "Home", link: "/" },
        { label: "Tickets", link: "/bus-tickets" },
        { label: "About", link: "/about" },
        { label: "Live Tracking", link: "/live-tracking" },
        { label: "Operator", link: "/operator"}
    ]

    //Handle click open
    const handleOpen = () => {
        setOpen(!open)
    }

    //Handle click open
    const handleClose = () => {
        setOpen(false);
    }

    //To make the navbar sticky and the hide when scrolling up and showing when scrolling down
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollState = window.scrollY;

            //Determine visibility of the navbar based on scroll position
            if (currentScrollState > scrollPosition && currentScrollState > 50) {
                setIsVisible(false); //Hide the navbar when scrolling up
            }
            else {
                setIsVisible(true); //Show the navber when scrolling up and at top
            }

            setScrollPosition(currentScrollState);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollPosition]);

    return (
        <nav className={`w-full h-[8ch] fixed top-0 left-0 lg:px-16 md:px-7 sm:px-7 px-4 backdrop-blur-lg transition-transform duration-300 z-50 
        ${isVisible ? "translate-y-0" : "-translate-y-full"} 
        ${scrollPosition > 50 ? "bg-neutral-300" : "bg-neutral-100/10"}`}>
            <div className="w-fill h-full flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className='text-4xl text-primary font-bold'>
                    Sajilo Ticket
                </Link>

                {/* Hamburger menu */}
                <div className="w-fit md:hidden flex items-center justify-center cursor-pointer flex-col gap-1 text-neutral-700" onClick={handleOpen}>
                    {open
                        ?
                        <FaX className='w-5 h-5' />
                        :
                        <FaBars className='w-5 h-5' />
                    }
                </div>

                {/* Nav links and button */}
                <div className={`${open
                    ?
                    "flex absolute top-20 left-0 w-full h-auto md:relative"
                    :
                    "hidden"} flex-1 md:flex flex-col md:flex-row md:gap-14 gap-8 md:items-center items-start md:p-0 sm:p-4 p-4 justify-end md:bg-transparent bg-neutral-50 border md:border-transparent border-neutral-200 md:shadow-none sm:shadow-md shadow-md rounded-xl`}>

                    {/* Nav links */}
                    <ul className="list-none flex md:items-center items-start flex-wrap md:flex-row flex-col md:gap-8 gap-4 text-lg text-neutral-500 font-normal">
                        {navItems.map((item, ind) => (
                            <li key={ind}>
                                <Link to={item.link} className='hover:text-primary ease-in-out duration-300'>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {userData ?
                        <div className='w-8 h-8 flex justify-center items-center rounded-full bg-primary text-white relative group'>
                            {userData.name[0].toUpperCase()}
                            <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 w-32'>
                                <ul className='list-none m-0 p-2 bg-gray-100 text-sm shadow-lg rounded'>
                                    <li onClick={logout} className='py-2 px-4 hover:bg-gray-200 cursor-pointer whitespace-nowrap'>Log Out</li>
                                </ul>
                            </div>
                        </div>

                        // Button
                        : <div className="flex items-center justify-center">
                            <button onClick={() => navigate('/login')}
                                className='flex items-center gap-2 md:w-fit w-full md:px-4 px-6 md:py-1 py-2.5 hover:bg-transparent bg-primary border border-primary hover:border-primary md:rounded-full rounded-xl text-base font-normal text-neutral-50 hover:text-primary ease-in-out duration-300'>
                                Log In
                                <FaArrowRight />
                            </button>
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar
