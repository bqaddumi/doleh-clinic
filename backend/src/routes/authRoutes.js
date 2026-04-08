import { Router } from 'express';
import { getCurrentUser, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getCurrentUser);

export default router;
