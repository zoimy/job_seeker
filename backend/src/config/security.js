import rateLimit from 'express-rate-limit';

/**
 * Security Configuration
 */

// Rate Limiting
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

export const scrapeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 scrape requests per hour
  message: {
    success: false,
    error: 'Too many scrape requests, please try again later'
  }
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit login attempts
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  }
});

// CORS Options
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Validation Constants
export const VALIDATION = {
  // Strings
  MAX_STRING_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_URL_LENGTH: 2048,
  
  // Numbers
  MAX_SALARY: 10000000,
  MIN_SALARY: 0,
  
  // Arrays
  MAX_SKILLS: 50,
  MAX_ITEMS: 20
};
