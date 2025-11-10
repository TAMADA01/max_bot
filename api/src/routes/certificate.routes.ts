import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const certificateController = new CertificateController();
const authMiddleware = new AuthMiddleware();

// Все роуты требуют аутентификации
router.use(authMiddleware.authenticate.bind(authMiddleware));

// Роуты для сотрудников и админов (должны быть выше, чтобы не конфликтовать с /:id)
router.get('/', authMiddleware.requireRole('staff', 'admin'), certificateController.getAll.bind(certificateController));
router.get('/pending/list', authMiddleware.requireRole('staff', 'admin'), certificateController.getPending.bind(certificateController));

// Роуты для студентов
router.post('/', certificateController.create.bind(certificateController));
router.get('/my', certificateController.getMyCertificates.bind(certificateController));
router.get('/:id', certificateController.getById.bind(certificateController));

// Роуты для сотрудников и админов (продолжение)
router.post('/:id/assign', authMiddleware.requireRole('staff', 'admin'), certificateController.assign.bind(certificateController));
router.patch('/:id/status', authMiddleware.requireRole('staff', 'admin'), certificateController.updateStatus.bind(certificateController));

// Роуты для админов
router.get('/admin/statistics', authMiddleware.requireRole('admin'), certificateController.getStatistics.bind(certificateController));

export default router;

