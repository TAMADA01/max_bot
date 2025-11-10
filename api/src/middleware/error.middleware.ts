import { Request, Response, NextFunction } from 'express';

export class ErrorMiddleware {
	static handle(err: Error, req: Request, res: Response, next: NextFunction) {
		console.error('Error:', err);

		// Определяем статус код
		let statusCode = 500;
		let message = 'Internal server error';

		if (err.message.includes('not found')) {
			statusCode = 404;
			message = err.message;
		} else if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
			statusCode = 401;
			message = err.message;
		} else if (err.message.includes('Forbidden') || err.message.includes('Access denied')) {
			statusCode = 403;
			message = err.message;
		} else if (err.message.includes('already exists')) {
			statusCode = 409;
			message = err.message;
		}

		res.status(statusCode).json({
			error: message,
			...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
		});
	}
}

