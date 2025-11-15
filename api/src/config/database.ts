import { Pool } from 'pg';
import { createClient } from 'redis';

let pgPool: Pool | null = null;
let redisClient: ReturnType<typeof createClient> | null = null;

// PostgreSQL подключение
export async function initPostgres(): Promise<Pool> {
	if (pgPool) {
		return pgPool;
	}

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL is not set');
	}

	pgPool = new Pool({
		connectionString: databaseUrl,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	});

	// Проверка подключения
	try {
		await pgPool.query('SELECT NOW()');
		console.log('✅ PostgreSQL connected');
	} catch (error) {
		console.error('❌ PostgreSQL connection error:', error);
		throw error;
	}

	return pgPool;
}

export function getPostgresPool(): Pool {
	if (!pgPool) {
		throw new Error('PostgreSQL not initialized. Call initPostgres() first.');
	}
	return pgPool;
}

// Redis подключение
export async function initRedis() {
	if (redisClient) {
		return redisClient;
	}

	const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
	redisClient = createClient({ url: redisUrl });

	redisClient.on('error', (err) => {
		console.error('❌ Redis Client Error:', err);
	});

	redisClient.on('connect', () => {
		console.log('🔌 Redis connecting...');
	});

	redisClient.on('ready', () => {
		console.log('✅ Redis connected');
	});

	await redisClient.connect();
	return redisClient;
}

export function getRedisClient() {
	if (!redisClient) {
		throw new Error('Redis not initialized. Call initRedis() first.');
	}
	return redisClient;
}

// Закрытие подключений
export async function closeConnections() {
	if (pgPool) {
		await pgPool.end();
		pgPool = null;
	}
	if (redisClient) {
		await redisClient.quit();
		redisClient = null;
	}
}

