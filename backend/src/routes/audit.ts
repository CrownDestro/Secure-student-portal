import { Router } from 'express';
import { getLogs } from '../controllers/auditController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('admin'), getLogs);

export default router;
