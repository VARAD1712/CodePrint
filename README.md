# Codeprint

**Every developer leaves a trace. We read it.**

Codeprint is an AI-powered technical portfolio, developer verification, and tech recruitment platform that bridges students and hiring companies through data-driven skill assessment. Instead of relying on self-reported resumes, Codeprint analyzes real signals — GitHub activity, project architecture, presentation skills, and interview performance — to generate an objective **Talent Score** for every candidate.

🔗 Live demo: [code-print.vercel.app](https://code-print.vercel.app/)

---

## The Problem

Hiring pipelines today are built on resumes and self-reported claims that are easy to embellish and hard to verify. Recruiters spend hours screening candidates with no reliable signal of actual technical ability, and strong developers with thin resumes get filtered out before they're ever seen.

Codeprint addresses this with a shared **Candidate Object** — a single data pipeline that every module reads from — combining GitHub productivity data, AI-analyzed project submissions, and verification checks into one trustworthy profile.

## Core Modules

| Module | Description |
|---|---|
| **Candidate Intelligence Platform** | Aggregates GitHub activity, project history, and skill signals into a unified developer profile |
| **AI Recruitment Platform** | Lets recruiters discover and match candidates using AI-driven scoring instead of keyword search |
| **AI Assessment & Verification System** | Runs technical assessments and cross-checks claims against real evidence |
| **AI PPT Analyzer & Presentation Intelligence** | Evaluates pitch decks and presentations for clarity, structure, and communication skill |
| **Hackathon-to-Hiring Pipeline** | Scores hackathon projects for innovation and surfaces top performers directly to recruiters |
| **Trust & Fraud Prevention System** | Flags mismatches between claimed experience and verifiable activity (e.g. a resume claiming 5 years of Python when GitHub shows 3 months) |

The PPT Analyzer and Fraud/Authenticity Score are built as flagship, deep features; the remaining modules are functional but intentionally lighter in scope.

## Who It's For

**Students / Developers**
- GitHub-derived Talent Score
- AI-generated career guidance and roadmapping
- AI-driven mock interviews and assessments
- Dynamic, auto-generated portfolio and resume builder

**Companies / Recruiters**
- Candidate discovery with AI match scoring
- Pitch/video analysis for soft-skill signal
- Fraud and integrity detection on incoming applications
- Company branding pages
- Search for any candidate by GitHub/LinkedIn URL or username, with instant AI profile analysis and one-click hire
- Saved searches with alerts for candidates matching a target profile (e.g. "React + GenAI")
- Side-by-side candidate comparison with Talent Score breakdowns
- One-click, shareable PDF talent reports

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Framer Motion
- Lucide React (icons)

**Backend**
- Node.js + Express
- Supabase / PostgreSQL — Row Level Security, real-time application tracking
- Firebase Authentication

**AI & External APIs**
- OpenAI SDK — summarization, interview transcript rating, career roadmapping
- GitHub REST API (via Axios) — repository and activity analysis
- Manus, Perplexity — supplementary AI/data enrichment

## Project Structure

```
src/
  pages/
    StudentHome.tsx          # Student dashboard
    Profile.tsx               # Candidate profile view
    Projects.tsx              # Project/portfolio management
    CompanyDashboard.tsx       # Recruiter dashboard
    ...                        # Interview evaluation pages
  components/
    ScoreRing/                # Talent Score visualizations
    NavShell/                 # Navigation shells
    AssessmentModal/          # Assessment flows
    GitHubStatsWidget/        # GitHub activity widgets
supabase/
  schema.sql                  # user profiles, recruitments, applications,
                               # notifications, interviews, pitch evaluations
package.json                  # concurrent Vite + backend dev script
```

## Application Pipeline

1. Candidate submits an application; resume is validated
2. Application record is inserted with status `submitted`
3. Resume is uploaded to storage
4. Confirmation email sent to the student
5. Recruiter notified by email
6. Recruiter's application count updated in real time

## Getting Started

```bash
# clone the repository
git clone <repo-url>
cd codeprint

# install dependencies
npm install

# run frontend + backend concurrently
npm run dev
```

You'll need environment variables for Supabase, Firebase Authentication, and the OpenAI API to run the full stack locally.

## Roadmap

- Deeper fraud/authenticity scoring across more data sources
- Expanded hackathon-to-hiring pipeline with recruiter-facing leaderboards
- Richer AI interview agent
- Full company branding and career-guidance modules

---

*Codeprint — verifying developer talent through evidence, not claims.*


📁 Key Project Files
CodePrint-main/
├── src/
│   ├── pages/
│   │   ├── company/
│   │   │   ├── ResumeScreening.tsx      # AI Resume Screening & Job Creation UI
│   │   │   ├── CompanyDashboard.tsx     # Recruiter Command Console
│   │   │   ├── CompanyApplicants.tsx    # ATS Kanban & Application Pipeline
│   │   │   ├── CandidateDiscovery.tsx   # Recruiter Copilot Search
│   │   │   └── PitchAnalysis.tsx        # Pitch Deck Analyzer
│   │   ├── student/                     # Student-facing pages (Career, Interview, etc.)
│   │   ├── Landing.tsx                  # Public Landing Page
│   │   └── Dashboard.tsx                # Student Dashboard
│   ├── services/
│   │   ├── apiClient.ts                 # Axios instance with JWT interceptors
│   │   └── supabase.ts                  # Supabase client setup
│   └── App.tsx                          # Core React router & role-based view routing
├── server/
│   ├── index.js                         # Express backend API routes (Resumes, Jobs, OpenAI, Matching)
│   └── uploads/                         # Storage directory for uploaded resumes & pitch decks
├── supabase/
│   ├── schema.sql                       # Complete Postgres schema (resumes, job_postings, matches, pgvector)
│   └── migrations/                      # Incremental SQL migration scripts
└── package.json
