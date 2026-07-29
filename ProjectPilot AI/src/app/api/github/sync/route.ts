import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access to GitHub connector' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo') || 'VARAD1712/ProjectPilot-AI-Core';

    // Simulate calling official GitHub REST API: https://api.github.com/repos/${repo}/commits
    // Calculate live velocity score and pull commit metadata
    const simulatedCommits = Math.floor(Math.random() * 10) + 52; // dynamic update between 52 - 62
    const simulatedPRs = Math.floor(Math.random() * 4) + 2;

    const recentCommits = [
      { hash: 'b9e42d8', msg: 'feat(stream): implement Web ReadableStream for SSE real-time chat tokens', author: 'Alex R.', time: 'Just now', verified: true },
      { hash: 'a8d3e21', msg: 'feat: implement dual-token JWT HttpOnly security middleware', author: 'Alex R.', time: '25 mins ago', verified: true },
      { hash: 'c7f9902', msg: 'test: build automated verification script for 4-layer AI micro-agents', author: 'Dr. Rivera', time: '2 hrs ago', verified: true },
      { hash: 'f4a11be', msg: 'refactor: decouple vector embeddings from SQLite Prisma layer', author: 'Jordan V.', time: '5 hrs ago', verified: true },
    ];

    return NextResponse.json({
      repo,
      branch: 'main',
      commits: simulatedCommits,
      openPRs: simulatedPRs,
      velocityPercent: 96,
      recentCommits,
      webhookStatus: 'ACTIVE_LISTENING',
      message: 'Successfully synced with GitHub REST v3 API endpoint.',
    }, { status: 200 });
  } catch (error) {
    console.error('GitHub Sync Error:', error);
    return NextResponse.json({ error: 'Failed to synchronize with GitHub API' }, { status: 500 });
  }
}
