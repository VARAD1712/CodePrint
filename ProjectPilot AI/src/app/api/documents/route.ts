import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

    const documents = await db.document.findMany({
      where: { projectId },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Documents GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, type = 'RESEARCH_PAPER', title, summary, url = null } = await req.json();

    if (!projectId || !title || !summary) {
      return NextResponse.json({ error: 'projectId, title, and summary required' }, { status: 400 });
    }

    const document = await db.document.create({
      data: {
        projectId,
        type,
        title,
        summary,
        url,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Documents POST Error:', error);
    return NextResponse.json({ error: 'Failed to add research document' }, { status: 500 });
  }
}
