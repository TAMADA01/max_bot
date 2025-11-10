import { Bot, Context } from '@maxhub/max-bot-api';
import { BotHandler } from './Handler';
import { EchoHandler } from './EchoHandler';

export function registerHandlers(bot: Bot) {
	const handlers: BotHandler[] = [
		new EchoHandler(),
	];

	handlers.forEach((handler) => handler.register(bot));
}