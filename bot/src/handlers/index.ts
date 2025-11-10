import { Bot } from '@maxhub/max-bot-api';
import { BotHandler } from './Handler';
import { EchoHandler } from './EchoHandler';
import { CallbackHandler } from './CallbackHandler';
import { AuthService } from '../services/authService';
import { StartDialogHandler } from './StartDialogHandler';

export function registerHandlers(bot: Bot, authService: AuthService) {
	// CallbackHandler должен быть первым, чтобы обрабатывать callback и авторизацию
	const handlers: BotHandler[] = [
		new CallbackHandler(authService),
		new EchoHandler(), // EchoHandler обрабатывает только обычные сообщения
		new StartDialogHandler(),
	];

	handlers.forEach((handler) => handler.register(bot));
}