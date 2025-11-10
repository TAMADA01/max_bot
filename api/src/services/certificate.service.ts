import { CertificateRepository } from '../repositories/certificate.repository';
import { UserRepository } from '../repositories/user.repository';
import { Certificate, CertificateStatus, CertificateType } from '../types';

export class CertificateService {
	private certificateRepository = new CertificateRepository();
	private userRepository = new UserRepository();

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
}

