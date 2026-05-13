import { Router } from 'express';
import { uploadFile, listFiles, downloadFile } from '../controllers/filesController';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import { auditLog } from '../middleware/auditLogger';

const router = Router();

router.post('/upload', authenticate, requireRole('student', 'teacher', 'admin'), uploadLimiter, upload.single('file'), auditLog('FILE_UPLOAD'), uploadFile);
router.get('/',        authenticate, requireRole('teacher', 'admin'), listFiles);
router.get('/:id',     authenticate, auditLog('FILE_DOWNLOAD'), downloadFile);

export default router;
