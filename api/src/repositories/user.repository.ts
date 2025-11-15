import { getPostgresPool } from '../config/database';
import { User, Student, Staff, UserRole } from '../types';

export class UserRepository {
	private get pool() {
		return getPostgresPool();
	}

	async findById(id: number): Promise<User | null> {
		const result = await this.pool.query(
			'SELECT * FROM users WHERE id = $1',
			[id]
		);
		return result.rows[0] || null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const result = await this.pool.query(
			'SELECT * FROM users WHERE email = $1',
			[email]
		);
		return result.rows[0] || null;
	}

	async createUser(userData: {
		email: string;
		password_hash: string;
		role: UserRole;
		first_name: string;
		last_name: string;
		middle_name?: string;
		phone?: string;
	}): Promise<User> {
		const result = await this.pool.query(
			`INSERT INTO users (email, password_hash, role, first_name, last_name, middle_name, phone)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING *`,
			[
				userData.email,
				userData.password_hash,
				userData.role,
				userData.first_name,
				userData.last_name,
				userData.middle_name || null,
				userData.phone || null,
			]
		);
		return result.rows[0];
	}

	async createStudent(userId: number, studentData: {
		student_id: string;
		group_name?: string;
		faculty?: string;
		specialty?: string;
		year_of_study?: number;
	}): Promise<Student> {
		await this.pool.query(
			`INSERT INTO students (id, student_id, group_name, faculty, specialty, year_of_study)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			[
				userId,
				studentData.student_id,
				studentData.group_name || null,
				studentData.faculty || null,
				studentData.specialty || null,
				studentData.year_of_study || null,
			]
		);

		return await this.getStudentById(userId) as Student;
	}

	async createStaff(userId: number, staffData: {
		position: string;
		department?: string;
	}): Promise<Staff> {
		await this.pool.query(
			`INSERT INTO staff (id, position, department)
			 VALUES ($1, $2, $3)`,
			[
				userId,
				staffData.position,
				staffData.department || null,
			]
		);

		return await this.getStaffById(userId) as Staff;
	}

	async getStudentById(id: number): Promise<Student | null> {
		const result = await this.pool.query(
			`SELECT u.*, s.student_id, s.group_name, s.faculty, s.specialty, s.year_of_study
			 FROM users u
			 JOIN students s ON u.id = s.id
			 WHERE u.id = $1 AND u.role = 'student'`,
			[id]
		);
		return result.rows[0] || null;
	}

	async getStaffById(id: number): Promise<Staff | null> {
		const result = await this.pool.query(
			`SELECT u.*, s.position, s.department
			 FROM users u
			 JOIN staff s ON u.id = s.id
			 WHERE u.id = $1 AND u.role IN ('staff', 'admin')`,
			[id]
		);
		return result.rows[0] || null;
	}

	async findAll(limit: number = 100, offset: number = 0): Promise<(User | Student | Staff)[]> {
		const result = await this.pool.query(
			`SELECT 
				u.*,
				s.student_id, s.group_name, s.faculty, s.specialty, s.year_of_study,
				st.position, st.department
			 FROM users u
			 LEFT JOIN students s ON u.id = s.id AND u.role = 'student'
			 LEFT JOIN staff st ON u.id = st.id AND u.role IN ('staff', 'admin')
			 ORDER BY u.created_at DESC
			 LIMIT $1 OFFSET $2`,
			[limit, offset]
		);
		return result.rows;
	}

	async deleteById(id: number): Promise<void> {
		await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
	}
}

