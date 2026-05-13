import { Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from './auth';
import logger from '../config/logger';

export const auditLog = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Log after response finishes
    res.on('finish', async () => {
      try {
        await AuditLog.create({
          userId:    req.user?._id,
          userEmail: req.user?.email,
          action,
          resource:  req.originalUrl,
          ipAddress: req.ip || req.socket?.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          status:    res.statusCode < 400 ? 'success' : 'failure',
          metadata:  {
            method:     req.method,
            statusCode: res.statusCode,
          },
        });
      } catch (err) {
        logger.error('Audit log write failed', { err });
      }
    });
    next();
  };
};
