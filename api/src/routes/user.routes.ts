import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

// Все роуты требуют аутентификации и роль admin
router.use(authMiddleware.authenticate.bind(authMiddleware));
router.use(authMiddleware.requireRole('admin'));

router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.post('/', userController.create.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

export default router;

