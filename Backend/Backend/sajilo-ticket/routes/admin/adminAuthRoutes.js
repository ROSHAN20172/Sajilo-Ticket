import express from 'express';
import { isAdminAuthenticated, manualAdminRegister, adminLogin, adminLogout } from '../../controllers/admin/authController.js';
import adminAuth from '../../middleware/admin/adminAuth.js';

const router = express.Router();

router.post('/manual-register', adminAuth, manualAdminRegister);
router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/is-auth', adminAuth, isAdminAuthenticated);

export default router;