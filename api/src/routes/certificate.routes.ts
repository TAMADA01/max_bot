import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

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

// Роуты для работы с файлами

/**
 * @swagger
 * /api/certificates/{id}/upload:
 *   post:
 *     summary: Загрузить файл справки (альтернативный эндпоинт)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID справки
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Файл загружен
 *       403:
 *         description: Доступ запрещен (только для staff/admin)
 */
router.post(
	'/:id/upload',
	authMiddleware.requireRole('staff', 'admin'),
	upload.single('file'),
	certificateController.uploadFile.bind(certificateController)
);

/**
 * @swagger
 * /api/certificates/{id}/file:
 *   get:
 *     summary: Скачать файл справки
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID справки
 *     responses:
 *       200:
 *         description: Файл справки
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/msword:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Файл не найден
 */
router.get('/:id/file', certificateController.downloadFile.bind(certificateController));

/**
 * @swagger
 * /api/certificates/files/{fileId}:
 *   delete:
 *     summary: Удалить файл справки (только для admin)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID файла
 *     responses:
 *       204:
 *         description: Файл удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен (только для admin)
 */
router.delete('/files/:fileId', authMiddleware.requireRole('admin'), certificateController.deleteFile.bind(certificateController));

export default router;

