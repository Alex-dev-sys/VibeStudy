import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { leaveGroup } from '@/lib/supabase/groups';

/**
 * POST /api/groups/[id]/leave
 * Leave a group
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Authentication required' },
        { status: 401 }
      );
    }

    const groupId = params.id;

    const result = await leaveGroup(groupId, user.id);

    if (result.error) {
      // Handle specific errors
      if (result.error.message.includes('NOT_MEMBER')) {
        return NextResponse.json(
          { error: 'NOT_MEMBER: Not a member of this group' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json(
      { error: 'Failed to leave group' },
      { status: 500 }
    );
  }
}
