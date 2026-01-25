import { AppError } from '../utils/errorHandler.js';

// UUID v4 validation regex
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const identifyUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return next(new AppError('User ID header (x-user-id) is required', 400));
  }

  // Strict UUID v4 validation for security
  if (typeof userId !== 'string' || !UUID_V4_REGEX.test(userId)) {
    return next(new AppError('Invalid User ID format - must be UUID v4', 400));
  }

  req.userId = userId;
  next();
};
