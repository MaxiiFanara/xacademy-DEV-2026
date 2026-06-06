import jwt from 'jsonwebtoken';
import {env} from '../config/env.js'

const JWT_SECRET     =  env.JWT.SECRET;
const JWT_EXPIRES_IN =  env.JWT.EXPIRES_IN || '24h';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { email: user.Email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { email: user.Email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};