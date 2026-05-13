import { Router } from 'express';
import { register, login, logout, refresh, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';
import { auditLog } from '../middleware/auditLogger';
import { registerValidator, loginValidator } from '../validators/authValidators';

const router = Router();

router.post('/register', registerValidator, auditLog('REGISTER'), register);
router.post('/login',    loginLimiter, loginValidator, auditLog('LOGIN'), login);
router.post('/logout',   authenticate, auditLog('LOGOUT'), logout);
router.post('/refresh',  refresh);
router.get('/me',        authenticate, me);

export default router;
