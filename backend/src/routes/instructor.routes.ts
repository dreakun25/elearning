import { Router } from 'express';
import * as instructorController from '../controllers/instructor.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('INSTRUCTOR', 'ADMIN'));

router.post('/courses', instructorController.createCourse);
router.patch('/courses/:id', instructorController.updateCourse);
router.delete('/courses/:id', instructorController.deleteCourse);
router.post('/courses/:id/publish', instructorController.publishCourse);
router.get('/courses/:id/stats', instructorController.getCourseStats);

router.post('/courses/:courseId/lessons', instructorController.createLesson);
router.patch('/courses/:courseId/lessons/reorder', instructorController.reorderLessons);
router.patch('/courses/:courseId/lessons/:lessonId', instructorController.updateLesson);
router.delete('/courses/:courseId/lessons/:lessonId', instructorController.deleteLesson);

router.get('/courses/:courseId/enrollments', instructorController.getCourseEnrollments);

router.post('/lessons/:lessonId/quiz', instructorController.createQuiz);
router.patch('/quizzes/:id', instructorController.updateQuiz);
router.delete('/quizzes/:id', instructorController.deleteQuiz);

router.post('/quizzes/:id/questions', instructorController.addQuestion);
router.patch('/questions/:id', instructorController.updateQuestion);
router.delete('/questions/:id', instructorController.deleteQuestion);

export default router;
