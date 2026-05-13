import { Router } from 'express';
import { sqliDemo, xssDemo, csrfDemo, uploadDemo } from '../controllers/attackController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All attack demo routes require authentication to prevent abuse
router.post('/sqli-demo',   authenticate, sqliDemo);
router.post('/xss-demo',    authenticate, xssDemo);
router.post('/csrf-demo',   authenticate, csrfDemo);
router.post('/upload-demo', authenticate, uploadDemo);

export default router;
