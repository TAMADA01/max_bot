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
			try {
				const customCtx = ctx as CustomContext;
				const payload = ctx.callback?.payload || '';
				
				// Обработка отмены авторизации
				if (payload.startsWith('auth:')) {
					const action = payload.split(':')[1];
					if (action === 'cancel') {
						authStateManager.clear(customCtx.userId || 0);
						authStateManager.setState(customCtx.userId || 0, 'waiting_login');
						await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('Введите Email'), {
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
						await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('Введите Email'), {
							attachments: [getAuthCancelKeyboard(customCtx) as any]
						});
					}
				}
			} catch (error) {
				console.error('Error in message_callback handler:', error);
				// Не пробрасываем ошибку дальше, чтобы не ломать бота
			}
		});
		
		// Обработка текстовых сообщений в процессе авторизации
		bot.on('message_created', async (ctx) => {
			try {
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
						// handleAuth сам управляет состоянием (очищает при успехе, возвращает в waiting_login при ошибке)
					}
				}
			} catch (error) {
				console.error('Error in message_created handler (auth):', error);
				// Не пробрасываем ошибку дальше, чтобы не ломать бота
			}
		});
	}
	
	private async handleAuth(ctx: CustomContext, emailOrLogin: string, password: string) {
		const userId = ctx.userId || 0;
		
		try {
			// Пытаемся авторизовать как сотрудника деканата
			const deaneryUser = await this.authService.authenticateDeanery(emailOrLogin, password);
			
			if (deaneryUser) {
				// Авторизация успешна - это сотрудник деканата
				await this.authService.createSession(userId, deaneryUser.id, 'deanery');
				
				// Обновляем контекст после создания сессии
				ctx.isAuthorized = true;
				ctx.userRole = 'deanery';
				
				// Очищаем состояние авторизации
				authStateManager.clear(userId);
				
				await ctx.reply(ctx.t('authSuccess', { name: deaneryUser.name }), {
					attachments: [getAuthorizedDeaneryKeyboard(ctx) as any]
				});
				return;
			}
			
			// Если не сотрудник деканата, пытаемся авторизовать как студента
			const studentUser = await this.authService.authenticateStudent(emailOrLogin, password);
			
			if (studentUser) {
				// Авторизация успешна - это студент
				await this.authService.createSession(userId, studentUser.id, 'student');
				
				// Обновляем контекст после создания сессии
				ctx.isAuthorized = true;
				ctx.userRole = 'student';
				
				// Очищаем состояние авторизации
				authStateManager.clear(userId);
				
				const studentName = `${studentUser.first_name} ${studentUser.last_name}`.trim() || 'Студент';
				await ctx.reply(ctx.t('authSuccess', { name: studentName }), {
					attachments: [getAuthorizedStudentKeyboard(ctx) as any]
				});
				return;
			}
			
			// Если ни деканат, ни студент - просим повторить ввод email
			authStateManager.setState(userId, 'waiting_login');
			await ctx.reply(ctx.t('authFailed') + '\n\n' + ctx.t('Введите Email'), {
				attachments: [getAuthCancelKeyboard(ctx) as any]
			});
		} catch (error) {
			console.error('Auth error:', error);
			// При ошибке также просим повторить ввод email
			authStateManager.setState(userId, 'waiting_login');
			await ctx.reply(ctx.t('authFailed') + '\n\n' + ctx.t('Введите Email'), {
				attachments: [getAuthCancelKeyboard(ctx) as any]
			});
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
			await ctx.reply(ctx.t('logoutSuccess') + '\n\n' + ctx.t('authRequired') + '\n\n' + ctx.t('Введите Email'), {
				attachments: [getAuthCancelKeyboard(ctx) as any]
			});
		} catch (error) {
			console.error('Logout error:', error);
			await ctx.reply(ctx.t('authError'));
		}
	}
}

