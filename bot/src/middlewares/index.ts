import { Bot, Context } from '@maxhub/max-bot-api';
import { BotMiddleware } from './Middleware';
import { LoggerMiddleware } from './LoggerMiddleware';

export function registerMiddlewares(bot: Bot) {
	const middlewares: BotMiddleware[] = [
		new LoggerMiddleware(),
	];

	middlewares.forEach((middleware) => middleware.register(bot));
}