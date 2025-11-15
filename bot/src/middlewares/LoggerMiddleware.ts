import { Bot, Context } from '@maxhub/max-bot-api';
import { BotMiddleware } from './Middleware';

export class LoggerMiddleware implements BotMiddleware {
	register(bot: Bot): void {
		bot.use(async (ctx: Context, next: () => Promise<void>) => {
			const userId = ctx.user?.user_id;
			const text = ctx.message?.body?.text || (ctx.message ? 'no text' : 'no message');
			console.log(`[in] user=${userId} text="${text}"`);
			await next();
		});
	}
}



