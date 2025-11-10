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
			const customCtx = ctx as CustomContext;
			const userId = ctx.user?.user_id || null;
			
			// Определяем язык (по умолчанию русский, можно добавить выбор)
			customCtx.language = 'ru' as Language;
			customCtx.userId = userId;
			
			// Проверяем авторизацию
			if (userId) {
				const session = await this.authService.getSession(userId);
				if (session) {
					customCtx.isAuthorized = true;
					customCtx.userRole = session.role as UserRole;
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
		});
	}
}

