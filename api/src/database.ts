import { Pool } from 'pg';

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

// Инициализация таблиц
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

