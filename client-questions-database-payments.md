# E-Learning Platform — Client Questions, Database Suggestions & Payment Processing

---

## Section 1: Questions to Ask the Client (Requirement 1 — Requirements & Planning)

Based on the project plan's "Requirements & Planning" section, here are questions to clarify with the client:

### Target Audience & Purpose
1. Who is the primary target audience — students (K-12, university), working professionals, or internal company training?
2. Will the platform serve a single institution/organization or be open to the public?
3. What languages should the platform support? (Greek, English, both?)
4. Should the platform focus on a specific subject domain (e.g., tech, languages, sciences) or be general-purpose?
5. Is this for profit (selling courses) or non-profit (free educational content)?

### Core Features
6. Do you need real-time/live sessions (e.g., Zoom integration) or is everything pre-recorded?
7. Should quizzes be auto-graded or manually graded by instructors?
8. Do you want certificates to be auto-generated upon completion? Should they be verifiable online?
9. Is a discussion forum or Q&A section needed per course?
10. Do you need gamification features (badges, leaderboards, points)?
11. Should instructors be able to upload their own courses, or will admins create all content?
12. Do you need a mobile app, or is a responsive web app sufficient?

### Branding & Design
13. Do you have a preferred name and logo, or should we brainstorm?
14. Do you have brand colors, fonts, or design guidelines?
15. Do you have any competitor platforms you like and want to reference?

### User Roles
16. Should we have additional roles beyond Student, Instructor, Admin (e.g., Moderator, Content Reviewer)?
17. Should instructors be vetted/approved before publishing courses?

### User Stories & Wireframes
18. Do you want me to create wireframes, or do you have existing mockups?
19. Can you describe the most important user journey (e.g., student discovering → enrolling → learning → getting certified)?

### Monetization
20. Are courses free, paid, or a mix? If paid, what pricing model (one-time, subscription, bundle)?
21. Will instructors receive a revenue share? What percentage?
22. Do you need coupon/discount functionality?
23. Should there be a free trial period for courses?

---

## Section 2: Online Database Suggestions

Based on the schema in the project plan (User, Course, Lesson, Enrollment, Quiz, Payment, Certificate, etc.), here are database recommendations:

### Recommended Options (Relational — Best for E-Learning)

| Database | Pros | Cons | Best For |
|----------|------|------|----------|
| **PostgreSQL (via Supabase)** | Free tier, real-time, auth included, managed, generous limits | Vendor lock-in for advanced features | **Best overall choice** — great for e-learning |
| **PostgreSQL (via Neon)** | Serverless, branching for dev, free tier | Newer platform, fewer integrations | Serverless apps, dev teams |
| **PostgreSQL (via Railway)** | Simple deployment, good for full-stack | Smaller free tier | All-in-one deployment |
| **MySQL (via PlanetScale)** | Serverless, branching, generous free tier | No foreign keys in free tier | Scaling apps |
| **SQLite (via Turso)** | Edge-ready, ultra-fast reads | Limited concurrency, niche | Small projects, edge functions |

### Recommended: Supabase (PostgreSQL)

**Why Supabase is ideal for this e-learning platform:**
- **Managed PostgreSQL** — relational schema fits perfectly with courses/lessons/enrollments
- **Built-in Auth** — covers email/password, OAuth (Google, GitHub), row-level security
- **Real-time** — useful for live progress tracking and notifications
- **Storage** — can host course images/videos directly
- **Generous Free Tier** — 500 MB database, 1 GB storage, 50 MB bandwidth
- **Greek data centers** — available via AWS Europe regions (Frankfurt, Paris, Milan)

### Estimated Storage Needs

| Data Type | Estimated Size per 100 Students |
|-----------|-------------------------------|
| User data | ~1 MB |
| Course metadata (10 courses) | ~5 MB |
| Enrollments & progress | ~2 MB |
| Quiz data | ~3 MB |
| Payments | ~1 MB |
| Certificates (text only) | ~0.5 MB |
| **Total (relational data)** | **~12-15 MB** |
| Video/image storage | **100 MB – 10 GB** (depends on content) |

Supabase free tier (500 MB) is more than enough for the relational data of a small-to-medium platform.

---

## Section 3: Payment Processing in Greece

### Overview

Greece is part of the **Single Euro Payments Area (SEPA)** and the **EU**, so European payment regulations apply (PSD2, SCA, GDPR). Here are the viable options:

### Recommended: Stripe

**Why Stripe is the best choice for Greece:**
- **Fully supported in Greece** — Greek companies can create Stripe accounts
- **SEPA Direct Debit** — popular in Greece for recurring payments
- **Credit/Debit Cards** — Visa, Mastercard, Maestro (most used in Greece)
- **Apple Pay & Google Pay** — supported
- **Greek bank payouts** — Stripe can payout to Greek bank accounts (IBAN)
- **Strong Customer Authentication (SCA)** — Stripe handles 3D Secure 2 automatically (required by EU PSD2)
- **Localized** — supports Greek language checkout
- **Tax handling** — Stripe Tax can calculate Greek VAT (ΦΠΑ, 24% standard rate)
- **Pricing** — 2.9% + €0.25 per transaction (standard EU rate)

### Alternative Options

| Provider | Greek Support | Notes |
|----------|--------------|-------|
| **Stripe** | ✅ Full | Best overall — cards, SEPA, Apple/Google Pay, 3D Secure |
| **PayPal** | ✅ Supported | Higher fees (~3.49% + €0.35), fewer EU-specific features |
| **Viva Wallet** | ✅ Greek company | Based in Greece, good local support, lower Greek rates |
| **Alpha Bank / National Bank e-Commerce** | ✅ Local banks | Direct bank integrations, but more complex setup |
| **Lemon Squeezy** | ⚠️ Limited | Uses Stripe under the hood, handles EU VAT for you (MPP) |
| **Paddle** | ⚠️ Limited | Similar to Lemon Squeezy, but fewer Greek-specific features |

### Greek VAT (ΦΠΑ) Considerations

- **Standard VAT rate**: 24% (for digital services/products)
- **Reduced rates**: 13% (some educational services), 6% (certain goods)
- **EU Digital Services VAT**: If selling to EU consumers outside Greece, you may need to register under **OSS (One-Stop Shop)** or use a **Merchant of Record (MoR)** like Lemon Squeezy
- **B2B vs B2C**: Different invoicing rules apply

### Recommended Payment Flow for Greek Market

```
User clicks "Enroll"
        ↓
Stripe Checkout Session created
  → Amount in EUR (€)
  → Description includes course details
  → Metadata links to course_id, user_id
        ↓
User completes payment (card / SEPA / Apple Pay)
  → Stripe handles 3D Secure (SCA compliance)
        ↓
Stripe webhook → your backend
  → Verify event signature
  → Create Enrollment record
  → Send confirmation email
        ↓
User gains access to course
```

### Summary: Full Recommended Stack for Greece

| Concern | Recommendation |
|---------|---------------|
| **Payment processor** | Stripe |
| **Currency** | EUR (€) |
| **Auth** | 3D Secure via Stripe (PSD2 compliant) |
| **VAT handling** | Stripe Tax OR Merchant of Record (Lemon Squeezy) |
| **Payouts** | Stripe → Greek IBAN (weekly automatic) |
| **Refunds** | Stripe Dashboard or API (full/partial) |
| **Local bank alternative** | Viva Wallet (Greek company, lower rates) |

---

*Compiled from the e-learning project plan at: https://github.com/dreakun25/elearning/blob/main/project-plan.md*
