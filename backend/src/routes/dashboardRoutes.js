import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', authorize('admin'), getDashboardStats);

export default router;
