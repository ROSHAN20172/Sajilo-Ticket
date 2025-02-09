import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/navbar/Navbar"
import Home from "./pages/home/Home"
import About from "./pages/about/About"
import Footer from "./components/footer/Footer"

import Login from "./pages/auth/Login"
import EmailVerify from "./pages/auth/EmailVerify"
import ResetPassword from "./pages/auth/ResetPassword"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Ticket from "./pages/ticket/Ticket"

function App() {
  return (
    <>
      <Router>
        <ToastContainer />
        <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
          {/* Navbar */}
          <Navbar />

          {/* Routing */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/bus-tickets" element={<Ticket />} />

            {/* Backend */}
            <Route path="/login" element={<Login />} />
            <Route path="/email-verify" element={<EmailVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />


          </Routes>

          {/* Footer */}


          {/* Backend try */}
          <Footer />


        </main>
      </Router>
    </>
  )
}

export default App
