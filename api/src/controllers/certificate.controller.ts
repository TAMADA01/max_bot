import { Request, Response } from 'express';
import { CertificateService } from '../services/certificate.service';
import { CertificateStatus, CertificateType } from '../types';

export class CertificateController {
	private certificateService = new CertificateService();

	async create(req: Request, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const { type, request_data } = req.body;

			if (!type || !Object.values(CertificateType).includes(type)) {
				return res.status(400).json({ error: 'Invalid certificate type' });
			}

			const certificate = await this.certificateService.createCertificate({
				student_id: req.user.userId,
				type,
				request_data: request_data || {},
			});

			res.status(201).json(certificate);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async getMyCertificates(req: Request, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const limit = parseInt(req.query.limit as string) || 50;
			const offset = parseInt(req.query.offset as string) || 0;

			const certificates = await this.certificateService.getStudentCertificates(
				req.user.userId,
				limit,
				offset
			);

			res.json(certificates);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async getById(req: Request, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const id = parseInt(req.params.id);
			const certificate = await this.certificateService.getCertificateById(
				id,
				req.user.userId,
				req.user.role
			);

			res.json(certificate);
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	}

	async getPending(req: Request, res: Response) {
		try {
			if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const limit = parseInt(req.query.limit as string) || 50;
			const offset = parseInt(req.query.offset as string) || 0;

			const certificates = await this.certificateService.getPendingCertificates(limit, offset);
			res.json(certificates);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async updateStatus(req: Request, res: Response) {
		try {
			if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const id = parseInt(req.params.id);
			const { status, rejection_reason } = req.body;

			if (!status || !Object.values(CertificateStatus).includes(status)) {
				return res.status(400).json({ error: 'Invalid status' });
			}

			const certificate = await this.certificateService.updateCertificateStatus(
				id,
				status,
				req.user.userId,
				rejection_reason
			);

			res.json(certificate);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async assign(req: Request, res: Response) {
		try {
			if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const id = parseInt(req.params.id);
			const certificate = await this.certificateService.assignCertificate(id, req.user.userId);

			res.json(certificate);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	async getStatistics(req: Request, res: Response) {
		try {
			if (!req.user || req.user.role !== 'admin') {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const statistics = await this.certificateService.getStatistics();
			res.json(statistics);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
}

