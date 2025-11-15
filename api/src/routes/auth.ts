import { Router, Request, Response } from 'express';
import { getPool } from '../database';

const router = Router();

// Интерфейсы
interface DeaneryUser {
	id: number;
	login: string;
	password: string;
	name: string;
}

interface AuthSession {
	id: number;
	user_id: number | null;
	max_user_id: number;
	role: string;
	created_at: Date;
	expires_at: Date | null;
}

// Авторизация сотрудника деканата
router.post('/authenticate', async (req: Request, res: Response) => {
	try {
		const { login, password } = req.body;

		if (!login || !password) {
			return res.status(400).json({ error: 'Login and password are required' });
		}

		const db = getPool();
		const result = await db.query<DeaneryUser>(
			'SELECT * FROM deanery_users WHERE login = $1 AND password = $2',
			[login, password]
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid login or password' });
		}

		const user = result.rows[0];
		res.json({ user });
	} catch (error: any) {
		console.error('Auth error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Создание сессии
router.post('/sessions', async (req: Request, res: Response) => {
	try {
		const { max_user_id, user_id, role } = req.body;

		if (!max_user_id || !role) {
			return res.status(400).json({ error: 'max_user_id and role are required' });
		}

		const db = getPool();

		// Удаляем старые сессии
		await db.query('DELETE FROM auth_sessions WHERE max_user_id = $1', [max_user_id]);

		// Создаем новую сессию
		const result = await db.query<AuthSession>(
			'INSERT INTO auth_sessions (user_id, max_user_id, role) VALUES ($1, $2, $3) RETURNING *',
			[user_id || null, max_user_id, role]
		);

		res.json({ session: result.rows[0] });
	} catch (error: any) {
		console.error('Create session error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Получение сессии
router.get('/sessions/:maxUserId', async (req: Request, res: Response) => {
	try {
		const maxUserId = parseInt(req.params.maxUserId);

		if (isNaN(maxUserId)) {
			return res.status(400).json({ error: 'Invalid max_user_id' });
		}

		const db = getPool();
		const result = await db.query<AuthSession>(
			'SELECT * FROM auth_sessions WHERE max_user_id = $1 ORDER BY created_at DESC LIMIT 1',
			[maxUserId]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Session not found' });
		}

		res.json({ session: result.rows[0] });
	} catch (error: any) {
		console.error('Get session error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Удаление сессии
router.delete('/sessions/:maxUserId', async (req: Request, res: Response) => {
	try {
		const maxUserId = parseInt(req.params.maxUserId);

		if (isNaN(maxUserId)) {
			return res.status(400).json({ error: 'Invalid max_user_id' });
		}

		const db = getPool();
		await db.query('DELETE FROM auth_sessions WHERE max_user_id = $1', [maxUserId]);

		res.json({ success: true });
	} catch (error: any) {
		console.error('Delete session error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;

