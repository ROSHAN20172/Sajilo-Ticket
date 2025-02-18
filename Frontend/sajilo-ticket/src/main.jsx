import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppContextProvider } from './context/AppContext.jsx';
import { AdminAppContextProvider } from './context/AdminAppContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppContextProvider>
      <AdminAppContextProvider>
        <App />
        <ToastContainer />
      </AdminAppContextProvider>
    </AppContextProvider>
  </StrictMode>
);
