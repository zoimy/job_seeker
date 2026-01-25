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

export const profileCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit profile creation to 5 per hour per IP
  message: {
    success: false,
    error: 'Too many profile creation attempts, please try again later'
  },
  skipSuccessfulRequests: true // Only count failed/new creations
});

// CORS Options
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, use strict origin but allow multiple if comma-separated
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(url => url.trim());
      // Support wildcard * explicitly, or exact match
      if (process.env.FRONTEND_URL === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
    
    // In development, allow common dev ports
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id'],
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
