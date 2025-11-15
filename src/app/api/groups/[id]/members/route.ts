import { NextResponse } from 'next/server';
import { fetchGroupMembers } from '@/lib/supabase/groups';

/**
 * GET /api/groups/[id]/members
 * Fetch members of a group
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;

    const result = await fetchGroupMembers(groupId);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ members: result.data || [] });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
