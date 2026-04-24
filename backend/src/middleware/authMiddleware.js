import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserById, sanitizeUser } from '../services/dataService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await findUserById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Not authorized'));
    }

    return next();
  };

export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await findUserById(decoded.id);

    if (user) {
      req.user = sanitizeUser(user);
    }
  } catch {
    // Ignore invalid optional auth and continue as guest.
  }

  return next();
});
