import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, projectTitle, targetWeekCount = 6 } = await req.json();

    const generatedMilestones = [
      { title: 'Sprint 1: Architecture Scoping & Vector DBMS Initialization', days: 7 },
      { title: 'Sprint 2: Train & Test Innovation Scoring LangChain Micro-Agent', days: 14 },
      { title: 'Sprint 3: Build GitHub Webhook Listener & Commit Velocity Analyzer', days: 21 },
      { title: 'Sprint 4: Implement SSE Token Streaming in Copilot Dock UI', days: 28 },
      { title: 'Sprint 5: Execute Automated QA & Stress Test Redis Background Queue', days: 35 },
      { title: 'Sprint 6: Finalize Academic Defense Docs & AWS Cloud Deployment', days: 42 },
    ];

    let created = [];
    if (projectId) {
      for (const m of generatedMilestones) {
        try {
          const res = await db.milestone.create({
            data: {
              projectId,
              title: m.title,
              isCompleted: false,
              dueDate: new Date(Date.now() + m.days * 86400000),
            },
          });
          created.push(res);
        } catch {
          // Continue if duplicate or DB error
        }
      }
    } else {
      created = generatedMilestones.map((m, idx) => ({ id: `gen-${idx}`, title: m.title, isCompleted: false }));
    }

    return NextResponse.json({
      milestones: created,
      message: `Generated ${created.length} structured milestones for project roadmap.`,
    }, { status: 200 });
  } catch (error) {
    console.error('Project Planner AI Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize roadmap' }, { status: 500 });
  }
}
