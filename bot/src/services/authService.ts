import { ApiClient } from './apiClient';

export interface DeaneryUser {
	id: number;
	login: string;
	password: string;
	name: string;
}

export interface AuthSession {
	id: number;
	user_id: number | null;
	max_user_id: number;
	role: string;
	created_at: Date;
	expires_at: Date | null;
}

interface AuthenticateResponse {
	user: DeaneryUser;
}

interface SessionResponse {
	session: AuthSession;
}

export class AuthService {
	private apiClient: ApiClient;

	constructor(apiClient?: ApiClient) {
		this.apiClient = apiClient || new ApiClient();
	}

	async authenticateDeanery(login: string, password: string): Promise<DeaneryUser | null> {
		try {
			const response = await this.apiClient.post<AuthenticateResponse>('/api/auth/authenticate', {
				login,
				password,
			});
			return response.user;
		} catch (error: any) {
			if (error.status === 401) {
				return null;
			}
			throw error;
		}
	}

	async authenticateStudent(email: string, password: string): Promise<{ id: number; email: string; role: string; first_name: string; last_name: string } | null> {
		try {
			const response = await this.apiClient.post<{ user: { id: number; email: string; role: string; first_name: string; last_name: string } }>('/api/auth/login', {
				email,
				password,
			});
			return response.user;
		} catch (error: any) {
			if (error.status === 401) {
				return null;
			}
			throw error;
		}
	}
	
	async createSession(maxUserId: number, userId: number | null, role: string): Promise<void> {
		await this.apiClient.post<SessionResponse>('/api/auth/sessions', {
			max_user_id: maxUserId,
			user_id: userId,
			role,
		});
	}
	
	// Создание сессии для студента (без userId из базы данных)
	async createStudentSession(maxUserId: number): Promise<void> {
		await this.createSession(maxUserId, null, 'student');
	}
	
	async getSession(maxUserId: number): Promise<AuthSession | null> {
		try {
			const response = await this.apiClient.get<SessionResponse>(`/api/auth/sessions/${maxUserId}`);
			return response.session;
		} catch (error: any) {
			if (error.status === 404) {
				return null;
			}
			throw error;
		}
	}
	
	async clearSession(maxUserId: number): Promise<void> {
		await this.apiClient.delete(`/api/auth/sessions/${maxUserId}`);
	}
}

