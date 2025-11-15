// Управление состояниями авторизации пользователей
import { UserRole } from '../types/context';

export type AuthState = 'waiting_login' | 'waiting_password' | null;

interface AuthInfo {
	userId: number;
	role: UserRole;
}

class AuthStateManager {
	private states = new Map<number, AuthState>();
	private pendingLogins = new Map<number, string>();
	private authorizedUsers = new Map<number, AuthInfo>();

	setState(userId: number, state: AuthState) {
		if (state === null) {
			this.states.delete(userId);
			this.pendingLogins.delete(userId);
		} else {
			this.states.set(userId, state);
		}
	}

	getState(userId: number): AuthState {
		return this.states.get(userId) || null;
	}

	hasState(userId: number): boolean {
		return this.states.has(userId);
	}

	setPendingLogin(userId: number, login: string) {
		this.pendingLogins.set(userId, login);
	}

	getPendingLogin(userId: number): string | undefined {
		return this.pendingLogins.get(userId);
	}

	setAuthorized(userId: number, role: UserRole) {
		this.authorizedUsers.set(userId, { userId, role });
	}

	getAuthorized(userId: number): AuthInfo | null {
		return this.authorizedUsers.get(userId) || null;
	}

	clear(userId: number) {
		this.states.delete(userId);
		this.pendingLogins.delete(userId);
		this.authorizedUsers.delete(userId);
	}
}

export const authStateManager = new AuthStateManager();

