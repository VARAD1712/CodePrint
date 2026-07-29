import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTokens, setAuthCookies } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email = 'student@github-dev.io', name = 'GitHub Scholar', role = 'STUDENT', githubUsername = 'projectpilot-scholar' } = await req.json().catch(() => ({}));

    let user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          role: 'STUDENT',
          githubToken: `ghp_mock_token_for_${githubUsername}`,
          avatarUrl: `https://avatars.githubusercontent.com/u/9919 ?v=4`,
        },
      });
    } else if (!user.githubToken) {
      user = await db.user.update({
        where: { id: user.id },
        data: { githubToken: `ghp_mock_token_for_${githubUsername}` },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        message: 'GitHub OAuth authentication successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    return NextResponse.json({ error: 'Failed to complete GitHub authentication' }, { status: 500 });
  }
}
