// Управление состояниями авторизации пользователей
export type AuthState = 'waiting_login' | 'waiting_password' | null;

class AuthStateManager {
	private states = new Map<number, AuthState>();
	private pendingLogins = new Map<number, string>();

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

	clear(userId: number) {
		this.states.delete(userId);
		this.pendingLogins.delete(userId);
	}
}

export const authStateManager = new AuthStateManager();

