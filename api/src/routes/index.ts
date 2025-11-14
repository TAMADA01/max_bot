import { Router } from 'express';
import authRoutes from './auth.routes';
import certificateRoutes from './certificate.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/certificates', certificateRoutes);
router.use('/users', userRoutes);

export default router;

