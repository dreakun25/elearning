# Frontend TODOs

## 1. Project Setup & Configuration

- [x] Initialize Next.js with TypeScript (App Router)
- [x] Configure Tailwind CSS v4 (PostCSS plugin, `@import "tailwindcss"`)
- [x] Configure TypeScript (strict mode, `@/*` path alias → `./src/*`)
- [x] Configure ESLint v9 (flat config with `eslint-config-next`)
- [x] Configure Prettier (via `eslint-config-prettier`)
- [x] Set up environment variables
  - [x] `DATABASE_URL` (Prisma Postgres for local dev)
  - [x] `AUTH_SECRET` (placeholder — needs real value)
  - [x] `BACKEND_URL` (Express backend at `http://localhost:4000`)
- [x] Install production dependencies
  - [x] `next`, `react`, `react-dom` — framework
  - [x] `next-auth` (v5 beta) — authentication
  - [x] `lucide-react` — icons
  - [x] `sonner` — toast notifications
  - [x] `react-hook-form` + `@hookform/resolvers` + `zod` — forms & validation
  - [x] `react-player` — video playback
  - [x] `@prisma/client` + `@auth/prisma-adapter` — database
- [x] Set up root layout (`src/app/layout.tsx`)
  - [x] Geist Sans + Geist Mono fonts (via `next/font/google`)
  - [x] `<Toaster richColors />` from sonner
  - [x] Global CSS with Tailwind v4 `@theme` directive
- [x] Create Prisma config (`prisma.config.ts`) and schema (`prisma/schema.prisma`)
  - [x] Generator output to `src/generated/prisma`
  - [x] PostgreSQL datasource from `DATABASE_URL`
- [ ] Generate Prisma client from backend schema (shared)
- [ ] Set up husky + lint-staged (already installed, needs config)

## 2. Authentication UI

- [x] Configure NextAuth v5 (`src/lib/auth.ts`)
  - [x] Credentials provider calling Express `POST /api/auth/login`
  - [x] Custom JWT encode/decode with `jose` (HS256, 7-day expiry)
  - [x] `jwt` callback stores userId (sub) + role in token
  - [x] `session` callback exposes userId + role to client
  - [x] Sign-in page set to `/login`
- [x] Create NextAuth route handler (`src/app/api/auth/[...nextauth]/route.ts`)
- [x] Create `apiFetch` backend bridge (`src/lib/api.ts`)
  - [x] Reads `authjs.session-token` cookie → `Authorization: Bearer <token>`
  - [x] Prepends `BACKEND_URL` to all requests
  - [x] Auto-sets `Content-Type: application/json` when body present
- [ ] Create login page (`/login`)
  - [ ] Email + password form with validation
  - [ ] Error state (invalid credentials)
  - [ ] Redirect post-login based on role (student → `/dashboard`, instructor → `/instructor`, admin → `/admin`)
  - [ ] Link to signup page
  - [ ] Styled to match mockup design (Learnify branding, purple accent)
- [ ] Create signup page (`/signup`)
  - [ ] Name, email, password, role (STUDENT / INSTRUCTOR) fields
  - [ ] Zod validation with react-hook-form
  - [ ] Error handling (duplicate email, validation errors)
  - [ ] Auto-login after successful signup
  - [ ] Link to login page
- [ ] Create password reset flow (optional)
- [ ] Add Google OAuth provider (optional)
- [ ] Add GitHub OAuth provider (optional)
- [ ] Create middleware (`src/middleware.ts`) for route protection
  - [ ] Redirect unauthenticated users to `/login`
  - [ ] Role-based redirects (non-admin → `/` from `/admin/*`)
- [ ] Test auth flows end-to-end (signup → login → session → protected routes)

## 3. Public Navigation & Layout

- [ ] Create shared navbar component (`src/components/navbar.tsx`)
  - [ ] Learnify logo linking to `/`
  - [ ] Nav links: Dashboard, Catalog, Certificates (based on mockup)
  - [ ] Conditional rendering based on auth state (login/signup vs user avatar dropdown)
  - [ ] Responsive (mobile hamburger menu)
- [ ] Create footer component (`src/components/footer.tsx`)
- [ ] Create public layout wrapper with navbar + footer
- [ ] Dark mode toggle (optional, CSS variables already set up)

## 4. Home / Landing Page

- [ ] Replace boilerplate `src/app/page.tsx` with proper landing page
  - [ ] Hero section with headline, CTA (Get Started / Browse Courses)
  - [ ] Featured courses grid (from `GET /api/courses?featured=true`)
  - [ ] Stats section (students, courses, instructors)
  - [ ] Call-to-action for instructors (Start Teaching)
  - [ ] Footer with links
- [ ] Design direction from `mockup/landing.html`

## 5. Admin Panel

- [x] Create admin layout with auth guard (`src/app/admin/layout.tsx`)
  - [x] Calls `auth()` → redirects to `/login` if no session
  - [x] Checks `role === 'ADMIN'` → redirects to `/` if not admin
  - [x] Renders `<AdminSidebar>` alongside page content
- [x] Create admin sidebar (`src/components/admin-sidebar.tsx`)
  - [x] Learnify brand logo
  - [x] Nav items: Dashboard, Users, Courses with lucide-react icons
  - [x] Active link highlighting via `usePathname()`
  - [x] "Back to Site" link at bottom
- [x] Create admin dashboard (`/admin`)
  - [x] Fetch `GET /api/admin/stats`
  - [x] Display 3 stat cards: Total Users, Courses, Enrollments
- [x] Create admin users page (`/admin/users`)
  - [x] Fetch `GET /api/admin/users` with search + pagination params
  - [x] Search form (GET-based, works without JS)
  - [x] Table: Name, Email, Role badge, Joined date, Actions
  - [x] Role dropdown (STUDENT / INSTRUCTOR / ADMIN) via `PATCH /api/admin/users/:id/role`
  - [x] Delete button with confirmation via `DELETE /api/admin/users/:id`
  - [x] Self-operation guard (cannot change own role or delete self)
  - [x] Pagination links (Previous / Next)
  - [x] Server actions with `revalidatePath('/admin/users')`
  - [x] Toast notifications (success / error) via sonner
- [x] Create admin courses page (`/admin/courses`)
  - [x] Fetch `GET /api/admin/courses` with search + pagination params
  - [x] Table: Title, Instructor, Status (Published/Draft), Lessons, Enrollments, Featured star, Price
  - [x] Featured toggle via `PATCH /api/admin/courses/:id/feature`
  - [x] Pagination links
  - [x] Server actions with `revalidatePath('/admin/courses')`
- [ ] Add CSV report download buttons (enrollments + revenue)
- [ ] Add course detail / edit modal or page (admin view)

## 6. Student Dashboard

- [ ] Create student dashboard layout (`/dashboard`)
- [ ] Fetch `GET /api/enrollments/mine` — current user's enrollments
- [ ] Display stats cards: Enrolled Courses, Completed Lessons, Streak, Certificates
- [ ] "Continue Learning" section with course progress bars
- [ ] Upcoming deadlines / quiz reminders
- [ ] Achievements / badges section
- [ ] Design direction from `mockup/dashboard.html`

## 7. Course Catalog / Browsing

- [ ] Create course catalog page (`/courses`)
  - [ ] Fetch `GET /api/courses` with pagination
  - [ ] Display course cards with: thumbnail, title, instructor, rating, price, level
  - [ ] Search by title
  - [ ] Filter by category, level, price range
  - [ ] Sort by newest, popular, top-rated
- [ ] Create course detail page (`/courses/[slug]`)
  - [ ] Fetch `GET /api/courses/:slug`
  - [ ] Course info: title, description, instructor, price, rating
  - [ ] Lessons list (ordered, published only)
  - [ ] Enroll button (free) or checkout (paid)
  - [ ] Review section: list reviews, add review (if enrolled)
  - [ ] User's enrollment status & progress (if authenticated)

## 8. Lesson Viewing / Video Player

- [ ] Create lesson viewer page (`/courses/[courseId]/lessons/[lessonId]`)
  - [ ] Fetch `GET /api/courses/:courseId/lessons/:lessonId`
  - [ ] Video player using `react-player`
  - [ ] Lesson content (rich text)
  - [ ] Mark complete button → `POST /api/courses/:courseId/lessons/:lessonId/progress`
  - [ ] Navigation: previous / next lesson
  - [ ] Lesson sidebar with course lesson list + completion status
- [ ] Design direction from `mockup/player.html` and `mockup/video-player.html`

## 9. Instructor Dashboard

- [ ] Create instructor layout with sidebar (`/instructor`)
  - [ ] Auth guard: requires INSTRUCTOR or ADMIN role
  - [ ] Sidebar nav: Dashboard, Courses, Students, Revenue, Reviews
- [ ] Create instructor dashboard (`/instructor`)
  - [ ] Stats cards: Total Courses, Total Students, Revenue, Average Rating
  - [ ] Recent enrollments list
- [ ] Create instructor courses page (`/instructor/courses`)
  - [ ] Fetch instructor's courses
  - [ ] Course cards with: title, status (published/draft), lesson count, enrollment count
  - [ ] Actions: edit, delete, toggle publish
  - [ ] "Create Course" button
- [ ] Create instructor course editor (`/instructor/courses/[id]/edit`)
  - [ ] Form fields: title, description, price, category, level, image
  - [ ] Slug auto-generation from title
  - [ ] Lessons management: create, reorder, edit, delete
  - [ ] Quiz management: create quiz, add/edit/delete questions
- [ ] Create instructor students page (`/instructor/courses/[id]/students`)
  - [ ] Fetch `GET /api/courses/:courseId/enrollments`
  - [ ] Table of enrolled students with progress
- [ ] Create instructor revenue page (`/instructor/revenue`)
- [ ] Design direction from `mockup/instructor-dashboard.html`

## 10. User Profile

- [ ] Create profile page (`/profile`)
  - [ ] Fetch `GET /api/users/me`
  - [ ] Display & edit: name, email, bio, avatar image
  - [ ] `PATCH /api/users/me` with Zod validation
- [ ] Create public profile page (`/users/[id]`)
  - [ ] Fetch `GET /api/users/:id`
  - [ ] Display name, bio, published courses

## 11. Enrollments & Progress

- [ ] Create enrollment flow
  - [ ] Enroll button on course detail page → `POST /api/courses/:courseId/enroll`
  - [ ] Handle free vs paid courses
  - [ ] Success → redirect to course lessons
- [ ] Create enrollment list page (`/my-courses`)
  - [ ] Fetch `GET /api/enrollments/mine`
  - [ ] Course cards with progress bars
  - [ ] Filter by in-progress / completed
- [ ] Create course progress view (within lesson viewer)
  - [ ] Lesson completion marking
  - [ ] Progress percentage calculation
  - [ ] Course completion flow → certificate trigger

## 12. Quizzes & Assessments

- [ ] Create quiz taking interface (within lesson viewer)
  - [ ] Fetch `GET /api/lessons/:lessonId/quiz` (questions without answers)
  - [ ] Question types: multiple choice, true/false, fill-in-blank
  - [ ] Submit answers → `POST /api/lessons/:lessonId/quiz/attempt`
  - [ ] Display score + correct/incorrect breakdown
  - [ ] Show explanations
- [ ] Create quiz attempt history view
  - [ ] Fetch `GET /api/lessons/:lessonId/quiz/attempts`
  - [ ] Table of past attempts with scores

## 13. Certificates

- [ ] Create certificate display page (`/certificates`)
  - [ ] Fetch `GET /api/certificates/mine`
  - [ ] Certificate cards with course name, date, download link
- [ ] Create certificate generation flow
  - [ ] Generate button on course completion
  - [ ] Display generated certificate
- [ ] Create public certificate verification page (`/certificates/verify/[id]`)

## 14. Reviews & Ratings

- [ ] Create review section on course detail page
  - [ ] List reviews (paginated)
  - [ ] Create review form (rating 1-5 stars + text)
  - [ ] Edit / delete own review
  - [ ] Rating summary: average, distribution, count

## 15. File Uploads

- [ ] Create image upload component (avatar, course thumbnail)
  - [ ] File type validation (jpg, png, webp)
  - [ ] Size validation (max 5MB)
  - [ ] Upload progress indicator
- [ ] Create video upload component (lesson video)
  - [ ] File type validation (mp4, webm)
  - [ ] Size validation (max 500MB)
  - [ ] Upload progress indicator

## 16. Search & Filtering UI

- [ ] Course search bar (global nav or catalog page)
- [ ] Filter controls: category, level, price range
- [ ] Sort controls: newest, popular, top-rated
- [ ] Responsive filter sidebar / dropdown

## 17. Responsive Design & UX

- [ ] Mobile-responsive layout for all pages
- [ ] Loading states (skeletons or spinners) for data fetching
- [ ] Empty states (no courses, no enrollments, etc.)
- [ ] Error states (API failures, network errors)
- [ ] 404 page (`not-found.tsx`)
- [ ] 500 error page (`error.tsx`)
- [ ] Form validation feedback (inline errors)
- [ ] Keyboard accessibility (focus management, ARIA labels)

## 18. Testing

- [ ] Set up testing framework (Vitest or Jest)
- [ ] Write unit tests
  - [ ] `apiFetch` helper
  - [ ] Auth utilities
  - [ ] Form validation schemas
- [ ] Write component tests
  - [ ] Admin sidebar (active link highlighting)
  - [ ] User actions (role change, delete)
  - [ ] Course actions (feature toggle)
- [ ] Write integration tests (playwright or cypress)
  - [ ] Auth flow: login, signup, protected routes
  - [ ] Admin flow: list users, change role, delete user
  - [ ] Course browsing: catalog, detail, enroll
  - [ ] Lesson viewing: video, quiz, progress

## 19. Documentation

- [x] Create admin pages presentation (`presentation/admin-pages.html`)
  - [x] Architecture overview (Server Component → apiFetch → Backend → Client → Action)
  - [x] File tree with all 9 admin files
  - [x] Route table + sidebar navigation
  - [x] Auth flow diagram (layout → session check → role check → render/redirect)
  - [x] Data flow pattern (3-layer: Server fetch, Client interact, Action mutate)
  - [x] Dashboard, Users, Courses page deep-dives
  - [x] Search & pagination pattern (URL-based, works without JS)
  - [x] Component relationship map
  - [x] Key architectural decisions table
- [ ] Document component API / props in README
- [ ] Document environment variables required
- [ ] Add setup instructions in README

## 20. Performance & Deployment

- [ ] Configure Next.js `next.config.ts` for production
  - [ ] Image optimization (remote patterns for course images)
  - [ ] Output tracing / standalone mode
- [ ] Set up connection pooling for production database
- [ ] Configure logging (pino or winston on backend)
- [ ] Add analytics (optional)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Build & deploy to Vercel / Docker
- [ ] Configure caching (ISR for course pages, CDN for assets)
- [ ] Lighthouse audit & performance optimization
