import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/api/contacts';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/contacts
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');
    
    // Get contacts based on filters
    let contacts;
    if (organizationId) {
      contacts = await contactService.getByOrganizationId(organizationId);
    } else {
      contacts = await contactService.getAll();
    }
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error in GET /api/contacts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 