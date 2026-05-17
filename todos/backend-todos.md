# Backend TODOs (Excluding Payments)

## 1. Project Setup & Configuration

- [x] Initialize backend — Express + TypeScript in `backend/` folder
  - [x] Choose package manager (npm)
  - [x] Install dependencies: prisma, @prisma/client, express, bcryptjs, zod (listed but not installed — need `npm install`)
  - [x] Set up TypeScript config (strict mode with extra flags)
  - [x] .gitignore created
- [x] Configure Prisma ORM
  - [x] `npx prisma init` — schema.prisma created
  - [x] Connect to PostgreSQL via DATABASE_URL in .env
- [x] Configure environment variables (.env)
  - [x] DATABASE_URL
  - [ ] JWT_SECRET (placeholder — needs real value)
  - [x] PORT
  - [x] NODE_ENV

## 2. Database Schema (Prisma)

- [x] Define User model
  - [x] id (uuid)
  - [x] name, email (unique), passwordHash
  - [x] role: enum (STUDENT, INSTRUCTOR, ADMIN)
  - [x] image (nullable)
  - [x] emailVerified (DateTime, nullable)
  - [x] createdAt, updatedAt
- [x] Define Course model
  - [x] id, title, slug (unique), description, price (Decimal)
  - [x] image, category, level (BEGINNER / INTERMEDIATE / ADVANCED)
  - [x] published (boolean, default false)
  - [x] instructorId (FK → User)
  - [x] createdAt, updatedAt
- [x] Define Lesson model
  - [x] id, title, content (rich text), videoUrl (nullable)
  - [x] order (int), duration (int, minutes)
  - [x] courseId (FK → Course)
  - [x] published (boolean, default false)
  - [x] createdAt, updatedAt
- [x] Define Enrollment model
  - [x] id, userId (FK → User), courseId (FK → Course)
  - [x] progress (float, default 0)
  - [x] enrolledAt (DateTime)
  - [x] unique constraint on [userId, courseId]
- [x] Define LessonProgress model
  - [x] id, enrollmentId (FK → Enrollment)
  - [x] lessonId (FK → Lesson)
  - [x] completed (boolean, default false)
  - [x] completedAt (DateTime, nullable)
  - [x] unique constraint on [enrollmentId, lessonId]
- [x] Define Quiz model
  - [x] id, title, lessonId (FK → Lesson)
  - [x] passingScore (int, default 80)
  - [x] attemptsAllowed (Int?, nullable = unlimited, default 1)
  - [x] createdAt
- [x] Define Question model
  - [x] id, quizId (FK → Quiz)
  - [x] text, type (MULTIPLE_CHOICE / TRUE_FALSE / FILL_BLANK)
  - [x] options (JSON array)
  - [x] correctAnswer (string)
  - [x] order (int)
  - [x] points (int, default 1)
- [x] Define QuizAttempt model
  - [x] id, userId (FK → User), quizId (FK → Quiz)
  - [x] score (int), maxScore (int)
  - [x] answers (JSON — stores user's answers)
  - [x] passed (boolean)
  - [x] startedAt, completedAt (DateTime, nullable)
  - [x] index on [userId, quizId] (not unique — multiple attempts allowed)
- [x] Define Certificate model
  - [x] id, userId (FK → User), courseId (FK → Course)
  - [x] issuedAt (DateTime)
  - [x] certificateUrl (nullable — points to generated PDF)
  - [x] unique constraint on [userId, courseId]
- [x] Define Review model
  - [x] id, userId (FK → User), courseId (FK → Course)
  - [x] rating (int, 1–5)
  - [x] text (text, nullable)
  - [x] createdAt
  - [x] unique constraint on [userId, courseId]
- [ ] Define Category / Tag models (optional for filtering)
- [ ] Run initial migration: `npx prisma migrate dev`
- [ ] Write seed script
  - [ ] Seed admin user
  - [ ] Seed instructor user
  - [ ] Seed 2–3 sample courses with lessons
  - [ ] Seed quiz with questions
  - [ ] Verify with `npx prisma studio`

## 3. Authentication (NextAuth.js in Frontend)

- [x] Set up custom JWT strategy — overrides NextAuth's default encode/decode with HS256
- [x] Set up NextAuth v5 config in `frontend/src/lib/auth.ts`
  - [x] Credentials provider that calls Express backend for login verification
  - [x] Custom JWT encode/decode using `jose` (HS256, shared with backend)
  - [x] JWT callback stores userId (sub) and role in token
  - [x] Session callback exposes userId and role to client
- [x] Set up NextAuth route handler `app/api/auth/[...nextauth]/route.ts`
- [x] Update Express auth middleware to verify NextAuth JWTs
  - [x] `authenticate` — verifies Bearer token as NextAuth JWT via `jsonwebtoken`
  - [x] `requireRole(...roles)` — RBAC guard
- [x] Express signup/login endpoints return user data only (no JWT — NextAuth handles sessions)
- [x] Create `frontend/src/lib/api.ts` — helper to call Express from Server Components/Actions
  - [x] Reads `authjs.session-token` cookie and sends as Bearer header
- [ ] Add Google OAuth provider (optional)
- [ ] Add GitHub OAuth provider (optional)
- [ ] Create password reset flow (optional but recommended)
- [ ] Test auth flows end-to-end

## 4. User Profile & Management

- [x] GET `/api/users/me` — return current user profile
- [x] PATCH `/api/users/me` — update profile (name, image, bio)
- [x] GET `/api/users/:id` — public profile (only name, bio, published courses)
- [x] Input validation with Zod on all mutating endpoints
- [ ] Admin endpoints (require ADMIN role)
  - [ ] GET `/api/admin/users` — list all users (paginated)
  - [ ] PATCH `/api/admin/users/:id/role` — change user role
  - [ ] DELETE `/api/admin/users/:id` — ban/delete user

## 5. Courses API

- [ ] GET `/api/courses` — list published courses
  - [ ] Pagination (cursor or offset-based)
  - [ ] Search by title (full-text or ILIKE)
  - [ ] Filter by category, level, price range
  - [ ] Sort by newest, popular (enrollment count), rating
  - [ ] Include instructor name & avatar
  - [ ] Include average rating
- [ ] GET `/api/courses/:slug` — course detail
  - [ ] Include lessons (ordered, published only for non-instructors)
  - [ ] Include instructor profile
  - [ ] Include review summary (average, count)
  - [ ] Include user's enrollment status & progress (if authenticated)
- [ ] POST `/api/courses` — create course (INSTRUCTOR only)
  - [ ] Validate with Zod
  - [ ] Auto-generate slug from title
  - [ ] Set instructorId to current user
- [ ] PATCH `/api/courses/:id` — update course (owner or ADMIN)
  - [ ] Validate fields
  - [ ] Re-generate slug if title changed
- [ ] DELETE `/api/courses/:id` — delete course (owner or ADMIN)
  - [ ] Cascade or soft-delete
- [ ] POST `/api/courses/:id/publish` — toggle publish status
- [ ] GET `/api/courses/:id/stats` — instructor stats (enrollment count, revenue, avg rating)

## 6. Lessons API

- [ ] GET `/api/courses/:courseId/lessons` — list lessons
  - [ ] Ordered by `order` field
  - [ ] Include completion status (if enrolled user)
- [ ] GET `/api/courses/:courseId/lessons/:lessonId` — single lesson
  - [ ] Return full content (if enrolled or instructor)
  - [ ] Return quiz data if lesson has one
- [ ] POST `/api/courses/:courseId/lessons` — create lesson (instructor/owner)
  - [ ] Auto-assign order (append at end)
  - [ ] Validate
- [ ] PATCH `/api/courses/:courseId/lessons/:lessonId` — update lesson
- [ ] DELETE `/api/courses/:courseId/lessons/:lessonId` — delete lesson
- [ ] PATCH `/api/courses/:courseId/lessons/reorder` — reorder lessons
  - [ ] Accept array of lesson IDs in new order
  - [ ] Update all at once in a transaction
- [ ] POST `/api/courses/:courseId/lessons/:lessonId/progress` — mark lesson complete
  - [ ] Verify user is enrolled
  - [ ] Upsert LessonProgress record
  - [ ] Recalculate course progress (%)

## 7. Enrollments API

- [ ] POST `/api/courses/:courseId/enroll` — enroll user
  - [ ] Check if already enrolled (return 409)
  - [ ] Create Enrollment record
  - [ ] Handle free courses (immediate)
  - [ ] Handle paid courses (check payment status)
- [ ] GET `/api/enrollments/mine` — current user's enrollments
  - [ ] Include course details
  - [ ] Include progress percentage
  - [ ] Filter by status (in-progress / completed)
- [ ] GET `/api/courses/:courseId/enrollments` — list enrollments (instructor)
  - [ ] Paginated list of enrolled students
- [ ] PATCH `/api/enrollments/:id/progress` — update progress manually (if needed)

## 8. Progress Tracking

- [ ] Calculate course progress endpoint: `GET /api/courses/:courseId/progress`
  - [ ] % = (completed lessons / total lessons) * 100
  - [ ] Cache result or compute on-demand
- [ ] Auto-mark course completion
  - [ ] When all lessons completed and quiz passed (if exists)
  - [ ] Trigger certificate generation
- [ ] Resume endpoint: `GET /api/courses/:courseId/resume`
  - [ ] Return last incomplete lesson
  - [ ] Return first uncompleted lesson
- [ ] GET `/api/users/:id/stats` — public stats (streak, completed courses, total lessons)

## 9. Quizzes & Assessments

- [ ] GET `/api/lessons/:lessonId/quiz` — get quiz (if enrolled)
  - [ ] Return questions WITHOUT correctAnswer revealed
  - [ ] Shuffle question order? (option)
- [ ] POST `/api/lessons/:lessonId/quiz/attempt` — submit quiz attempt
  - [ ] Accept array of { questionId, answer }
  - [ ] Auto-grade: compare answers, calculate score
  - [ ] Record QuizAttempt
  - [ ] Return score, correct/incorrect breakdown, explanations
- [ ] GET `/api/lessons/:lessonId/quiz/attempts` — user's past attempts
- [ ] Admin / Instructor quiz management
  - [ ] POST `/api/lessons/:lessonId/quiz` — create quiz
  - [ ] PATCH `/api/quizzes/:id` — update quiz
  - [ ] DELETE `/api/quizzes/:id` — delete quiz
  - [ ] POST `/api/quizzes/:id/questions` — add question
  - [ ] PATCH `/api/questions/:id` — update question
  - [ ] DELETE `/api/questions/:id` — delete question

## 10. Certificates

- [ ] Generate certificate PDF
  - [ ] Use PDF generation library (pdf-lib, jsPDF, or puppeteer)
  - [ ] Template: user name, course name, completion date, unique ID
  - [ ] Store URL in Certificate model
- [ ] POST `/api/courses/:courseId/certificate` — generate certificate
  - [ ] Verify course fully completed
  - [ ] Check if already exists (return existing)
  - [ ] Generate PDF, upload to S3/R2
  - [ ] Save URL
- [ ] GET `/api/certificates/mine` — list user's certificates
- [ ] GET `/api/certificates/verify/:id` — public verification page
  - [ ] Return user name, course name, issue date
  - [ ] Return valid/invalid status

## 11. Reviews & Ratings

- [ ] GET `/api/courses/:courseId/reviews` — list reviews (paginated)
  - [ ] Sort by newest / highest rating
  - [ ] Include user name and avatar
- [ ] POST `/api/courses/:courseId/reviews` — create review
  - [ ] Verify user is enrolled
  - [ ] Validate rating (1–5) and optional text
  - [ ] One review per user per course
- [ ] PATCH `/api/reviews/:id` — update own review
- [ ] DELETE `/api/reviews/:id` — delete own review
- [ ] GET `/api/courses/:courseId/rating` — rating summary
  - [ ] Average rating
  - [ ] Rating distribution (count per star)
  - [ ] Total review count

## 12. File Uploads (Images & Video)

- [ ] Set up file upload infrastructure
  - [ ] Option A: Uploadthing (easiest for Next.js)
  - [ ] Option B: AWS S3 / Cloudflare R2 + presigned URLs
- [ ] POST `/api/upload/image` — upload course/avatar image
  - [ ] Validate file type (jpg, png, webp)
  - [ ] Validate size (max 5MB)
  - [ ] Return URL
- [ ] POST `/api/upload/video` — upload lesson video
  - [ ] Validate file type (mp4, webm)
  - [ ] Validate size (max 500MB)
  - [ ] Return URL
  - [ ] Consider video processing/transcoding queue (optional)

## 13. Admin Endpoints

- [ ] GET `/api/admin/stats` — platform-wide stats
  - [ ] Total users (split by role)
  - [ ] Total courses (published vs draft)
  - [ ] Total enrollments
  - [ ] Revenue (if applicable)
- [ ] GET `/api/admin/courses` — list all courses (including drafts)
- [ ] PATCH `/api/admin/courses/:id/feature` — feature/unfeature course
- [ ] GET `/api/admin/reports/enrollments` — enrollment report (CSV export)
- [ ] GET `/api/admin/reports/revenue` — revenue report (CSV export)

## 14. Search & Filtering

- [ ] Implement full-text search for courses
  - [ ] PostgreSQL full-text search (tsvector)
  - [ ] Or basic ILIKE on title + description
- [ ] Category/tag filtering
- [ ] Level filtering (BEGINNER / INTERMEDIATE / ADVANCED)
- [ ] Price range filtering (free / paid / price range)
- [ ] Sorting: newest, popular, top-rated

## 15. Rate Limiting & Security

- [ ] Implement rate limiting on auth endpoints (login, signup)
  - [ ] Use upstash-rate-limiter or a simple in-memory map
- [ ] Implement rate limiting on quiz submissions
- [ ] Sanitize user input (XSS prevention)
- [ ] Validate with Zod on all mutation endpoints
- [x] Set up CORS if backend is separate from frontend

## 16. Testing

- [ ] Set up testing framework (Vitest or Jest)
- [ ] Write unit tests for utility functions
  - [ ] Password hashing/comparison
  - [ ] Slug generation
  - [ ] Progress calculation
  - [ ] Quiz grading logic
- [ ] Write API integration tests
  - [ ] Auth: signup, login, protected routes
  - [ ] CRUD: courses, lessons, quizzes
  - [ ] Enrollments: enroll, progress, certificates
  - [ ] Error cases: validation, 403, 404, duplicate records
- [ ] Write seed data test helper

## 17. Documentation

- [ ] Document all API routes in README or API docs
  - [ ] Method, path, auth required, role required
  - [ ] Request body schema (Zod or TypeScript types)
  - [ ] Response shape
- [ ] Add JSDoc / TSDoc comments to critical functions
- [ ] Document environment variables needed

## 18. Deployment Prep

- [ ] Create production migration script
- [ ] Add database indexing for common queries
  - [ ] Index on Course.slug (unique)
  - [ ] Index on Enrollment.userId + Enrollment.courseId
  - [ ] Index on Lesson.courseId + Lesson.order
  - [ ] Full-text search index (if using tsvector)
- [ ] Set up connection pooling for production DB
- [ ] Configure logging (pino or winston)
- [ ] Set up error monitoring (Sentry)
