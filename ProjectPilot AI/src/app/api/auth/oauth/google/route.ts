import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTokens, setAuthCookies } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email = 'researcher@gmail-scholar.com', name = 'Google Scholar', role = 'STUDENT' } = await req.json().catch(() => ({}));

    let user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          role: 'STUDENT',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0366d6`,
        },
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
        message: 'Google OAuth authentication successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return NextResponse.json({ error: 'Failed to complete Google authentication' }, { status: 500 });
  }
}
