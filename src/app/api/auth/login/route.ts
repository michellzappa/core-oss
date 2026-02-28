import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/utils/turnstile';
import { z } from 'zod';

const loginSchema = z.object({
  turnstileToken: z.string().optional(),
});

// POST /api/auth/login
// Verifies Turnstile token before allowing login
// Client will handle actual Supabase authentication after verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { turnstileToken } = parsed.data;

    // Verify Turnstile token if Turnstile is configured
    const turnstileRequired = process.env.TURNSTILE_SECRET_KEY !== undefined;
    if (turnstileRequired) {
      const isValid = await verifyTurnstileToken(turnstileToken);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Verification failed. Please complete the security check.' },
          { status: 403 }
        );
      }
    }

    // Return success - client will proceed with Supabase auth
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

