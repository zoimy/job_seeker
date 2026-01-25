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
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    // Production: send less info
    if (err.isOperational) {
      // Trusted error: send message to client
      return res.status(err.statusCode).json({
        success: false,
        error: err.message
      });
    }
    
    // Programming or other unknown error: don't leak details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong!'
    });
  } else {
    // Development: send full details
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      errorObj: err
    });
  }
};
