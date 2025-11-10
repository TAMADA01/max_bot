import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initPostgres, initRedis, closeConnections } from './config/database';
import { runMigrations } from './database/migrations';
import routes from './routes';
import { ErrorMiddleware } from './middleware/error.middleware';

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
		
		// Запуск сервера
		app.listen(PORT, () => {
			console.log(`✅ API server running on port ${PORT}`);
			console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
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