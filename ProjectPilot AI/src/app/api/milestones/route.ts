import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, title, dueDate = null } = await req.json();
    if (!projectId || !title) {
      return NextResponse.json({ error: 'Project ID and milestone title required' }, { status: 400 });
    }

    const milestone = await db.milestone.create({
      data: {
        projectId,
        title,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 10 * 86400000),
        isCompleted: false,
      },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Milestone POST Error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, isCompleted, title } = await req.json();
    if (!id) return NextResponse.json({ error: 'Milestone ID required' }, { status: 400 });

    const milestone = await db.milestone.update({
      where: { id },
      data: {
        ...(isCompleted !== undefined ? { isCompleted } : {}),
        ...(title ? { title } : {}),
      },
    });

    return NextResponse.json({ milestone }, { status: 200 });
  } catch (error) {
    console.error('Milestone PUT Error:', error);
    return NextResponse.json({ error: 'Failed to modify milestone' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Milestone ID required' }, { status: 400 });

    await db.milestone.delete({ where: { id } });
    return NextResponse.json({ message: 'Milestone deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Milestone DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to remove milestone' }, { status: 500 });
  }
}
