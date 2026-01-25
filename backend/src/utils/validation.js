import { body, query, validationResult } from 'express-validator';
import { VALIDATION } from '../config/security.js';
import { AppError } from './errorHandler.js';

/**
 * Validation Middleware Wrapper
 * Checks for validation errors and throws AppError if found
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join('; ');
    next(new AppError(`Validation Error: ${errorMessages}`, 400));
  };
};

/**
 * Common Validators
 */
export const validators = {
  // Profile Validation
  profile: [
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: VALIDATION.MAX_STRING_LENGTH })
      .withMessage('Name too long'),
      
    body('role')
      .optional()
      .isString()
      .trim()
      .isLength({ max: VALIDATION.MAX_STRING_LENGTH })
      .withMessage('Role too long'),
      
    body('skills')
      .optional()
      .isArray({ max: VALIDATION.MAX_SKILLS })
      .withMessage(`Max ${VALIDATION.MAX_SKILLS} skills allowed`),
      
    body('skills.*')
      .isString()
      .trim()
      .isLength({ max: 50 }),
      
    body('minSalary')
      .optional()
      .isNumeric()
      .isFloat({ min: VALIDATION.MIN_SALARY, max: VALIDATION.MAX_SALARY })
      .withMessage('Invalid salary range'),
      
    body('preferredWorkplace')
      .optional()
      .isArray()
      .withMessage('Should be an array'),

    body('telegramChatId')
      .optional()
      .isString()
      .matches(/^\d+$/)
      .withMessage('Invalid Telegram Chat ID format')
  ],

  // Scraping Validation
  scrape: [
    body('query')
      .exists({ checkFalsy: true })
      .withMessage('Query is required')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 chars')
      .matches(/^[a-zA-Z0-9\s\-\.\,\u0400-\u04FF]+$/) // Allow Latin, Cyrillic, numbers, spaces, common punctuation
      .withMessage('Query contains invalid characters'),

    body('location')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Location too long')
      .blacklist('<>'), // Simple sanitation

    body('searchPeriodDays')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Search period must be between 1 and 30 days')
  ],

  // Notification Preferences
  preferences: [
    body('telegramChatId')
      .optional()
      .isString()
      .trim()
      .matches(/^\d+$/)
      .withMessage('Chat ID must contain only digits'),
      
    body('telegramEnabled')
      .optional()
      .isBoolean()
  ]
};
