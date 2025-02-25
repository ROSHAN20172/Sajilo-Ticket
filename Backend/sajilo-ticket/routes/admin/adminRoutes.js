import express from 'express';
import adminAuth from '../../middleware/admin/adminAuth.js';
import { getAdminData, getUsers, getOperators, updateUserBlocked, updateOperatorStatus } from '../../controllers/admin/adminController.js';

const router = express.Router();

router.get('/data', adminAuth, getAdminData);
router.get('/users', adminAuth, getUsers);
router.get('/operators', adminAuth, getOperators);
router.put('/users/:id/blocked', adminAuth, updateUserBlocked);
router.put('/operators/:id/status', adminAuth, updateOperatorStatus);

export default router;
