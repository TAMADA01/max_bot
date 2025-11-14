import { Bot, Context } from '@maxhub/max-bot-api';
import { BotMiddleware } from './Middleware';
import { CustomContext, UserRole, Language } from '../types/context';
import { getTranslator } from '../i18n';
import { AuthService } from '../services/authService';

export class ContextMiddleware implements BotMiddleware {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	register(bot: Bot): void {
		bot.use(async (ctx: Context, next: () => Promise<void>) => {
			try {
				const customCtx = ctx as CustomContext;
				const userId = ctx.user?.user_id || null;
				
				// Определяем язык (по умолчанию русский, можно добавить выбор)
				customCtx.language = 'ru' as Language;
				customCtx.userId = userId;
				
				// Проверяем авторизацию
				if (userId) {
					try {
						const session = await this.authService.getSession(userId);
						if (session) {
							customCtx.isAuthorized = true;
							customCtx.userRole = session.role as UserRole;
						} else {
							customCtx.isAuthorized = false;
							customCtx.userRole = null;
						}
					} catch (error) {
						// Если ошибка при получении сессии, считаем пользователя неавторизованным
						console.error('Error getting session in middleware:', error);
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

