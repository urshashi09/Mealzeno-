import express from 'express';
import { getCurrentUser, login, register , requestPasswordReset} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);

router.get('/me', authMiddleware, getCurrentUser)

export default router; 