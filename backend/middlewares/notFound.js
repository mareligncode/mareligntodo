import AppError from '../utils/appError.js';

export const notFound = (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server.`, 404));
};

export default notFound;

