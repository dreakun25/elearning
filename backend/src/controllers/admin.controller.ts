import { Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../index';

const updateRoleSchema = z.object({
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional(),
});

export async function getUsers(req: Request, res: Response): Promise<void> {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { page, limit, search, role } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  if (id === req.user!.userId) {
    res.status(400).json({ error: 'Cannot change your own role' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true, image: true, bio: true, updatedAt: true },
  });

  res.json(updated);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (id === req.user!.userId) {
    res.status(400).json({ error: 'Cannot delete your own account' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}

export async function getStats(req: Request, res: Response): Promise<void> {
  const [usersByRole, coursesByStatus, totalEnrollments] = await Promise.all([
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    }),
    prisma.course.groupBy({
      by: ['published'],
      _count: { id: true },
    }),
    prisma.enrollment.count(),
  ]);

  const roleCounts: Record<string, number> = {};
  for (const row of usersByRole) {
    roleCounts[row.role] = row._count.id;
  }

  let publishedCount = 0;
  let draftCount = 0;
  for (const row of coursesByStatus) {
    if (row.published) publishedCount = row._count.id;
    else draftCount = row._count.id;
  }

  res.json({
    users: {
      total: usersByRole.reduce((sum, r) => sum + r._count.id, 0),
      byRole: roleCounts,
    },
    courses: {
      total: publishedCount + draftCount,
      published: publishedCount,
      drafts: draftCount,
    },
    enrollments: {
      total: totalEnrollments,
    },
  });
}

export async function getCourses(req: Request, res: Response): Promise<void> {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { lessons: true, enrollments: true, reviews: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  res.json({
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function featureCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const updated = await prisma.course.update({
    where: { id },
    data: { featured: !course.featured },
    select: { id: true, title: true, slug: true, featured: true, published: true },
  });

  res.json(updated);
}

export async function getEnrollmentsReport(req: Request, res: Response): Promise<void> {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, slug: true, price: true } },
    },
  });

  const header = 'User ID,User Name,User Email,Course ID,Course Title,Course Slug,Price,Enrolled At,Progress';
  const rows = enrollments.map(e =>
    `${e.userId},${e.user.name},${e.user.email},${e.courseId},${e.course.title},${e.course.slug},${e.course.price},${e.enrolledAt.toISOString()},${e.progress}`
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="enrollments.csv"');
  res.send([header, ...rows].join('\n'));
}

export async function getRevenueReport(req: Request, res: Response): Promise<void> {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: { select: { id: true, title: true, price: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const header = 'Course ID,Course Title,Price,Enrolled User ID,User Name,User Email,Enrolled At';
  const rows = enrollments.map(e =>
    `${e.courseId},${e.course.title},${e.course.price},${e.userId},${e.user.name},${e.user.email},${e.enrolledAt.toISOString()}`
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="revenue.csv"');
  res.send([header, ...rows].join('\n'));
}
