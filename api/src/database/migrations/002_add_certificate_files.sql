-- Таблица для файлов справок
CREATE TABLE IF NOT EXISTS certificate_files (
	id SERIAL PRIMARY KEY,
	certificate_id INTEGER NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
	file_name VARCHAR(255) NOT NULL,
	file_path VARCHAR(500) NOT NULL,
	file_size INTEGER NOT NULL,
	mime_type VARCHAR(100) NOT NULL,
	uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_certificate_files_certificate_id ON certificate_files(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_files_uploaded_by ON certificate_files(uploaded_by);

-- Триггер для обновления updated_at
CREATE TRIGGER update_certificate_files_updated_at BEFORE UPDATE ON certificate_files
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Добавляем новые статусы для совместимости с веб-приложением
-- approved = ready (готова к выдаче)
-- completed = issued (выдана с прикрепленным файлом)
-- Оставляем существующие статусы для обратной совместимости

