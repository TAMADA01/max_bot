import { Bot, Context } from '@maxhub/max-bot-api';
import { BotCommand } from './Command';
import { startKeyboard } from '../keyboards/start';

export class StartCommand implements BotCommand {
	register(bot: Bot): void {
		bot.command('start', async (ctx: Context) => {
			await ctx.reply('Добро пожаловать!', {
				attachments: [startKeyboard]
			});
		});
	}
}


