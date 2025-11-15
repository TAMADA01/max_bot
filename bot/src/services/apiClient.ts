import axios, { AxiosInstance, AxiosError } from 'axios';

export interface ApiError {
	message: string;
	status?: number;
}

export class ApiClient {
	private client: AxiosInstance;
	private baseURL: string;

	constructor(baseURL?: string) {
		this.baseURL = baseURL || process.env.API_URL || 'http://localhost:8080';
		this.client = axios.create({
			baseURL: this.baseURL,
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Обработка ошибок
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				const apiError: ApiError = {
					message: error.message || 'Unknown error',
					status: error.response?.status,
				};

				if (error.response?.data) {
					const data = error.response.data as any;
					apiError.message = data.message || data.error || apiError.message;
				}

				return Promise.reject(apiError);
			}
		);
	}

	async get<T>(path: string, params?: Record<string, any>): Promise<T> {
		const response = await this.client.get<T>(path, { params });
		return response.data;
	}

	async post<T>(path: string, data?: any): Promise<T> {
		const response = await this.client.post<T>(path, data);
		return response.data;
	}

	async put<T>(path: string, data?: any): Promise<T> {
		const response = await this.client.put<T>(path, data);
		return response.data;
	}

	async delete<T>(path: string): Promise<T> {
		const response = await this.client.delete<T>(path);
		return response.data;
	}
}

