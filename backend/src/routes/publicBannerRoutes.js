import { Router } from 'express';
import { getPublicBanners } from '../controllers/bannerController.js';

const router = Router();

router.get('/', getPublicBanners);

export default router;
