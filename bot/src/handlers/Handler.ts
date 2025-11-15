import { Bot } from '@maxhub/max-bot-api';

export interface BotHandler {
	register(bot: Bot): void;
}