import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Ticket from "./pages/ticket/Ticket";
import Detail from "./pages/ticket/detail/Detail";
import Checkout from "./pages/ticket/detail/checkout/Checkout";
import Invoice from "./pages/ticket/invoice/Invoice";

import LogIn from "./pages/auth/login/LogIn";
import SignUp from "./pages/auth/signup/SignUp";
import EmailVerify from "./pages/auth/emailverification/EmailVerify";
import ResetPassword from "./pages/auth/resetpassword/ResetPassword";

import AdminLogin from './pages/admin/auth/adminlogin/AdminLogin';
import AdminRegister from './pages/admin/auth/adminregister/AdminRegister';
import AdminDashboard from './pages/admin/admindashboard/AdminDashboard';

import AdminLayout from './layout/adminlayout/AdminLayout';

import AuthService from './services/authservice/AuthService';
import { Navigate } from 'react-router-dom';

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const isAdminLoggedIn = AuthService.isAdminLoggedIn();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

const ProtectedAdminLogin = ({ children }) => {
  const isAdminLoggedIn = AuthService.isAdminLoggedIn();

  if (isAdminLoggedIn) {
    return <Navigate to="/admin-dashboard" />;
  }

  return children;
};

function App() {
  return (
    <>
      <Router>
        <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
          {/* Navbar for public routes */}
          {window.location.pathname.startsWith("/admin") === false && <Navbar />}

          {/* Routing */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/bus-tickets" element={<Ticket />} />
            <Route path="/bus-tickets/detail" element={<Detail />} />
            <Route path="/bus-tickets/checkout" element={<Checkout />} />
            <Route path="/bus-tickets/payment" element={<Invoice />} />

            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/email-verify" element={<EmailVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<ProtectedAdminLogin><AdminLogin /></ProtectedAdminLogin>} />
            <Route path="/admin-register" element={<AdminRegister />} />
            
            {/* Admin Dashboard inside Admin Layout */}
            <Route path="/admin-dashboard" element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedAdminRoute>
            } />
          </Routes>

          {/* Footer for public routes */}
          {window.location.pathname.startsWith("/admin") === false && <Footer />}
        </main>
      </Router>
    </>
  );
}

export default App;
