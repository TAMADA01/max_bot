import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types';

export class UserController {
	private userRepository = new UserRepository();
	private authService = new AuthService();

	async getAll(req: Request, res: Response) {
		try {
			if (!req.user || req.user.role !== UserRole.ADMIN) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const limit = parseInt(req.query.limit as string) || 100;
			const offset = parseInt(req.query.offset as string) || 0;

			const users = await this.userRepository.findAll(limit, offset);
			
			// Убираем пароли из ответа
			const usersWithoutPasswords = users.map(user => {
				const { password_hash, ...userWithoutPassword } = user;
				return userWithoutPassword;
			});

			res.json(usersWithoutPasswords);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async getById(req: Request, res: Response) {
		try {
			if (!req.user || req.user.role !== UserRole.ADMIN) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const id = parseInt(req.params.id);
			const user = await this.userRepository.findById(id);
			
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Убираем пароль из ответа
			const { password_hash, ...userWithoutPassword } = user;
			res.json(userWithoutPassword);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async create(req: Request, res: Response) {
		try {
			if (!req.user || req.user.role !== UserRole.ADMIN) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const { email, password, role, first_name, last_name, middle_name, phone, ...roleData } = req.body;

			// Валидация
			if (!email || !password || !role || !first_name || !last_name) {
				return res.status(400).json({ error: 'Missing required fields' });
			}

			if (!Object.values(UserRole).includes(role)) {
				return res.status(400).json({ error: 'Invalid role' });
			}

			// Создание пользователя
			const user = await this.authService.register({
				email,
				password,
				role,
				first_name,
				last_name,
				middle_name,
				phone,
			});

			// Создание дополнительных данных в зависимости от роли
			if (role === UserRole.STUDENT && roleData.student_id) {
				await this.userRepository.createStudent(user.id, {
					student_id: roleData.student_id,
					group_name: roleData.group_name,
					faculty: roleData.faculty,
					specialty: roleData.specialty,
					year_of_study: roleData.year_of_study,
				});
			} else if ((role === UserRole.STAFF || role === UserRole.ADMIN) && roleData.position) {
				await this.userRepository.createStaff(user.id, {
					position: roleData.position,
					department: roleData.department,
				});
			}

			// Убираем пароль из ответа
			const { password_hash, ...userWithoutPassword } = user;
			res.status(201).json(userWithoutPassword);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async delete(req: Request, res: Response) {
		try {
			if (!req.user || req.user.role !== UserRole.ADMIN) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const id = parseInt(req.params.id);
			
			// Нельзя удалить самого себя
			if (id === req.user.userId) {
				return res.status(400).json({ error: 'Cannot delete yourself' });
			}

			await this.userRepository.deleteById(id);
			res.json({ message: 'User deleted successfully' });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
}

