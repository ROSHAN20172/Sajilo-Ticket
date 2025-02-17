import express from 'express';
import { manualAdminRegister, adminLogin, adminLogout } from '../controllers/adminController.js';
import { protectAdminRoute } from '../middleware/protectAdminRoute.js';

const adminRouter = express.Router();

// Manual Admin Registration Route
adminRouter.post('/manual-register', protectAdminRoute, manualAdminRegister);

// Admin Login Route
adminRouter.post('/login', adminLogin);

// Admin Logout Route
adminRouter.post('/logout', adminLogout);

export default adminRouter;
