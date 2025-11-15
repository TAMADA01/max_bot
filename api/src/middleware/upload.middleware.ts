import multer from 'multer';

// Настройка multer для хранения файлов в памяти
const storage = multer.memoryStorage();

// Фильтр файлов
const fileFilter = (
	req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	// Разрешенные типы файлов
	const allowedMimeTypes = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
	}
};

// Настройка multer
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
});

