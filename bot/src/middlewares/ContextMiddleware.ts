import { Bot, Context } from '@maxhub/max-bot-api';
import { BotMiddleware } from './Middleware';
import { CustomContext, UserRole, Language } from '../types/context';
import { getTranslator } from '../i18n';
import { authStateManager } from '../services/authState';

export class ContextMiddleware implements BotMiddleware {

	register(bot: Bot): void {
		bot.use(async (ctx: Context, next: () => Promise<void>) => {
			try {
				const customCtx = ctx as CustomContext;
				const userId = ctx.user?.user_id || null;
				
				// Определяем язык (по умолчанию русский, можно добавить выбор)
				customCtx.language = 'ru' as Language;
				customCtx.userId = userId;
				
			// Проверяем авторизацию из памяти
			if (userId) {
				const authInfo = authStateManager.getAuthorized(userId);
				if (authInfo) {
					customCtx.isAuthorized = true;
					customCtx.userRole = authInfo.role;
				} else {
					customCtx.isAuthorized = false;
					customCtx.userRole = null;
				}
			} else {
				customCtx.isAuthorized = false;
				customCtx.userRole = null;
			}
				
				// Добавляем функцию перевода
				customCtx.t = getTranslator(customCtx.language);
				
				await next();
			} catch (error) {
				console.error('Error in ContextMiddleware:', error);
				// Пробрасываем ошибку дальше, но логируем её
				throw error;
			}
		});
	}
}

