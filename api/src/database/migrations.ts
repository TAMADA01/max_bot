import { getPostgresPool } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

export async function runMigrations() {
	const pool = getPostgresPool();
	
	try {
		// Читаем файл миграции
		// В production используем dist, в dev - src
		const isProduction = process.env.NODE_ENV === 'production';
		let baseDir: string;
		
		if (isProduction) {
			// В production файлы в dist
			baseDir = path.join(__dirname, 'migrations');
		} else {
			// В development файлы в src (__dirname будет dist, нужно вернуться на уровень выше)
			baseDir = path.join(__dirname, '..', 'database', 'migrations');
		}
		
		const migrationPath = path.join(baseDir, '001_initial_schema.sql');
		
		console.log(`🔍 Looking for migration at: ${migrationPath}`);
		
		if (!fs.existsSync(migrationPath)) {
			console.warn(`⚠️  Migration file not found at ${migrationPath}, skipping migrations`);
			return;
		}
		
		const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
		
		// Выполняем миграцию
		await pool.query(migrationSQL);
		console.log('✅ Database migrations completed');
	} catch (error: any) {
		// Игнорируем ошибки, если таблицы уже существуют
		if (error.message && error.message.includes('already exists')) {
			console.log('ℹ️  Database tables already exist, skipping migrations');
			return;
		}
		console.error('❌ Migration error:', error);
		throw error;
	}
}

