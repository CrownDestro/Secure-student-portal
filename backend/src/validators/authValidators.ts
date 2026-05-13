import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[@$!%*?&#^()_+]/).withMessage('Password must contain a special character'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
