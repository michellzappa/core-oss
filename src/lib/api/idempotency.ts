import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleSupabaseClient } from "@/lib/supabase-service-role";

const IDEMPOTENCY_HEADER = "idempotency-key";
const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

type StoredIdempotentResponse = {
  v: 1;
  status: number;
  body: unknown;
};

function getScopedKeyHash(request: NextRequest, scope: string): string | null {
  const key = request.headers.get(IDEMPOTENCY_HEADER)?.trim();
  if (!key) return null;
  return createHash("sha256").update(`${scope}:${key}`).digest("hex");
}

export async function getIdempotentResponse(
  request: NextRequest,
  scope: string,
): Promise<NextResponse | null> {
  const keyHash = getScopedKeyHash(request, scope);
  if (!keyHash) return null;

  try {
    const supabase = await createServiceRoleSupabaseClient() as any;
    const { data, error } = await supabase
      .from("idempotency_keys")
      .select("response_data")
      .eq("key_hash", keyHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data?.response_data) {
      return null;
    }

    const responseData = data.response_data as unknown;
    if (
      responseData &&
      typeof responseData === "object" &&
      "v" in responseData &&
      "status" in responseData &&
      "body" in responseData
    ) {
      const stored = responseData as StoredIdempotentResponse;
      return NextResponse.json(stored.body, { status: stored.status });
    }

    // Backward-compatible fallback for older unversioned payloads.
    return NextResponse.json(responseData);
  } catch {
    return null;
  }
}

export async function storeIdempotentResponse(
  request: NextRequest,
  scope: string,
  body: unknown,
  status: number,
): Promise<void> {
  const keyHash = getScopedKeyHash(request, scope);
  if (!keyHash || status < 200 || status >= 300) return;

  try {
    const supabase = await createServiceRoleSupabaseClient() as any;
    const responseData: StoredIdempotentResponse = { v: 1, status, body };
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_WINDOW_MS).toISOString();

    await supabase.from("idempotency_keys").upsert(
      {
        key_hash: keyHash,
        response_data: responseData,
        expires_at: expiresAt,
      },
      { onConflict: "key_hash" },
    );
  } catch {
    // Fail open: requests should succeed even if idempotency storage fails.
  }
}
