import { Bot } from '@maxhub/max-bot-api';

export interface BotMiddleware {
	register(bot: Bot): void;
}