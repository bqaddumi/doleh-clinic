import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserById, sanitizeUser } from '../services/fileDatabase.js';
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
