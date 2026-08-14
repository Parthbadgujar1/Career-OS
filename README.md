# Career OS

An AI-powered career preparation and placement readiness platform for students — from Day 1 to Placement.

## Features

- **Onboarding & skill assessment** — aptitude practice with instant scoring
- **AI-powered roadmap** — personalized placement preparation plan
- **Resume builder** — build and get an ATS review of your resume
- **Placement readiness score** — live breakdown across skills, resume, and practice
- **Opportunities tracker** — browse openings and track viewing/application progress
- **Events & registrations** — career webinars and workshops
- **Mentor dashboard** — skill-gap overview and interventions
- **Streaks & progress tracking** — keep your momentum going

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, React 19)
- [Prisma 7](https://prisma.io) + SQLite
- [NextAuth.js v5](https://next-auth.js.org) (credentials, JWT)
- [AI SDK 7](https://sdk.vercel.ai)
- [Tailwind CSS 4](https://tailwindcss.com)

## Getting Started

```bash
npm install
cp .env.example .env   # fill in AUTH_SECRET, optionally GEMINI_API_KEY
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role   | Email                 | Password   |
| ------ | --------------------- | ---------- |
| Student| student@carrer.com    | student123 |
| Admin  | admin@carrer.com      | admin123   |
| Mentor | mentor@carrer.com     | mentor123  |

## Environment Variables

| Variable        | Required | Purpose                              |
| --------------- | -------- | ------------------------------------ |
| `DATABASE_URL`  | yes      | SQLite/Postgres connection string    |
| `AUTH_SECRET`   | yes      | NextAuth session signing secret      |
| `AUTH_URL`      | local    | Base URL of the app                  |
| `GEMINI_API_KEY`| no       | AI features (has deterministic fallbacks) |
