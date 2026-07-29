import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access attempt' }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: { userId: user.id },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        documents: { orderBy: { id: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // We do NOT inject dummy artificial AI demo data.
    // If projects array is empty, the client UI will display an intuitive interactive creation form for the student to build their real project.
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Projects GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve project workspace data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access attempt' }, { status: 401 });
    }

    const { title, description, githubRepo = null, status = 'IDEATION' } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Project title and description/problem statement are required' }, { status: 400 });
    }

    // Create authentic user-driven project without pre-populated mock milestones or fake AI ratings
    const project = await db.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        githubRepo: githubRepo ? githubRepo.trim() : null,
        status,
        innovationScore: 0, // Starts at 0 until the student explicitly triggers an AI architectural evaluation
        userId: user.id,
      },
      include: { milestones: true, documents: true },
    });

    return NextResponse.json({ project, message: 'Real student project workspace created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Projects POST Error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
