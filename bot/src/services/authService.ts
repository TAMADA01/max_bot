import { queryOne, query } from './database';

export interface DeaneryUser {
	id: number;
	login: string;
	password: string;
	name: string;
}

export interface AuthSession {
	id: number;
	user_id: number;
	max_user_id: number;
	role: string;
	created_at: Date;
	expires_at: Date | null;
}

export class AuthService {
	async authenticateDeanery(login: string, password: string): Promise<DeaneryUser | null> {
		const user = await queryOne<DeaneryUser>(
			'SELECT * FROM deanery_users WHERE login = $1 AND password = $2',
			[login, password]
		);
		return user;
	}
	
	async createSession(maxUserId: number, userId: number, role: string): Promise<void> {
		// Удаляем старые сессии
		await query('DELETE FROM auth_sessions WHERE max_user_id = $1', [maxUserId]);
		
		// Создаем новую сессию (без истечения для простоты)
		await query(
			'INSERT INTO auth_sessions (user_id, max_user_id, role) VALUES ($1, $2, $3)',
			[userId, maxUserId, role]
		);
	}
	
	async getSession(maxUserId: number): Promise<AuthSession | null> {
		return await queryOne<AuthSession>(
			'SELECT * FROM auth_sessions WHERE max_user_id = $1 ORDER BY created_at DESC LIMIT 1',
			[maxUserId]
		);
	}
	
	async clearSession(maxUserId: number): Promise<void> {
		await query('DELETE FROM auth_sessions WHERE max_user_id = $1', [maxUserId]);
	}
}

