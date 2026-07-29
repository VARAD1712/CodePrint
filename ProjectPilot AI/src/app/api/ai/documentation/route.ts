import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectTitle, description } = await req.json();

    const readmeContent = `# ${projectTitle || 'ProjectPilot AI Workspace'}

## Executive Architecture Summary
${description || 'High-performance AI innovation appraisal platform decoupling React Next.js frontend rendering from background LangChain & vector indexing workloads.'}

## Tech Stack & Core Dependencies
- **Frontend Engine**: React, Next.js 15+ (App Router), Vanilla CSS + Tailwind tokens, Lucide Icons
- **Database & Vectors**: PostgreSQL / SQLite via Prisma ORM 6.x, pgvector ready
- **Authentication**: Dual-token JWT security (15-min Access Token + 7-day HttpOnly SameSite=Strict Refresh Cookie)
- **Real-Time Intelligence**: Server-Sent Events (SSE) streaming chat & GitHub REST commit WebHooks

## Automated Setup Instructions
\`\`\`bash
# Install exact dependencies
npm install
# Sync relational SQLite/PostgreSQL schema
npx prisma db push
# Launch full-stack developer vault
npm run dev
\`\`\`

---
*Synthesized automatically by ProjectPilot Layer 4 AI Documentation Micro-Agent.*`;

    return NextResponse.json({ readme: readmeContent, format: 'markdown' }, { status: 200 });
  } catch (error) {
    console.error('AI Documentation Error:', error);
    return NextResponse.json({ error: 'Failed to compile technical documentation' }, { status: 500 });
  }
}
