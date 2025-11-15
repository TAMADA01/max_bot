import { getPostgresPool } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

export async function runMigrations() {
	const pool = getPostgresPool();
	
	try {
		// Читаем файлы миграций
		// В production используем dist, в dev - src
		const isProduction = process.env.NODE_ENV === 'production';
		let baseDir: string;
		
		if (isProduction) {
			// В production файлы в dist
			baseDir = path.join(__dirname, 'migrations');
		} else {
			// В development файлы в src (__dirname будет dist/database, нужно вернуться в src)
			baseDir = path.join(process.cwd(), 'src', 'database', 'migrations');
		}
		
		// Список миграций в порядке выполнения
		const migrations = [
			'001_initial_schema.sql',
			'002_add_certificate_files.sql'
		];
		
		console.log(`🔍 Looking for migrations in: ${baseDir}`);
		
		for (const migrationFile of migrations) {
			const migrationPath = path.join(baseDir, migrationFile);
			
			if (!fs.existsSync(migrationPath)) {
				console.warn(`⚠️  Migration file not found at ${migrationPath}, skipping`);
				continue;
			}
			
			const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
			
			try {
				// Выполняем миграцию
				await pool.query(migrationSQL);
				console.log(`✅ Migration ${migrationFile} completed`);
			} catch (error: any) {
				// Игнорируем ошибки, если таблицы/колонки уже существуют
				if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
					console.log(`ℹ️  Migration ${migrationFile} already applied, skipping`);
					continue;
				}
				throw error;
			}
		}
		
		console.log('✅ All database migrations completed');
	} catch (error: any) {
		console.error('❌ Migration error:', error);
		throw error;
	}
}

