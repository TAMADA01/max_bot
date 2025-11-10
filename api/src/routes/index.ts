import { Router } from 'express';
import authRoutes from './auth.routes';
import certificateRoutes from './certificate.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/certificates', certificateRoutes);

export default router;

