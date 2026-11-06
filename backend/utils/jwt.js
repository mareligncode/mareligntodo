import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'marelign_todo_default_secret_change_in_prod';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
    ...options,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

export default {
  signToken,
  verifyToken,
};

