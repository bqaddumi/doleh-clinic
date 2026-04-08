import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserByEmail, findUserById, sanitizeUser } from '../services/dataService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const buildToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = buildToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ user: sanitizeUser(user) });
});
