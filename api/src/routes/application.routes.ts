import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const certificateController = new CertificateController();
const authMiddleware = new AuthMiddleware();

// Все роуты требуют аутентификации
router.use(authMiddleware.authenticate.bind(authMiddleware));

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Получить все заявки текущего пользователя
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Количество записей
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', certificateController.getMyApplications.bind(certificateController));

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Получить заявку по ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заявки
 *     responses:
 *       200:
 *         description: Данные заявки
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Заявка не найдена
 */
router.get('/:id', certificateController.getApplicationById.bind(certificateController));

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Создать новую заявку
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApplicationRequest'
 *     responses:
 *       201:
 *         description: Заявка создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Не авторизован
 */
router.post('/', certificateController.create.bind(certificateController));

/**
 * @swagger
 * /api/applications/admin/all:
 *   get:
 *     summary: Получить все заявки (только для staff/admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Количество записей
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список всех заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 */
router.get(
	'/admin/all',
	authMiddleware.requireRole('staff', 'admin'),
	certificateController.getAllApplications.bind(certificateController)
);

/**
 * @swagger
 * /api/applications/{id}/upload:
 *   post:
 *     summary: Загрузить файл справки (только для staff/admin)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заявки
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
 *                 description: Файл справки (PDF, DOC, DOCX, макс. 10MB)
 *     responses:
 *       201:
 *         description: Файл загружен
 *       400:
 *         description: Неверный файл
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 */
router.post(
	'/:id/upload',
	authMiddleware.requireRole('staff', 'admin'),
	upload.single('file'),
	certificateController.uploadFile.bind(certificateController)
);

export default router;

