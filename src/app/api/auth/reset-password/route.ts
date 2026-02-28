import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-service';
import { verifyTurnstileToken } from '@/lib/utils/turnstile';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional(),
});

// POST /api/auth/reset-password
// Handles password reset requests with Turnstile verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = resetPasswordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { email, turnstileToken } = parsed.data;

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

    // Do NOT call recovery here to avoid double-hitting Supabase rate limit.
    // This endpoint's sole purpose is CAPTCHA verification. The client will
    // call supabase.auth.resetPasswordForEmail once this returns 200.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/auth/reset-password:', error);
    // Return success to prevent email enumeration
    return NextResponse.json({ 
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  }
}

