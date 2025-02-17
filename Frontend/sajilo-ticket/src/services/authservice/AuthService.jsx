// src/services/authservice/AuthService.jsx
const AuthService = {
    getAuthToken: () => {
      return localStorage.getItem('adminToken');
    },
    
    isAdminLoggedIn: () => {
      return !!localStorage.getItem('adminToken');
    },
  };
  
  export default AuthService;  // Exporting the AuthService object as default
  // src/services/authservice/AuthService.js

