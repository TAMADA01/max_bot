import { getPostgresPool } from '../config/database';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types';

export async function initAdmin() {
	const pool = getPostgresPool();
	const userRepository = new UserRepository();
	const authService = new AuthService();

	// Параметры админа из переменных окружения
	const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
	const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
	const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Админ';
	const adminLastName = process.env.ADMIN_LAST_NAME || 'Системы';
	const adminPosition = process.env.ADMIN_POSITION || 'Администратор';

	try {
		// Проверяем, существует ли уже админ
		const existingAdmin = await userRepository.findByEmail(adminEmail);
		if (existingAdmin) {
			console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
			return;
		}

		// Создаем админа
		const user = await authService.register({
			email: adminEmail,
			password: adminPassword,
			role: UserRole.ADMIN,
			first_name: adminFirstName,
			last_name: adminLastName,
		});

		// Создаем запись в staff (админы тоже сотрудники)
		await userRepository.createStaff(user.id, {
			position: adminPosition,
			department: 'Администрация',
		});

		console.log(`✅ Admin user created successfully:`);
		console.log(`   Email: ${adminEmail}`);
		console.log(`   Password: ${adminPassword}`);
		console.log(`   Role: admin`);
	} catch (error: any) {
		console.error('❌ Error creating admin user:', error.message);
		// Не прерываем запуск, если админ уже существует
		if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
			throw error;
		}
	}
}

