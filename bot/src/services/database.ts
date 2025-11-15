import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

// Функция для ожидания с задержкой
function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry подключения к БД
async function connectWithRetry(databaseUrl: string, maxRetries: number = 10, initialDelay: number = 1000): Promise<Pool> {
	let lastError: any = null;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const testPool = new Pool({
				connectionString: databaseUrl,
				// Уменьшаем таймаут для быстрой проверки
				connectionTimeoutMillis: 2000,
			});
			
			// Пытаемся подключиться
			await testPool.query('SELECT NOW()');
			
			// Если успешно, возвращаем pool
			return testPool;
		} catch (err: any) {
			lastError = err;
			
			// Если это ошибка подключения (ECONNREFUSED), пробуем еще раз
			if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
				const delay = initialDelay * Math.pow(2, attempt - 1); // Экспоненциальная задержка
				console.log(`⏳ Database not ready yet (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
				await sleep(delay);
				continue;
			}
			
			// Для других ошибок не делаем retry
			throw err;
		}
	}
	
	// Если все попытки исчерпаны
	throw lastError;
}

export async function initDatabase(): Promise<Pool> {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL is not set in environment variables');
	}
	
	// Проверка формата URL
	if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
		console.error('❌ ERROR: DATABASE_URL must start with "postgresql://" or "postgres://"');
		throw new Error('Invalid DATABASE_URL format');
	}
	
	// Парсим URL для диагностики (без пароля)
	try {
		const url = new URL(databaseUrl);
		const user = url.username;
		const host = url.hostname;
		const port = url.port || '5432';
		const database = url.pathname.slice(1); // убираем первый /
		
		console.log('🔌 Connecting to database...');
		console.log(`   Host: ${host}:${port}`);
		console.log(`   Database: ${database}`);
		console.log(`   User: ${user}`);
	} catch (e) {
		console.log('🔌 Connecting to database...');
	}
	
	try {
		// Пытаемся подключиться с retry
		pool = await connectWithRetry(databaseUrl);
		console.log('✅ Database connected successfully');
		return pool;
	} catch (err: any) {
		console.error('❌ Database connection error:', err.message);
		throw err;
	}
}

export function getPool(): Pool {
	if (!pool) {
		throw new Error('Database not initialized. Call initDatabase() first.');
	}
	return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
	const result = await getPool().query(text, params);
	return result.rows;
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
	const rows = await query<T>(text, params);
	return rows.length > 0 ? rows[0] : null;
}

// Инициализация таблиц (если нужно)
export async function initTables() {
	const pool = getPool();
	
	// Таблица пользователей деканата
	await pool.query(`
		CREATE TABLE IF NOT EXISTS deanery_users (
			id SERIAL PRIMARY KEY,
			login VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`);
	
	// Таблица сессий авторизации
	await pool.query(`
		CREATE TABLE IF NOT EXISTS auth_sessions (
			id SERIAL PRIMARY KEY,
			user_id INTEGER,
			max_user_id BIGINT NOT NULL,
			role VARCHAR(50) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			expires_at TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES deanery_users(id) ON DELETE CASCADE
		)
	`);
	
	// Удаляем ограничение NOT NULL для user_id, если оно существует (для поддержки студентов)
	// Это делается через ALTER TABLE, но только если таблица уже существует
	try {
		await pool.query(`
			ALTER TABLE auth_sessions 
			ALTER COLUMN user_id DROP NOT NULL
		`);
	} catch (error: any) {
		// Игнорируем ошибку, если колонка уже nullable или таблица только что создана
		if (!error.message.includes('does not exist') && !error.message.includes('column "user_id" is not null')) {
			console.warn('Warning: Could not alter user_id column:', error.message);
		}
	}
	
	console.log('✅ Database tables initialized');
}

