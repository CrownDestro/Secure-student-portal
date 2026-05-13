import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User, { UserRole } from '../models/User';
import logger from '../config/logger';

// GET /api/users  (admin only)
export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-passwordHash').skip(skip).limit(limit).sort('-createdAt'),
      User.countDocuments(),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('listUsers error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/users/:id/role  (admin only)
export const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const validRoles: UserRole[] = ['student', 'teacher', 'admin'];

    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-passwordHash' }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Role updated', user });
  } catch (err) {
    logger.error('updateRole error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/users/:id  (admin only — soft delete)
export const deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (String(req.params.id) === String(req.user?._id)) {
      res.status(400).json({ error: 'Cannot deactivate your own account' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, select: '-passwordHash' }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deactivated', user });
  } catch (err) {
    logger.error('deactivateUser error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};
