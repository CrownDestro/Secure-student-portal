import { Router } from 'express';
import { listUsers, updateRole, deactivateUser } from '../controllers/usersController';
import { authenticate, requireRole } from '../middleware/auth';
import { auditLog } from '../middleware/auditLogger';

const router = Router();

router.get('/',           authenticate, requireRole('admin'), listUsers);
router.patch('/:id/role', authenticate, requireRole('admin'), auditLog('UPDATE_ROLE'), updateRole);
router.delete('/:id',     authenticate, requireRole('admin'), auditLog('DEACTIVATE_USER'), deactivateUser);

export default router;
