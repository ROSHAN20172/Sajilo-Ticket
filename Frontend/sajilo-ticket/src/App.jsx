// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/navbar/Navbar";
// import Footer from "./components/footer/Footer";

// // Public Pages
// import Home from "./pages/home/Home";
// import About from "./pages/about/About";
// import Ticket from "./pages/ticket/Ticket";
// import Detail from "./pages/ticket/detail/Detail";
// import Checkout from "./pages/ticket/detail/checkout/Checkout";
// import Invoice from "./pages/ticket/invoice/Invoice";

// // User Pages
// import LogIn from "./pages/auth/login/LogIn";
// import SignUp from "./pages/auth/signup/SignUp";
// import EmailVerify from "./pages/auth/emailverification/EmailVerify";
// import ResetPassword from "./pages/auth/resetpassword/ResetPassword";

// // Admin Pages
// import AdminLogin from './pages/admin/auth/adminlogin/AdminLogin';
// import AdminRegister from './pages/admin/auth/adminsignup/AdminSignUp';
// import AdminDashboard from './pages/admin/admindashboard/AdminDashboard';

// import AdminProtectedRoute from "./components/protectedroutes/adminprotectedroute/AdminProtectedRoute";

// // Operator Pages
// import OperatorLogin from './pages/operator/auth/operatorlogin/OperatorLogin';
// import OperatorSignUp from './pages/operator/auth/operatorsignup/OperatorSignUp';
// import OperatorDashboard from './pages/operator/operatordashboard/OperatorDashboard';

// import OperatorProtectedRoute from "./components/protectedroutes/operatorProtectedRoute/OperatorProtectedRoute";
// import OperatorResetPassword from "./pages/operator/auth/operatorresetpassword/OperatorResetPassword";
// import OperatorAddBus from "./pages/operator/Bus/addbus/AddBus";

// function App() {
//   return (
//     <Router>
//       <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
//         {/* Navbar for public routes */}
//         {window.location.pathname.startsWith("/admin") === false && 
//         window.location.pathname.startsWith("/operator") === false && <Navbar />}

//         {/* Routing */}
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/bus-tickets" element={<Ticket />} />
//           <Route path="/bus-tickets/detail" element={<Detail />} />
//           <Route path="/bus-tickets/checkout" element={<Checkout />} />
//           <Route path="/bus-tickets/payment" element={<Invoice />} />

//           {/* User Auth Routes */}
//           <Route path="/login" element={<LogIn />} />
//           <Route path="/signup" element={<SignUp />} />
//           <Route path="/email-verify" element={<EmailVerify />} />
//           <Route path="/reset-password" element={<ResetPassword />} />

//           {/* Admin Routes */}
//           <Route path="/admin" element={<AdminLogin />} />
//           <Route path="/admin/login" element={<AdminLogin />} />
//           <Route path="/operator-reset-password" element={<OperatorResetPassword />} />

//           {/* Protected Admin Routes */}
//           <Route element={<AdminProtectedRoute />}>
//             <Route path="/admin/dashboard" element={<AdminDashboard />} />
//             <Route path="/admin/register" element={<AdminRegister />} />
//           </Route>

//           {/* Operator Routes */}
//           <Route path="/operator" element={<OperatorLogin />} />
//           <Route path="/operator/login" element={<OperatorLogin />} />
//           <Route path="/operator/signup" element={<OperatorSignUp />} />

//           {/* Protected Operator Routes */}
//           <Route element={<OperatorProtectedRoute />}>
//             <Route path="/operator/dashboard" element={<OperatorDashboard />} />
//             <Route path="/operator/add-bus" element={<OperatorAddBus />} />
//           </Route>
//         </Routes>

//         {/* Footer for public routes */}
//         {window.location.pathname.startsWith("/admin") === false &&
//         window.location.pathname.startsWith("/operator") === false && <Footer />}
//       </main>
//     </Router>
//   );
// }

// export default App;











import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

// Public Pages
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Ticket from "./pages/ticket/Ticket";
import Detail from "./pages/ticket/detail/Detail";
import Checkout from "./pages/ticket/detail/checkout/Checkout";
import Invoice from "./pages/ticket/invoice/Invoice";

// User Pages
import LogIn from "./pages/auth/login/LogIn";
import SignUp from "./pages/auth/signup/SignUp";
import EmailVerify from "./pages/auth/emailverification/EmailVerify";
import ResetPassword from "./pages/auth/resetpassword/ResetPassword";

// Admin Pages
import AdminLogin from './pages/admin/auth/adminlogin/AdminLogin';
import AdminRegister from './pages/admin/auth/adminsignup/AdminSignUp';
import AdminDashboard from './pages/admin/admindashboard/AdminDashboard';
import AdminProtectedRoute from "./components/protectedroutes/adminprotectedroute/AdminProtectedRoute";

// Operator Pages
import OperatorLogin from './pages/operator/auth/operatorlogin/OperatorLogin';
import OperatorSignUp from './pages/operator/auth/operatorsignup/OperatorSignUp';
import OperatorDashboard from './pages/operator/operatordashboard/OperatorDashboard';
import OperatorProtectedRoute from "./components/protectedroutes/operatorProtectedRoute/OperatorProtectedRoute";
import OperatorResetPassword from "./pages/operator/auth/operatorresetpassword/OperatorResetPassword";
import OperatorAddBus from "./pages/operator/Bus/addbus/AddBus";
import OperatorManageBus from "./pages/operator/Bus/managebus/ManageBus";
import OperatorManageBusRoutes from "./pages/operator/Bus/manageroutes/ManageRoutes";

const MainContent = () => {
  const location = useLocation();
  // Check if the current pathname starts with "/admin" or "/operator"
  const hideNavAndFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/operator");

  return (
    <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
      {/* Render Navbar only if not on admin/operator routes */}
      {!hideNavAndFooter && <Navbar />}

      {/* Routing */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/bus-tickets" element={<Ticket />} />
        <Route path="/bus-tickets/detail" element={<Detail />} />
        <Route path="/bus-tickets/checkout" element={<Checkout />} />
        <Route path="/bus-tickets/payment" element={<Invoice />} />

        {/* User Auth Routes */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/operator-reset-password" element={<OperatorResetPassword />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/register" element={<AdminRegister />} />
        </Route>

        {/* Operator Routes */}
        <Route path="/operator" element={<OperatorLogin />} />
        <Route path="/operator/login" element={<OperatorLogin />} />
        <Route path="/operator/signup" element={<OperatorSignUp />} />

        {/* Protected Operator Routes */}
        <Route element={<OperatorProtectedRoute />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/add-bus" element={<OperatorAddBus />} />
          <Route path="/operator/buses" element={<OperatorManageBus />} />
          <Route path="/operator/bus-routes" element={<OperatorManageBusRoutes />} />
        </Route>
      </Routes>

      {/* Render Footer only if not on admin/operator routes */}
      {!hideNavAndFooter && <Footer />}
    </main>
  );
};

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
