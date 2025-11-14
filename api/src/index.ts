import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { initPostgres, initRedis, closeConnections } from './config/database';
import { runMigrations } from './database/migrations';
import { initAdmin } from './database/init-admin';
import routes from './routes';
import { ErrorMiddleware } from './middleware/error.middleware';
import { swaggerSpec } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'OK', service: 'api', timestamp: new Date().toISOString() });
});

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
	customCss: '.swagger-ui .topbar { display: none }',
	customSiteTitle: 'MAX Bot API Documentation',
}));

// Admin panel static files
app.use('/admin', express.static('public/admin'));

// API routes
app.use('/api', routes);

// Error handling
app.use(ErrorMiddleware.handle);

// Инициализация
async function start() {
	try {
		// Подключение к БД
		await initPostgres();
		await initRedis();
		
		// Запуск миграций
		await runMigrations();
		
		// Создание администратора по умолчанию
		await initAdmin();
		
		// Запуск сервера
		app.listen(PORT, () => {
			console.log(`✅ API server running on port ${PORT}`);
			console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
			console.log(`📖 Swagger UI: http://localhost:${PORT}/api-docs`);
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	}
}

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('SIGTERM received, shutting down gracefully...');
	await closeConnections();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('SIGINT received, shutting down gracefully...');
	await closeConnections();
	process.exit(0);
});

start();