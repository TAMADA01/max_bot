import { Bot } from '@maxhub/max-bot-api';
import { BotHandler } from './Handler';
import { CustomContext } from '../types/context';
import { authStateManager } from '../services/authState';

export class EchoHandler implements BotHandler {
	register(bot: Bot): void {
		bot.on('message_created', async (ctx) => {
			try {
				const customCtx = ctx as CustomContext;
				const text = ctx.message?.body?.text || '';
				const userId = customCtx.userId;
				
				// Пропускаем команды
				if (text.startsWith('/')) return;
				
				// Пропускаем сообщения в процессе авторизации (обрабатываются CallbackHandler)
				if (userId && authStateManager.hasState(userId)) return;
				
				// Эхо только для обычных сообщений
				if (text) {
					await ctx.reply(`echo: ${text}`);
				}
			} catch (error) {
				console.error('Error in EchoHandler:', error);
				// Не пробрасываем ошибку дальше, чтобы не ломать бота
			}
		});
	}
}



