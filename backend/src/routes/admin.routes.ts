import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/admin/users', adminController.getUsers);
router.patch('/admin/users/:id/role', adminController.updateUserRole);
router.delete('/admin/users/:id', adminController.deleteUser);

router.get('/admin/stats', adminController.getStats);

router.get('/admin/courses', adminController.getCourses);
router.patch('/admin/courses/:id/feature', adminController.featureCourse);

router.get('/admin/reports/enrollments', adminController.getEnrollmentsReport);
router.get('/admin/reports/revenue', adminController.getRevenueReport);

export default router;
