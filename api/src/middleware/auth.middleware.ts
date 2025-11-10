import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../types';

// Расширяем Request для хранения данных пользователя
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

export class AuthMiddleware {
	private authService = new AuthService();

	async authenticate(req: Request, res: Response, next: NextFunction) {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return res.status(401).json({ error: 'No token provided' });
			}

			const token = authHeader.substring(7);
			const payload = await this.authService.verifyToken(token);

			req.user = payload;
			next();
		} catch (error) {
			return res.status(401).json({ error: 'Invalid token' });
		}
	}

	requireRole(...roles: string[]) {
		return (req: Request, res: Response, next: NextFunction) => {
			if (!req.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			if (!roles.includes(req.user.role)) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			next();
		};
	}
}

