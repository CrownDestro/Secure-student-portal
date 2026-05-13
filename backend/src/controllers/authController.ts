import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

const JWT_SECRET          = process.env.JWT_SECRET          || 'dev_secret';
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET  || 'dev_refresh';
const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN      || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

function signTokens(userId: string, role: UserRole) {
  const token = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);
  return { token, refreshToken };
}

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const user = new User({ name, email, passwordHash: password });
    await user.save();

    res.status(201).json({ message: 'Account created. Please log in.' });
  } catch (err) {
    logger.error('Register error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check account lock
    if (user.isLocked()) {
      res.status(423).json({ error: 'Account temporarily locked. Try again in 15 minutes.' });
      return;
    }

    const match = await user.comparePassword(password);
    if (!match) {
      user.failedLogins += 1;
      if (user.failedLogins >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Reset failed logins on success
    user.failedLogins = 0;
    user.lockUntil    = undefined;
    user.lastLogin    = new Date();
    await user.save();

    const { token, refreshToken } = signTokens(String(user._id), user.role);

    res
      .cookie('token', token, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
  } catch (err) {
    logger.error('Login error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/logout
export const logout = (_req: Request, res: Response): void => {
  res
    .clearCookie('token', COOKIE_OPTS)
    .clearCookie('refreshToken', COOKIE_OPTS)
    .json({ message: 'Logged out successfully' });
};

// POST /api/auth/refresh
export const refresh = (req: Request, res: Response): void => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; role: UserRole };
    const { token: newToken } = signTokens(decoded.userId, decoded.role);
    res
      .cookie('token', newToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .json({ message: 'Token refreshed' });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// GET /api/auth/me
export const me = (req: AuthRequest, res: Response): void => {
  const u = req.user!;
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role, lastLogin: u.lastLogin });
};
