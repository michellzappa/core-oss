/**
 * Verify a Turnstile token with Cloudflare
 * Returns true if verification succeeds, false otherwise
 * Gracefully handles missing configuration (returns true if Turnstile not configured)
 */
export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  // If no token provided, fail verification
  if (!token) {
    return false;
  }

  // If Turnstile is not configured, skip verification (graceful degradation)
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn('Turnstile not configured - skipping verification');
    return true;
  }

  try {
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const verification = await verifyResponse.json();
    return verification?.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    // On error, fail verification for security
    return false;
  }
}

/**
 * Check if Turnstile is configured (has site key)
 */
export function isTurnstileConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

