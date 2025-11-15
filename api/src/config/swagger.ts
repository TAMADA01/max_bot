import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'MAX Bot API',
			version: '1.0.0',
			description: 'API для системы управления заявками на справки',
			contact: {
				name: 'API Support',
				email: 'support@example.com',
			},
		},
		servers: [
			{
				url: process.env.API_BASE_URL || 'http://localhost:8080',
				description: 'Development server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Введите JWT токен',
				},
			},
			schemas: {
				Application: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description: 'ID заявки',
						},
						fullName: {
							type: 'string',
							description: 'ФИО студента',
						},
						groupNumber: {
							type: 'string',
							description: 'Номер группы',
						},
						admissionYear: {
							type: 'string',
							description: 'Год поступления',
						},
						copiesCount: {
							type: 'string',
							description: 'Количество экземпляров',
						},
						submissionPlace: {
							type: 'string',
							description: 'Место предоставления справки',
						},
						status: {
							type: 'string',
							enum: ['pending', 'approved', 'rejected', 'completed'],
							description: 'Статус заявки',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
							description: 'Дата создания',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
							description: 'Дата обновления',
						},
						notes: {
							type: 'string',
							nullable: true,
							description: 'Заметки или причина отказа',
						},
						certificateFile: {
							type: 'object',
							nullable: true,
							properties: {
								id: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								url: {
									type: 'string',
								},
								uploadedAt: {
									type: 'string',
									format: 'date-time',
								},
							},
						},
					},
				},
				CreateApplicationRequest: {
					type: 'object',
					required: ['type', 'request_data'],
					properties: {
						type: {
							type: 'string',
							enum: ['enrollment', 'academic', 'attendance', 'graduation', 'other'],
							description: 'Тип справки',
						},
						request_data: {
							type: 'object',
							required: ['fullName', 'groupNumber', 'admissionYear', 'copiesCount', 'submissionPlace'],
							properties: {
								fullName: {
									type: 'string',
									description: 'ФИО студента',
								},
								groupNumber: {
									type: 'string',
									description: 'Номер группы',
								},
								admissionYear: {
									type: 'string',
									description: 'Год поступления',
								},
								copiesCount: {
									type: 'string',
									description: 'Количество экземпляров',
								},
								submissionPlace: {
									type: 'string',
									description: 'Место предоставления',
								},
							},
						},
					},
				},
				UpdateStatusRequest: {
					type: 'object',
					required: ['status'],
					properties: {
						status: {
							type: 'string',
							enum: ['pending', 'in_progress', 'approved', 'ready', 'completed', 'issued', 'rejected'],
							description: 'Новый статус',
						},
						rejection_reason: {
							type: 'string',
							nullable: true,
							description: 'Причина отказа (для rejected)',
						},
					},
				},
				LoginRequest: {
					type: 'object',
					required: ['email', 'password'],
					properties: {
						email: {
							type: 'string',
							format: 'email',
							description: 'Email пользователя',
						},
						password: {
							type: 'string',
							format: 'password',
							description: 'Пароль',
						},
					},
				},
				AuthTokens: {
					type: 'object',
					properties: {
						access_token: {
							type: 'string',
							description: 'JWT access token',
						},
						refresh_token: {
							type: 'string',
							description: 'JWT refresh token',
						},
					},
				},
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							description: 'Сообщение об ошибке',
						},
					},
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		tags: [
			{
				name: 'Auth',
				description: 'Авторизация и аутентификация',
			},
			{
				name: 'Applications',
				description: 'Управление заявками (для веб-приложения)',
			},
			{
				name: 'Certificates',
				description: 'Управление справками (внутреннее API)',
			},
			{
				name: 'Files',
				description: 'Работа с файлами справок',
			},
			{
				name: 'Users',
				description: 'Управление пользователями',
			},
		],
	},
	apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

