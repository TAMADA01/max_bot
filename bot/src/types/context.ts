import { Context } from '@maxhub/max-bot-api';

export type UserRole = 'student' | 'deanery' | null;
export type Language = 'ru' | 'en';

export interface CustomContext extends Context {
	// Авторизация
	isAuthorized: boolean;
	userRole: UserRole;
	userId: number | null;
	
	// Локализация
	language: Language;
	
	// Вспомогательные методы
	t: (key: string, params?: Record<string, string>) => string;
}

