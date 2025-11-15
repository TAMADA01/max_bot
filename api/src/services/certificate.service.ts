import { CertificateRepository } from '../repositories/certificate.repository';
import { UserRepository } from '../repositories/user.repository';
import { CertificateFileRepository } from '../repositories/certificate-file.repository';
import { Certificate, CertificateStatus, CertificateType, CertificateWithFile, ApplicationDTO } from '../types';

export class CertificateService {
	private certificateRepository = new CertificateRepository();
	private userRepository = new UserRepository();
	private certificateFileRepository = new CertificateFileRepository();

	async createCertificate(data: {
		student_id: number;
		type: CertificateType;
		request_data: Record<string, any>;
	}): Promise<Certificate> {
		// Проверяем, что пользователь - студент
		const student = await this.userRepository.getStudentById(data.student_id);
		if (!student) {
			throw new Error('Student not found');
		}

		return await this.certificateRepository.create(data);
	}

	async getStudentCertificates(studentId: number, limit: number = 50, offset: number = 0): Promise<Certificate[]> {
		return await this.certificateRepository.findByStudentId(studentId, limit, offset);
	}

	async getCertificateById(id: number, userId: number, userRole: string): Promise<Certificate> {
		const certificate = await this.certificateRepository.findById(id);
		if (!certificate) {
			throw new Error('Certificate not found');
		}

		// Студент может видеть только свои справки
		if (userRole === 'student' && certificate.student_id !== userId) {
			throw new Error('Access denied');
		}

		return certificate;
	}

	async updateCertificateStatus(
		certificateId: number,
		status: CertificateStatus,
		staffId: number,
		rejectionReason?: string
	): Promise<Certificate> {
		const certificate = await this.certificateRepository.findById(certificateId);
		if (!certificate) {
			throw new Error('Certificate not found');
		}

		// Проверяем права доступа
		const staff = await this.userRepository.getStaffById(staffId);
		if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
			throw new Error('Access denied');
		}

		return await this.certificateRepository.updateStatus(
			certificateId,
			status,
			staffId,
			rejectionReason
		);
	}

	async assignCertificate(certificateId: number, staffId: number): Promise<Certificate> {
		const certificate = await this.certificateRepository.findById(certificateId);
		if (!certificate) {
			throw new Error('Certificate not found');
		}

		if (certificate.status !== CertificateStatus.PENDING) {
			throw new Error('Certificate is already assigned or processed');
		}

		return await this.certificateRepository.assignToStaff(certificateId, staffId);
	}

	async getPendingCertificates(limit: number = 50, offset: number = 0): Promise<Certificate[]> {
		return await this.certificateRepository.findByStatus(CertificateStatus.PENDING, limit, offset);
	}

	async getStatistics() {
		return await this.certificateRepository.getStatistics();
	}

	async getAllCertificates(limit: number = 100, offset: number = 0): Promise<Certificate[]> {
		return await this.certificateRepository.findAll(limit, offset);
	}

	// Преобразование Certificate в ApplicationDTO для веб-приложения
	async toApplicationDTO(certificate: Certificate, userId?: number): Promise<ApplicationDTO> {
		// Получаем информацию о студенте
		const student = await this.userRepository.getStudentById(certificate.student_id);
		if (!student) {
			throw new Error('Student not found');
		}

		// Получаем файл, если есть
		const file = await this.certificateFileRepository.findByCertificateId(certificate.id);

		// Маппинг статусов
		let status: 'pending' | 'approved' | 'rejected' | 'completed';
		switch (certificate.status) {
			case CertificateStatus.PENDING:
			case CertificateStatus.IN_PROGRESS:
				status = 'pending';
				break;
			case CertificateStatus.APPROVED:
			case CertificateStatus.READY:
				status = 'approved';
				break;
			case CertificateStatus.COMPLETED:
			case CertificateStatus.ISSUED:
				status = 'completed';
				break;
			case CertificateStatus.REJECTED:
				status = 'rejected';
				break;
			default:
				status = 'pending';
		}

		const requestData = certificate.request_data as any;
		const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';

		return {
			id: certificate.id.toString(),
			fullName: requestData.fullName || `${student.last_name} ${student.first_name} ${student.middle_name || ''}`.trim(),
			groupNumber: requestData.groupNumber || student.group_name || '',
			admissionYear: requestData.admissionYear || '',
			copiesCount: requestData.copiesCount || '1',
			submissionPlace: requestData.submissionPlace || '',
			status,
			createdAt: certificate.created_at.toISOString(),
			updatedAt: certificate.updated_at?.toISOString(),
			notes: certificate.notes || certificate.rejection_reason,
			certificateFile: file ? {
				id: file.id.toString(),
				name: file.file_name,
				url: `${baseUrl}/api/certificates/${certificate.id}/file`,
				uploadedAt: file.uploaded_at.toISOString(),
			} : undefined,
		};
	}

	async getStudentApplications(studentId: number, limit: number = 50, offset: number = 0): Promise<ApplicationDTO[]> {
		const certificates = await this.certificateRepository.findByStudentId(studentId, limit, offset);
		return await Promise.all(certificates.map(cert => this.toApplicationDTO(cert, studentId)));
	}

	async getApplicationById(id: number, userId: number, userRole: string): Promise<ApplicationDTO> {
		const certificate = await this.getCertificateById(id, userId, userRole);
		return await this.toApplicationDTO(certificate, userId);
	}

	async getAllApplications(limit: number = 100, offset: number = 0): Promise<ApplicationDTO[]> {
		const certificates = await this.certificateRepository.findAll(limit, offset);
		return await Promise.all(certificates.map(cert => this.toApplicationDTO(cert)));
	}
}

