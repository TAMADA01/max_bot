import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../types';

export class AuthController {
	private authService = new AuthService();
	private userRepository = new UserRepository();

	async register(req: Request, res: Response) {
		try {
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

			const tokens = await this.authService.generateTokens(user);

			res.status(201).json({
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
					first_name: user.first_name,
					last_name: user.last_name,
				},
				tokens,
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({ error: 'Email and password are required' });
			}

			const { user, tokens } = await this.authService.login(email, password);

			res.json({
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
					first_name: user.first_name,
					last_name: user.last_name,
				},
				tokens,
			});
		} catch (error: any) {
			res.status(401).json({ error: error.message });
		}
	}

	async refresh(req: Request, res: Response) {
		try {
			const { refresh_token } = req.body;

			if (!refresh_token) {
				return res.status(400).json({ error: 'Refresh token is required' });
			}

			const tokens = await this.authService.refreshToken(refresh_token);

			res.json({ tokens });
		} catch (error: any) {
			res.status(401).json({ error: error.message });
		}
	}

	async logout(req: Request, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			await this.authService.logout(req.user.userId);
			res.json({ message: 'Logged out successfully' });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async me(req: Request, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const user = await this.userRepository.findById(req.user.userId);
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			res.json({
				id: user.id,
				email: user.email,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
				middle_name: user.middle_name,
				phone: user.phone,
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
}

