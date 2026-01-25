/**
 * Custom Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Error Handler Wrapper
 * Eliminates try-catch blocks in controllers
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Global Error Handling Middleware
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'Duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Deep copy error for transformation
  // Note: Just copying properties isn't enough for Error objects often, 
  // but we primarily need the name and codes
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  if (process.env.NODE_ENV === 'production' && !req.query.debug) { // Allow debug bypass if needed
    // Production: send less info
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    
    console.error('ERROR 💥', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong!'
    });
  } else {
    // Development: send full details
    console.error('ERROR 💥', err);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || err.message,
      stack: err.stack,
      validation: error.errors
    });
  }
};
