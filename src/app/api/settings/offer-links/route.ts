import { NextRequest, NextResponse } from 'next/server';
import { offerLinkPresetService, type SettingsOfferLinkPreset } from '@/lib/api/settings';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await offerLinkPresetService.getAll();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const payload: Omit<SettingsOfferLinkPreset, 'id' | 'created_at' | 'updated_at'> = {
      title: String(body.title || '').trim(),
      url: String(body.url || '').trim(),
      icon: body.icon ? String(body.icon) : null,
      is_active: Boolean(body.is_active ?? true),
      is_default: Boolean(body.is_default ?? false),
    };
    const created = await offerLinkPresetService.create(payload);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


