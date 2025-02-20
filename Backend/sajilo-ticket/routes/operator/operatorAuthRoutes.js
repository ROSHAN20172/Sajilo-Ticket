import express from 'express';
import { isOperatorAuthenticated, operatorRegister, operatorLogin, operatorLogout } from '../../controllers/operator/authController.js';
import operatorAuth from '../../middleware/operator/operatorAuth.js';

const router = express.Router();

router.post('/signup', operatorRegister);
router.post('/login', operatorLogin);
router.post('/logout', operatorLogout);
router.get('/is-auth', operatorAuth, isOperatorAuthenticated);

export default router;
