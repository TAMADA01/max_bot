import { Bot, Context } from '@maxhub/max-bot-api';
import { BotHandler } from './Handler';

export class EchoHandler implements BotHandler {
	register(bot: Bot): void {
		bot.on('message_created', async (ctx: Context) => {
			const text = ctx.message?.body?.text || '';
			if (text && !text.startsWith('/')) {
				await ctx.reply(`echo: ${text}`);
			}
		});
	}
}



