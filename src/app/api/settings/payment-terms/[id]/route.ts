import { NextRequest, NextResponse } from 'next/server';
import { paymentTermService, type SettingsPaymentTerm } from '@/lib/api/settings';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const payload: Partial<SettingsPaymentTerm> = {
      title: String(body.title || '').trim(),
      description: String(body.description || '').trim(),
      is_active: Boolean(body.is_active ?? true),
      is_default: Boolean(body.is_default ?? false),
    };
    const updated = await paymentTermService.update(id, payload);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await paymentTermService.delete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


