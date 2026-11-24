# MOOC Learning Platform

A free, self-paced MOOC-style Learning Management System built for zero-budget operation, mobile-first usability, and low-bandwidth connections.

## Features

- **Authentication & Roles:** Email/password signup, Google OAuth, password reset, protected routes, and `learner` / `admin` roles via Supabase Auth + Row Level Security (RLS).
- **Course Catalog & Landing Pages:** Fast Server Components with search, category filters, pagination, dynamic SEO metadata, syllabus view, prerequisites, and learner ratings & reviews.
- **Learning Player:** One-click free enrollment, tap-to-load `youtube-nocookie.com` embeds (saves mobile data), lesson text notes, Previous/Next navigation, progress tracking, drip-release schedules, and "Resume where you left off".
- **Learner Dashboard:** Enrolled courses, per-course progress bars, completed lesson counts, and a consecutive-day learning streak counter.
- **Auto-Graded Quizzes:** One question at a time, instant feedback with explanations, configurable passing scores, unlimited retakes, attempt history, and optional module locking until passed.
- **Verifiable PDF Certificates:** Auto-issued on completing all lessons and quizzes, downloadable as PDF (`pdf-lib`), with a public verification page at `/verify/[code]`.
- **Lesson Q&A Discussions:** Questions, threaded replies, upvotes, admin pin/delete moderation, and database-backed rate limiting.
- **Admin Area (`/admin`):** Create/edit/publish courses, modules, lessons (with drag-and-drop reordering), and quizzes, plus enrollment counts and lesson drop-off analytics (`/admin/analytics`).
- **Automated Emails:** Welcome email, course completion congratulations, and 3-day inactivity reminders via Resend + Supabase Scheduled Edge Function, with one-click unsubscribe (`/unsubscribe/[token]`).
- **UX & Performance:** Dark mode toggle, loading skeletons, error/404 pages, `next/image` optimization, keyboard skip links, `robots.txt`, and dynamic `sitemap.xml`.

## Tech Stack (100% Free Tiers)

- **Frontend / Full-Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS v4
- **Backend / Database / Auth:** Supabase (Postgres, Auth, Row Level Security, Edge Functions)
- **Videos:** Unlisted YouTube embeds (`youtube-nocookie.com`)
- **Certificates:** `pdf-lib` (server-side PDF generation)
- **Emails:** Resend + Supabase `pg_cron`
- **Hosting:** Vercel (Hobby / Free)

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── admin/                # Admin dashboard, course/quiz editors, drop-off analytics
│   │   ├── api/certificates/     # PDF certificate generator endpoint
│   │   ├── auth/                 # OAuth callback & signout routes
│   │   ├── courses/              # Catalog, course landing, learning player, quizzes
│   │   ├── dashboard/            # Learner dashboard & streak tracker
│   │   ├── login/ signup/ ...    # Auth & password reset pages
│   │   ├── privacy/ terms/       # Legal page templates
│   │   ├── unsubscribe/[token]/  # One-click email unsubscribe
│   │   └── verify/[code]/        # Public certificate verification
│   ├── components/               # Navbar, Footer, YouTubePlayer, QuizRunner, etc.
│   ├── lib/                      # Supabase clients, auth guards, streaks, drip/prereq helpers
│   └── middleware.ts             # Session refresh & protected route redirects
├── supabase/
│   ├── 01_schema.sql             # Core tables, triggers, and RLS policies
│   ├── 02_course_catalog_updates.sql
│   ├── 03_quiz_gating_and_seed.sql
│   ├── 04_discussion_enhancements.sql
│   ├── 05_email_notifications.sql
│   ├── 06_security_hardening.sql
│   ├── 07_growth_features.sql
│   └── functions/send-emails/    # Scheduled Resend Edge Function
└── .env.local.example            # Environment variable template
```

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and paste your Supabase keys from **Supabase → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

Open **Supabase → SQL Editor** and run the SQL files in order (`01` through `07`):

1. `supabase/01_schema.sql`
2. `supabase/02_course_catalog_updates.sql`
3. `supabase/03_quiz_gating_and_seed.sql`
4. `supabase/04_discussion_enhancements.sql`
5. `supabase/05_email_notifications.sql`
6. `supabase/06_security_hardening.sql`
7. `supabase/07_growth_features.sql`

### 4. Configure Supabase Auth URLs

In **Supabase → Authentication → URL Configuration**:
- Set **Site URL** to `http://localhost:3000` (update to your Vercel domain in production).
- Add `http://localhost:3000/auth/callback` (and `https://YOUR-DOMAIN/auth/callback`) under **Redirect URLs**.

### 5. Run Locally & Promote Yourself to Admin

```bash
npm run dev
```

1. Open `http://localhost:3000/signup` and create your account.
2. Promote your account to `admin` in **Supabase → SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

## Deploying to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in **Project Settings → Environment Variables**.
4. Deploy!

## Scheduled Emails (Optional — Resend + Supabase Edge Functions)

```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase secrets set RESEND_API_KEY=re_YOUR_KEY
npx supabase secrets set RESEND_FROM_EMAIL="MOOC Platform <onboarding@resend.dev>"
npx supabase secrets set APP_URL=https://YOUR-VERCEL-APP.vercel.app
npx supabase secrets set CRON_SECRET=your-long-random-secret
npx supabase functions deploy send-emails --no-verify-jwt
```

Then enable `pg_cron` and `pg_net` in **Supabase → Database → Extensions** and schedule daily calls to `https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-emails` with header `x-cron-secret`.

## Scripts

- `npm run dev` — Start local development server
- `npm run build` — Build for production
- `npm run start` — Start production server
