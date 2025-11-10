import { Bot } from '@maxhub/max-bot-api';
import { BotCommand } from './Command';
import { CustomContext } from '../types/context';
import { getAuthorizedStudentKeyboard, getAuthorizedDeaneryKeyboard } from '../keyboards/authorized';
import { getAuthCancelKeyboard } from '../keyboards/auth';
import { authStateManager } from '../services/authState';

export class StartCommand implements BotCommand {
	register(bot: Bot): void {
		bot.command('start', async (ctx) => {
			const customCtx = ctx as CustomContext;
			
			// Проверяем авторизацию (уже установлена в middleware)
			if (customCtx.isAuthorized && customCtx.userRole) {
				// Пользователь авторизован - показываем кнопки в зависимости от роли
				if (customCtx.userRole === 'student') {
					await customCtx.reply(customCtx.t('welcome'), {
						attachments: [getAuthorizedStudentKeyboard(customCtx) as any]
					});
				} else if (customCtx.userRole === 'deanery') {
					await customCtx.reply(customCtx.t('welcome'), {
						attachments: [getAuthorizedDeaneryKeyboard(customCtx) as any]
					});
				}
			} else {
				// Пользователь не авторизован - предлагаем авторизацию
				authStateManager.setState(customCtx.userId || 0, 'waiting_login');
				await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('enterEmail'), {
					attachments: [getAuthCancelKeyboard(customCtx) as any]
				});
			}
		});
	}
}


