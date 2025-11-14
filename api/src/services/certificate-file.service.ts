import { CertificateFileRepository } from '../repositories/certificate-file.repository';
import { CertificateRepository } from '../repositories/certificate.repository';
import { CertificateFile, CertificateStatus } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CertificateFileService {
	private certificateFileRepository = new CertificateFileRepository();
	private certificateRepository = new CertificateRepository();
	private uploadDir = process.env.UPLOAD_DIR || './uploads/certificates';

	constructor() {
		this.ensureUploadDir();
	}

	private async ensureUploadDir() {
		try {
			await fs.mkdir(this.uploadDir, { recursive: true });
		} catch (error) {
			console.error('Failed to create upload directory:', error);
		}
	}

	async uploadFile(
		certificateId: number,
		file: Express.Multer.File,
		uploadedBy: number
	): Promise<CertificateFile> {
		// Проверяем, что справка существует
		const certificate = await this.certificateRepository.findById(certificateId);
		if (!certificate) {
			throw new Error('Certificate not found');
		}

		// Создаем уникальное имя файла
		const timestamp = Date.now();
		const fileName = file.originalname;
		const safeFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
		const filePath = path.join(this.uploadDir, safeFileName);

		// Сохраняем файл
		await fs.writeFile(filePath, file.buffer);

		// Сохраняем информацию в БД
		const certificateFile = await this.certificateFileRepository.create({
			certificate_id: certificateId,
			file_name: fileName,
			file_path: filePath,
			file_size: file.size,
			mime_type: file.mimetype,
			uploaded_by: uploadedBy,
		});

		// Обновляем статус справки на completed
		await this.certificateRepository.updateStatus(
			certificateId,
			CertificateStatus.COMPLETED,
			uploadedBy
		);

		return certificateFile;
	}

	async getFileById(fileId: number): Promise<CertificateFile | null> {
		return await this.certificateFileRepository.findById(fileId);
	}

	async getFileByCertificateId(certificateId: number): Promise<CertificateFile | null> {
		return await this.certificateFileRepository.findByCertificateId(certificateId);
	}

	async getFileContent(fileId: number): Promise<Buffer> {
		const file = await this.certificateFileRepository.findById(fileId);
		if (!file) {
			throw new Error('File not found');
		}

		try {
			return await fs.readFile(file.file_path);
		} catch (error) {
			throw new Error('Failed to read file');
		}
	}

	async deleteFile(fileId: number, userId: number, userRole: string): Promise<void> {
		const file = await this.certificateFileRepository.findById(fileId);
		if (!file) {
			throw new Error('File not found');
		}

		// Проверяем права доступа (только админ или тот кто загрузил)
		if (userRole !== 'admin' && file.uploaded_by !== userId) {
			throw new Error('Access denied');
		}

		// Удаляем файл с диска
		try {
			await fs.unlink(file.file_path);
		} catch (error) {
			console.error('Failed to delete file from disk:', error);
		}

		// Удаляем запись из БД
		await this.certificateFileRepository.delete(fileId);
	}

	async validateFile(file: Express.Multer.File): Promise<void> {
		const allowedMimeTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new Error('Invalid file type. Only PDF and Word documents are allowed.');
		}

		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			throw new Error('File size exceeds maximum allowed size (10MB).');
		}
	}
}

