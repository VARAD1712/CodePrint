import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Simulate tokenized link transmission via SendGrid/Resend as per spec
    const simulatedToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const verificationUrl = `http://localhost:3000/verify-email?token=${simulatedToken}&email=${encodeURIComponent(email)}`;

    console.log(`[SendGrid/Resend Simulation] Password reset link generated for ${email}: ${verificationUrl}`);

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a verification link has been transmitted.',
        simulatedUrl: verificationUrl, // Returned in dev for easy QA validation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred processing your request' }, { status: 500 });
  }
}
