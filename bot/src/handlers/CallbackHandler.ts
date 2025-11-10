import { Bot } from '@maxhub/max-bot-api';
import { BotHandler } from './Handler';
import { CustomContext } from '../types/context';
import { getStudentKeyboard } from '../keyboards/student';
import { getStartKeyboard } from '../keyboards/start';
import { getAuthCancelKeyboard } from '../keyboards/auth';
import { AuthService } from '../services/authService';
import { authStateManager } from '../services/authState';

export class CallbackHandler implements BotHandler {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	register(bot: Bot): void {
		bot.on('message_callback', async (ctx) => {
			const customCtx = ctx as CustomContext;
			const payload = ctx.callback?.payload || '';
			
			// Обработка выбора роли
			if (payload.startsWith('role:')) {
				const role = payload.split(':')[1];
				
				if (role === 'student') {
					await this.handleStudent(customCtx);
				} else if (role === 'deanery') {
					await this.handleDeanery(customCtx);
				}
			}
			
			// Обработка авторизации
			if (payload.startsWith('auth:')) {
				const action = payload.split(':')[1];
				if (action === 'cancel') {
					authStateManager.clear(customCtx.userId || 0);
					await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('chooseRole'), {
						attachments: [getStartKeyboard(customCtx) as any]
					});
				}
			}
			
			// Обработка возврата
			if (payload === 'back:start') {
				await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('chooseRole'), {
					attachments: [getStartKeyboard(customCtx) as any]
				});
			}
		});
		
		// Обработка текстовых сообщений в процессе авторизации
		bot.on('message_created', async (ctx) => {
			const customCtx = ctx as CustomContext;
			const userId = customCtx.userId;
			if (!userId) return;
			
			const state = authStateManager.getState(userId);
			const text = ctx.message?.body?.text || '';
			
			// Пропускаем команды
			if (text.startsWith('/')) return;
			
			if (state === 'waiting_login') {
				authStateManager.setState(userId, 'waiting_password');
				authStateManager.setPendingLogin(userId, text);
				await customCtx.reply(customCtx.t('enterPassword'), {
					attachments: [getAuthCancelKeyboard(customCtx) as any]
				});
			} else if (state === 'waiting_password') {
				const login = authStateManager.getPendingLogin(userId);
				if (login) {
					await this.handleAuth(customCtx, login, text);
					authStateManager.clear(userId);
				}
			}
		});
	}
	
	private async handleStudent(ctx: CustomContext) {
		await ctx.reply(ctx.t('studentMenu'), {
			attachments: [getStudentKeyboard(ctx) as any]
		});
	}
	
	private async handleDeanery(ctx: CustomContext) {
		if (ctx.isAuthorized && ctx.userRole === 'deanery') {
			await ctx.reply(ctx.t('alreadyAuthorized'));
			return;
		}
		
		authStateManager.setState(ctx.userId || 0, 'waiting_login');
		await ctx.reply(ctx.t('authRequired') + '\n\n' + ctx.t('enterLogin'), {
			attachments: [getAuthCancelKeyboard(ctx) as any]
		});
	}
	
	private async handleAuth(ctx: CustomContext, login: string, password: string) {
		try {
			const user = await this.authService.authenticateDeanery(login, password);
			
			if (user) {
				await this.authService.createSession(ctx.userId || 0, user.id, 'deanery');
				await ctx.reply(ctx.t('authSuccess', { name: user.name }));
			} else {
				await ctx.reply(ctx.t('authFailed'));
			}
		} catch (error) {
			console.error('Auth error:', error);
			await ctx.reply(ctx.t('authError'));
		}
	}
}

