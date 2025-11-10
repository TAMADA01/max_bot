import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export function initDatabase() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL is not set');
	}
	
	pool = new Pool({
		connectionString: databaseUrl,
	});
	
	// Проверка подключения
	pool.query('SELECT NOW()')
		.then(() => console.log('✅ Database connected'))
		.catch((err) => {
			console.error('❌ Database connection error:', err);
			throw err;
		});
	
	return pool;
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
			user_id INTEGER NOT NULL,
			max_user_id BIGINT NOT NULL,
			role VARCHAR(50) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			expires_at TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES deanery_users(id) ON DELETE CASCADE
		)
	`);
	
	console.log('✅ Database tables initialized');
}

