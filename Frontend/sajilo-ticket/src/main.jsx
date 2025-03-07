import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UserAppContextProvider } from './context/UserAppContext.jsx';
import { AdminAppContextProvider } from './context/AdminAppContext.jsx';
import { OperatorAppContextProvider } from './context/OperatorAppContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserAppContextProvider>
      <AdminAppContextProvider>
        <OperatorAppContextProvider>
          <App />
          <ToastContainer />
        </OperatorAppContextProvider>
      </AdminAppContextProvider>
    </UserAppContextProvider>
  </StrictMode>
);
