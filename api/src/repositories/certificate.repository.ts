import { getPostgresPool } from '../config/database';
import { Certificate, CertificateStatus, CertificateType } from '../types';

export class CertificateRepository {
	private get pool() {
		return getPostgresPool();
	}

	async findById(id: number): Promise<Certificate | null> {
		const result = await this.pool.query(
			'SELECT * FROM certificates WHERE id = $1',
			[id]
		);
		return result.rows[0] || null;
	}

	async findByStudentId(studentId: number, limit: number = 50, offset: number = 0): Promise<Certificate[]> {
		const result = await this.pool.query(
			`SELECT * FROM certificates 
			 WHERE student_id = $1 
			 ORDER BY created_at DESC 
			 LIMIT $2 OFFSET $3`,
			[studentId, limit, offset]
		);
		return result.rows;
	}

	async findByStatus(status: CertificateStatus, limit: number = 50, offset: number = 0): Promise<Certificate[]> {
		const result = await this.pool.query(
			`SELECT * FROM certificates 
			 WHERE status = $1 
			 ORDER BY created_at DESC 
			 LIMIT $2 OFFSET $3`,
			[status, limit, offset]
		);
		return result.rows;
	}

	async create(certificateData: {
		student_id: number;
		type: CertificateType;
		request_data: Record<string, any>;
	}): Promise<Certificate> {
		const result = await this.pool.query(
			`INSERT INTO certificates (student_id, type, request_data, status)
			 VALUES ($1, $2, $3, $4)
			 RETURNING *`,
			[
				certificateData.student_id,
				certificateData.type,
				JSON.stringify(certificateData.request_data),
				CertificateStatus.PENDING,
			]
		);
		return result.rows[0];
	}

	async updateStatus(
		id: number,
		status: CertificateStatus,
		staffId?: number,
		rejectionReason?: string
	): Promise<Certificate> {
		const updates: string[] = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
		const values: any[] = [id, status];

		if (staffId) {
			updates.push('staff_id = $' + (values.length + 1));
			values.push(staffId);
		}

		if (status === CertificateStatus.ISSUED) {
			updates.push('issued_at = CURRENT_TIMESTAMP');
		}

		if (rejectionReason) {
			updates.push('rejection_reason = $' + (values.length + 1));
			values.push(rejectionReason);
		}

		const result = await this.pool.query(
			`UPDATE certificates 
			 SET ${updates.join(', ')}
			 WHERE id = $1
			 RETURNING *`,
			values
		);
		return result.rows[0];
	}

	async assignToStaff(certificateId: number, staffId: number): Promise<Certificate> {
		const result = await this.pool.query(
			`UPDATE certificates 
			 SET staff_id = $2, status = $3, updated_at = CURRENT_TIMESTAMP
			 WHERE id = $1
			 RETURNING *`,
			[certificateId, staffId, CertificateStatus.IN_PROGRESS]
		);
		return result.rows[0];
	}

	async getStatistics(): Promise<{
		total: number;
		pending: number;
		in_progress: number;
		ready: number;
		issued: number;
		rejected: number;
	}> {
		const result = await this.pool.query(
			`SELECT 
				COUNT(*) as total,
				COUNT(*) FILTER (WHERE status = 'pending') as pending,
				COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
				COUNT(*) FILTER (WHERE status = 'ready') as ready,
				COUNT(*) FILTER (WHERE status = 'issued') as issued,
				COUNT(*) FILTER (WHERE status = 'rejected') as rejected
			 FROM certificates`
		);
		return result.rows[0];
	}
}

