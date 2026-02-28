import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/offers/[id]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await (supabase as any)
      .from('offers')
      .update({
        is_accepted: true,
        updated_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to accept offer' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error accepting offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
