import { Router } from 'express';
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner
} from '../controllers/bannerController.js';
import { validate } from '../middleware/validate.js';
import { bannerIdSchema, createBannerSchema, updateBannerSchema } from '../validators/bannerValidators.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authorize('admin'));

router.get('/', getBanners);
router.post('/', validate(createBannerSchema), createBanner);
router.put('/:id', validate(updateBannerSchema), updateBanner);
router.delete('/:id', validate(bannerIdSchema), deleteBanner);

export default router;
