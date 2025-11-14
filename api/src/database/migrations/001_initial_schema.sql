-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей (базовая)
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	middle_name VARCHAR(100),
	phone VARCHAR(20),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица студентов
CREATE TABLE IF NOT EXISTS students (
	id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	student_id VARCHAR(50) UNIQUE NOT NULL,
	group_name VARCHAR(50),
	faculty VARCHAR(255),
	specialty VARCHAR(255),
	year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 6),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сотрудников
CREATE TABLE IF NOT EXISTS staff (
	id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	position VARCHAR(255) NOT NULL,
	department VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица справок
CREATE TABLE IF NOT EXISTS certificates (
	id SERIAL PRIMARY KEY,
	student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
	staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
	type VARCHAR(50) NOT NULL CHECK (type IN ('enrollment', 'academic', 'attendance', 'graduation', 'other')),
	status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'issued', 'rejected', 'approved', 'completed')),
	request_data JSONB NOT NULL DEFAULT '{}',
	issued_at TIMESTAMP,
	rejection_reason TEXT,
	notes TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_staff_id ON certificates(staff_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(type);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

