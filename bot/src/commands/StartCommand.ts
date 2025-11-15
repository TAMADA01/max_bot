import { Bot } from '@maxhub/max-bot-api';
import { BotCommand } from './Command';
import { CustomContext } from '../types/context';
import { getAuthCancelKeyboard } from '../keyboards/auth';
import { authStateManager } from '../services/authState';

export class StartCommand implements BotCommand {
	register(bot: Bot): void {
		bot.command('start', async (ctx) => {
			const customCtx = ctx as CustomContext;
			
			// Предлагаем авторизацию
			authStateManager.setState(customCtx.userId || 0, 'waiting_login');
			await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('Введите Email'), {
				attachments: [getAuthCancelKeyboard(customCtx) as any]
			});
		});
	}
}


