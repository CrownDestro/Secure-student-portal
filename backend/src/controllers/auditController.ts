import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AuditLog from '../models/AuditLog';
import logger from '../config/logger';

// GET /api/audit  (admin only)
export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page   = parseInt(req.query.page  as string) || 1;
    const limit  = parseInt(req.query.limit as string) || 50;
    const skip   = (page - 1) * limit;
    const action = req.query.action as string | undefined;
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (status) filter.status = status;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email')
        .sort('-timestamp')
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('getLogs error', { err });
    res.status(500).json({ error: 'Server error' });
  }
};
