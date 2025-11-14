import { Bot } from '@maxhub/max-bot-api';
import { BotMiddleware } from './Middleware';
import { LoggerMiddleware } from './LoggerMiddleware';
import { ContextMiddleware } from './ContextMiddleware';
import { AuthService } from '../services/authService';

export function registerMiddlewares(bot: Bot, authService: AuthService) {
	const middlewares: BotMiddleware[] = [
		new LoggerMiddleware(),
		new ContextMiddleware(),
	];

	middlewares.forEach((middleware) => middleware.register(bot));
}