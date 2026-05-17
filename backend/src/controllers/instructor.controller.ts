import { Request, Response } from 'express';
import { z } from 'zod';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../index';
import { slugify, uniqueSlug } from '../utils/slug';

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  image: z.string().url().optional(),
  price: z.coerce.number().min(0).default(0),
  category: z.string().max(100).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  image: z.string().url().optional(),
  price: z.coerce.number().min(0).optional(),
  category: z.string().max(100).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  published: z.boolean().optional(),
});

const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(false),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.coerce.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1),
});

const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  passingScore: z.coerce.number().int().min(0).max(100).default(80),
  attemptsAllowed: z.coerce.number().int().min(1).nullable().default(1),
});

const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  passingScore: z.coerce.number().int().min(0).max(100).optional(),
  attemptsAllowed: z.coerce.number().int().min(1).nullable().optional(),
});

const createQuestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK']).default('MULTIPLE_CHOICE'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  order: z.coerce.number().int().min(0).default(0),
  points: z.coerce.number().int().min(1).default(1),
});

const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK']).optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1).optional(),
  order: z.coerce.number().int().min(0).optional(),
  points: z.coerce.number().int().min(1).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function getCourseIfOwner(courseId: string, userId: string, role: Role) {
  if (role === 'ADMIN') {
    return prisma.course.findUnique({ where: { id: courseId } });
  }
  return prisma.course.findFirst({
    where: { id: courseId, instructorId: userId },
  });
}

async function getLessonIfCourseOwner(lessonId: string, userId: string, role: Role) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { instructorId: true } } },
  });
  if (!lesson) return null;
  if (role === 'ADMIN') return lesson;
  if (lesson.course.instructorId !== userId) return null;
  return lesson;
}

async function getQuizIfCourseOwner(quizId: string, userId: string, role: Role) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: {
        include: { course: { select: { instructorId: true } } },
      },
    },
  });
  if (!quiz) return null;
  if (role === 'ADMIN') return quiz;
  if (quiz.lesson.course.instructorId !== userId) return null;
  return quiz;
}

async function getQuestionIfCourseOwner(questionId: string, userId: string, role: Role) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      quiz: {
        include: {
          lesson: { include: { course: { select: { instructorId: true } } } },
        },
      },
    },
  });
  if (!question) return null;
  if (role === 'ADMIN') return question;
  if (question.quiz.lesson.course.instructorId !== userId) return null;
  return question;
}

// ── Course CRUD ──

export async function createCourse(req: Request, res: Response): Promise<void> {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { title, ...rest } = parsed.data;
  let slug = slugify(title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = uniqueSlug(slug);

  const course = await prisma.course.create({
    data: { ...rest, title, slug, instructorId: req.user!.userId },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json(course);
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const course = await getCourseIfOwner(id, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.title && data.title !== course.title) {
    let slug = slugify(data.title as string);
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing && existing.id !== course.id) slug = uniqueSlug(slug);
    data.slug = slug;
  }

  const updated = await prisma.course.update({
    where: { id },
    data,
    include: {
      instructor: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(updated);
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const course = await getCourseIfOwner(id, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  await prisma.course.delete({ where: { id } });
  res.status(204).send();
}

export async function publishCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const course = await getCourseIfOwner(id, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const updated = await prisma.course.update({
    where: { id },
    data: { published: !course.published },
    select: { id: true, title: true, slug: true, published: true },
  });

  res.json(updated);
}

export async function getCourseStats(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const course = await getCourseIfOwner(id, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const [enrollmentCount, reviews, totalLessons, publishedLessons] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: id } }),
    prisma.review.findMany({ where: { courseId: id }, select: { rating: true } }),
    prisma.lesson.count({ where: { courseId: id } }),
    prisma.lesson.count({ where: { courseId: id, published: true } }),
  ]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const revenue = Number(course.price) * enrollmentCount;

  res.json({
    enrollmentCount,
    totalLessons,
    publishedLessons,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
    revenue,
  });
}

// ── Lesson CRUD ──

export async function createLesson(req: Request, res: Response): Promise<void> {
  const { courseId } = req.params;

  const course = await getCourseIfOwner(courseId, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const maxOrder = await prisma.lesson.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      order: (maxOrder._max.order ?? -1) + 1,
      courseId,
    },
  });

  res.status(201).json(lesson);
}

export async function updateLesson(req: Request, res: Response): Promise<void> {
  const { courseId, lessonId } = req.params;

  const course = await getCourseIfOwner(courseId, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  const parsed = updateLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const updated = await prisma.lesson.update({
    where: { id: lessonId },
    data: parsed.data,
  });

  res.json(updated);
}

export async function deleteLesson(req: Request, res: Response): Promise<void> {
  const { courseId, lessonId } = req.params;

  const course = await getCourseIfOwner(courseId, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  await prisma.lesson.delete({ where: { id: lessonId } });
  res.status(204).send();
}

export async function reorderLessons(req: Request, res: Response): Promise<void> {
  const { courseId } = req.params;

  const course = await getCourseIfOwner(courseId, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const parsed = reorderLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { lessonIds } = parsed.data;

  const existingLessons = await prisma.lesson.count({
    where: { id: { in: lessonIds }, courseId },
  });

  if (existingLessons !== lessonIds.length) {
    res.status(400).json({ error: 'Some lesson IDs do not belong to this course' });
    return;
  }

  await prisma.$transaction(
    lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });

  res.json(lessons);
}

// ── Enrollments ──

export async function getCourseEnrollments(req: Request, res: Response): Promise<void> {
  const { courseId } = req.params;

  const course = await getCourseIfOwner(courseId, req.user!.userId, req.user!.role);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId },
      skip,
      take: limit,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    prisma.enrollment.count({ where: { courseId } }),
  ]);

  res.json({
    enrollments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// ── Quiz Management ──

export async function createQuiz(req: Request, res: Response): Promise<void> {
  const { lessonId } = req.params;

  const lesson = await getLessonIfCourseOwner(lessonId, req.user!.userId, req.user!.role);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  const existing = await prisma.quiz.findUnique({ where: { lessonId } });
  if (existing) {
    res.status(409).json({ error: 'Lesson already has a quiz' });
    return;
  }

  const parsed = createQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const quiz = await prisma.quiz.create({
    data: { ...parsed.data, lessonId },
    include: { questions: true },
  });

  res.status(201).json(quiz);
}

export async function updateQuiz(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const quiz = await getQuizIfCourseOwner(id, req.user!.userId, req.user!.role);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  const parsed = updateQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const updated = await prisma.quiz.update({
    where: { id },
    data: parsed.data,
    include: { questions: true },
  });

  res.json(updated);
}

export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const quiz = await getQuizIfCourseOwner(id, req.user!.userId, req.user!.role);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  await prisma.quiz.delete({ where: { id } });
  res.status(204).send();
}

export async function addQuestion(req: Request, res: Response): Promise<void> {
  const { id: quizId } = req.params;

  const quiz = await getQuizIfCourseOwner(quizId, req.user!.userId, req.user!.role);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  const parsed = createQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const question = await prisma.question.create({
    data: { ...parsed.data, options: parsed.data.options ?? Prisma.JsonNull, quizId },
  });

  res.status(201).json(question);
}

export async function updateQuestion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const question = await getQuestionIfCourseOwner(id, req.user!.userId, req.user!.role);
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  const parsed = updateQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.options !== undefined) {
    data.options = (data.options as string[]) ?? Prisma.JsonNull;
  }

  const updated = await prisma.question.update({
    where: { id },
    data,
  });

  res.json(updated);
}

export async function deleteQuestion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const question = await getQuestionIfCourseOwner(id, req.user!.userId, req.user!.role);
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  await prisma.question.delete({ where: { id } });
  res.status(204).send();
}
