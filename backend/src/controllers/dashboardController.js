import { getDashboardStats as getDashboardStatsData } from '../services/fileDatabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatsData();
  res.json(stats);
});
