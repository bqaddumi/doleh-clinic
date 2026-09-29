import {
  createBanner as createBannerRecord,
  deleteBanner as deleteBannerRecord,
  getActiveBanners,
  listBanners,
  updateBanner as updateBannerRecord
} from '../services/dataService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getBanners = asyncHandler(async (req, res) => {
  const result = await listBanners();
  res.json(result);
});

export const getPublicBanners = asyncHandler(async (req, res) => {
  const result = await getActiveBanners();
  res.json(result);
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await createBannerRecord(req.validated.body);
  res.status(201).json(banner);
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await updateBannerRecord(req.validated.params.id, req.validated.body);
  if (!banner) {
    throw new ApiError(404, 'Banner not found');
  }

  res.json(banner);
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const deleted = await deleteBannerRecord(req.validated.params.id);
  if (!deleted) {
    throw new ApiError(404, 'Banner not found');
  }
  res.json({ message: 'Banner deleted successfully' });
});
