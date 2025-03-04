import express from 'express';
import operatorAuth from '../../middleware/operator/operatorAuth.js';
import { getOperatorData } from '../../controllers/operator/operatorController.js';

const router = express.Router();

router.get('/data', operatorAuth, getOperatorData);

export default router;
