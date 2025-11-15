import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { getRedisClient } from '../config/database';
import { User, UserRole, AuthTokens, JwtPayload } from '../types';

export class AuthService {
	private userRepository = new UserRepository();
	private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

	async register(data: {
		email: string;
		password: string;
		role: UserRole;
		first_name: string;
		last_name: string;
		middle_name?: string;
		phone?: string;
	}): Promise<User> {
		// Проверка существования пользователя
		const existingUser = await this.userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new Error('User with this email already exists');
		}

		// Хеширование пароля
		const password_hash = await bcrypt.hash(data.password, 10);

		// Создание пользователя
		const user = await this.userRepository.createUser({
			...data,
			password_hash,
		});

		return user;
	}

	async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new Error('Invalid credentials');
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);
		if (!isValidPassword) {
			throw new Error('Invalid credentials');
		}

		const tokens = await this.generateTokens(user);

		return { user, tokens };
	}

	async generateTokens(user: User): Promise<AuthTokens> {
		const payload: JwtPayload = {
			userId: user.id,
			role: user.role as UserRole,
			email: user.email,
		};

		const secret = this.jwtSecret;
		if (!secret) {
			throw new Error('JWT_SECRET is not set');
		}

		// Используем строковые литералы напрямую для обхода проблем с типизацией
		const access_token = jwt.sign(payload, secret, {
			expiresIn: '15m',
		});

		const refresh_token = jwt.sign(payload, secret, {
			expiresIn: '7d',
		});

		// Сохраняем refresh token в Redis
		try {
			const redis = getRedisClient();
			await redis.setEx(
				`refresh_token:${user.id}`,
				7 * 24 * 60 * 60, // 7 дней в секундах
				refresh_token
			);
		} catch (error) {
			// Если Redis недоступен, логируем ошибку, но не прерываем процесс
			console.warn('⚠️  Redis not available, refresh token not stored:', error);
		}

		return { access_token, refresh_token };
	}

	async refreshToken(refreshToken: string): Promise<AuthTokens> {
		try {
			const decoded = jwt.verify(refreshToken, this.jwtSecret) as JwtPayload;
			
			// Проверяем наличие токена в Redis
			try {
				const redis = getRedisClient();
				const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
				
				if (!storedToken || storedToken !== refreshToken) {
					throw new Error('Invalid refresh token');
				}
			} catch (redisError) {
				// Если Redis недоступен, пропускаем проверку (для разработки)
				console.warn('⚠️  Redis not available, skipping token validation:', redisError);
			}

			const user = await this.userRepository.findById(decoded.userId);
			if (!user) {
				throw new Error('User not found');
			}

			return await this.generateTokens(user);
		} catch (error) {
			throw new Error('Invalid refresh token');
		}
	}

	async logout(userId: number): Promise<void> {
		try {
			const redis = getRedisClient();
			await redis.del(`refresh_token:${userId}`);
		} catch (error) {
			// Если Redis недоступен, логируем ошибку, но не прерываем процесс
			console.warn('⚠️  Redis not available, token not deleted:', error);
		}
	}

	async verifyToken(token: string): Promise<JwtPayload> {
		try {
			const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
			return decoded;
		} catch (error) {
			throw new Error('Invalid token');
		}
	}
}

