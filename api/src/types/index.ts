// Роли пользователей
export enum UserRole {
	STUDENT = 'student',
	STAFF = 'staff',
	ADMIN = 'admin',
}

// Статусы справки
export enum CertificateStatus {
	PENDING = 'pending',        // Ожидает обработки
	IN_PROGRESS = 'in_progress', // В процессе оформления
	APPROVED = 'approved',      // Одобрена (алиас для ready)
	READY = 'ready',            // Готова к выдаче
	COMPLETED = 'completed',    // Завершена с файлом (алиас для issued)
	ISSUED = 'issued',          // Выдана
	REJECTED = 'rejected',      // Отклонена
}

// Типы справок
export enum CertificateType {
	ENROLLMENT = 'enrollment',           // Справка о зачислении
	ACADEMIC_PERFORMANCE = 'academic',   // Справка об успеваемости
	ATTENDANCE = 'attendance',           // Справка о посещаемости
	GRADUATION = 'graduation',          // Справка об окончании
	OTHER = 'other',                     // Другое
}

// Интерфейсы
export interface User {
	id: number;
	email: string;
	password_hash: string;
	role: UserRole;
	first_name: string;
	last_name: string;
	middle_name?: string;
	phone?: string;
	created_at: Date;
	updated_at: Date;
}

export interface Student extends User {
	student_id: string;        // Номер студенческого билета
	group_name?: string;       // Группа
	faculty?: string;         // Факультет
	specialty?: string;       // Специальность
	year_of_study?: number;   // Курс
}

export interface Staff extends User {
	position: string;          // Должность
	department?: string;       // Отдел/кафедра
}

export interface Certificate {
	id: number;
	student_id: number;
	staff_id?: number;         // Кто обрабатывает
	type: CertificateType;
	status: CertificateStatus;
	request_data: Record<string, any>; // Данные запроса
	issued_at?: Date;
	rejection_reason?: string;
	created_at: Date;
	updated_at: Date;
	notes?: string;
}

export interface CertificateFile {
	id: number;
	certificate_id: number;
	file_name: string;
	file_path: string;
	file_size: number;
	mime_type: string;
	uploaded_by: number;
	uploaded_at: Date;
	created_at: Date;
	updated_at: Date;
}

export interface CertificateWithFile extends Certificate {
	file?: CertificateFile;
}

// DTO для веб-приложения
export interface ApplicationDTO {
	id: string;
	fullName: string;
	groupNumber: string;
	admissionYear: string;
	copiesCount: string;
	submissionPlace: string;
	status: 'pending' | 'approved' | 'rejected' | 'completed';
	createdAt: string;
	updatedAt?: string;
	notes?: string;
	certificateFile?: {
		id: string;
		name: string;
		url: string;
		uploadedAt: string;
	};
}

export interface AuthTokens {
	access_token: string;
	refresh_token: string;
}

export interface JwtPayload {
	userId: number;
	role: UserRole;
	email: string;
}

