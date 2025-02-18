import express from 'express';
import adminAuth from '../../middleware/admin/adminAuth.js';
import { getAdminData } from '../../controllers/admin/adminController.js';

const router = express.Router();

router.get('/data', adminAuth, getAdminData);

export default router;
