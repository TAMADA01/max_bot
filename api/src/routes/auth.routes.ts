import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authMiddleware.authenticate.bind(authMiddleware), authController.logout.bind(authController));
router.get('/me', authMiddleware.authenticate.bind(authMiddleware), authController.me.bind(authController));

export default router;

