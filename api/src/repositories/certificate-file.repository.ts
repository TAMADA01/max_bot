import { getPostgresPool } from '../config/database';
import { CertificateFile } from '../types';

export class CertificateFileRepository {
	private get pool() {
		return getPostgresPool();
	}

	async findById(id: number): Promise<CertificateFile | null> {
		const result = await this.pool.query(
			'SELECT * FROM certificate_files WHERE id = $1',
			[id]
		);
		return result.rows[0] || null;
	}

	async findByCertificateId(certificateId: number): Promise<CertificateFile | null> {
		const result = await this.pool.query(
			'SELECT * FROM certificate_files WHERE certificate_id = $1 ORDER BY created_at DESC LIMIT 1',
			[certificateId]
		);
		return result.rows[0] || null;
	}

	async findAllByCertificateId(certificateId: number): Promise<CertificateFile[]> {
		const result = await this.pool.query(
			'SELECT * FROM certificate_files WHERE certificate_id = $1 ORDER BY created_at DESC',
			[certificateId]
		);
		return result.rows;
	}

	async create(fileData: {
		certificate_id: number;
		file_name: string;
		file_path: string;
		file_size: number;
		mime_type: string;
		uploaded_by: number;
	}): Promise<CertificateFile> {
		const result = await this.pool.query(
			`INSERT INTO certificate_files (certificate_id, file_name, file_path, file_size, mime_type, uploaded_by)
			 VALUES ($1, $2, $3, $4, $5, $6)
			 RETURNING *`,
			[
				fileData.certificate_id,
				fileData.file_name,
				fileData.file_path,
				fileData.file_size,
				fileData.mime_type,
				fileData.uploaded_by,
			]
		);
		return result.rows[0];
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.pool.query(
			'DELETE FROM certificate_files WHERE id = $1',
			[id]
		);
		return result.rowCount ? result.rowCount > 0 : false;
	}

	async deleteByPath(filePath: string): Promise<boolean> {
		const result = await this.pool.query(
			'DELETE FROM certificate_files WHERE file_path = $1',
			[filePath]
		);
		return result.rowCount ? result.rowCount > 0 : false;
	}
}

