import { Bot } from '@maxhub/max-bot-api';
import { BotCommand } from './Command';
import { StartCommand } from './StartCommand';

export function registerCommands(bot: Bot) { 
	const commands: BotCommand[] = [
		new StartCommand(),
	];

	commands.forEach((cmd) => cmd.register(bot));
}


