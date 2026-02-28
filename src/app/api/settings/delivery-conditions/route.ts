import { NextRequest, NextResponse } from 'next/server';
import { deliveryConditionService, type SettingsDeliveryCondition } from '@/lib/api/settings';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await deliveryConditionService.getAll();
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
    const payload: Omit<SettingsDeliveryCondition, 'id' | 'created_at' | 'updated_at'> = {
      title: String(body.title || '').trim(),
      description: String(body.description || '').trim(),
      is_active: Boolean(body.is_active ?? true),
      is_default: Boolean(body.is_default ?? false),
    };
    const created = await deliveryConditionService.create(payload);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


