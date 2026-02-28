import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/offers/[id]/share-stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offerId = id;
    
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all share links for this offer with their view stats
    const { data: shareLinks, error } = await supabase
      .from('offer_access_logs' as any)
      .select('*')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching share links:', error);
      return NextResponse.json({ error: 'Failed to fetch share links' }, { status: 500 });
    }

    // Add base URL to each link
    const linksWithUrls = (shareLinks as any[] || []).map((link: any) => ({
      ...link,
      fullUrl: `${request.nextUrl.origin}/offers/view/${link.offer_id}`
    }));
    
    return NextResponse.json(linksWithUrls);
  } catch (error) {
    console.error(`Error in GET /api/offers/[id]/share-stats:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 