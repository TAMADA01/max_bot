import { Bot } from '@maxhub/max-bot-api';

export interface BotCommand {
	register(bot: Bot): void;
}


