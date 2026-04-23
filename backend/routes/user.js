import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile, updatePreferences, changePassword, deleteAccount } from '../controllers/userController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

export default router;