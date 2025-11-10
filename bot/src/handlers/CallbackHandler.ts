import { Bot } from '@maxhub/max-bot-api';
import { BotHandler } from './Handler';
import { CustomContext } from '../types/context';
import { getAuthCancelKeyboard } from '../keyboards/auth';
import { getAuthorizedStudentKeyboard, getAuthorizedDeaneryKeyboard } from '../keyboards/authorized';
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
			
			// Обработка отмены авторизации
			if (payload.startsWith('auth:')) {
				const action = payload.split(':')[1];
				if (action === 'cancel') {
					authStateManager.clear(customCtx.userId || 0);
					authStateManager.setState(customCtx.userId || 0, 'waiting_login');
					await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('enterEmail'), {
						attachments: [getAuthCancelKeyboard(customCtx) as any]
					});
				}
			}
			
			// Обработка выхода
			if (payload === 'logout') {
				await this.handleLogout(customCtx);
			}
			
			// Обработка возврата
			if (payload === 'back:start') {
				// Проверяем авторизацию при возврате
				if (customCtx.isAuthorized && customCtx.userRole) {
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
					authStateManager.setState(customCtx.userId || 0, 'waiting_login');
					await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('enterEmail'), {
						attachments: [getAuthCancelKeyboard(customCtx) as any]
					});
				}
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
				const emailOrLogin = authStateManager.getPendingLogin(userId);
				if (emailOrLogin) {
					await this.handleAuth(customCtx, emailOrLogin, text);
					authStateManager.clear(userId);
				}
			}
		});
	}
	
	private async handleAuth(ctx: CustomContext, emailOrLogin: string, password: string) {
		try {
			// Пытаемся авторизовать как сотрудника деканата
			const user = await this.authService.authenticateDeanery(emailOrLogin, password);
			
			if (user) {
				// Авторизация успешна - это сотрудник деканата
				await this.authService.createSession(ctx.userId || 0, user.id, 'deanery');
				
				// Обновляем контекст после создания сессии
				ctx.isAuthorized = true;
				ctx.userRole = 'deanery';
				
				await ctx.reply(ctx.t('authSuccess', { name: user.name }), {
					attachments: [getAuthorizedDeaneryKeyboard(ctx) as any]
				});
			} else {
				// Если не сотрудник, пытаемся авторизовать как студента
				// TODO: Добавить метод authenticateStudent в AuthService для проверки студентов через API
				// Пока что для студентов создаем сессию (временное решение до добавления API для студентов)
				// В будущем здесь должна быть проверка студента через API: 
				// const student = await this.authService.authenticateStudent(emailOrLogin, password);
				// if (student) { ... }
				await this.authService.createStudentSession(ctx.userId || 0);
				
				// Обновляем контекст после создания сессии
				ctx.isAuthorized = true;
				ctx.userRole = 'student';
				
				await ctx.reply(ctx.t('authSuccess', { name: 'Студент' }), {
					attachments: [getAuthorizedStudentKeyboard(ctx) as any]
				});
			}
		} catch (error) {
			console.error('Auth error:', error);
			await ctx.reply(ctx.t('authFailed'));
		}
	}
	
	private async handleLogout(ctx: CustomContext) {
		try {
			const userId = ctx.userId;
			if (!userId) return;
			
			// Очищаем сессию
			await this.authService.clearSession(userId);
			
			// Очищаем состояние авторизации
			authStateManager.clear(userId);
			
			// Обновляем контекст
			ctx.isAuthorized = false;
			ctx.userRole = null;
			
			// Предлагаем авторизацию
			authStateManager.setState(userId, 'waiting_login');
			await ctx.reply(ctx.t('logoutSuccess') + '\n\n' + ctx.t('authRequired') + '\n\n' + ctx.t('enterEmail'), {
				attachments: [getAuthCancelKeyboard(ctx) as any]
			});
		} catch (error) {
			console.error('Logout error:', error);
			await ctx.reply(ctx.t('authError'));
		}
	}
}

