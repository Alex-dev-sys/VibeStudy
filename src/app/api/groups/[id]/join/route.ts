import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { joinGroup } from '@/lib/supabase/groups';

/**
 * POST /api/groups/[id]/join
 * Join a group
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

    const result = await joinGroup(groupId, user.id);

    if (result.error) {
      // Handle specific errors
      if (result.error.message.includes('MAX_GROUPS_JOINED')) {
        return NextResponse.json(
          { error: 'MAX_GROUPS_JOINED: You can join maximum 10 groups' },
          { status: 400 }
        );
      }

      if (result.error.message.includes('ALREADY_MEMBER')) {
        return NextResponse.json(
          { error: 'ALREADY_MEMBER: Already a member of this group' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Failed to join group' },
      { status: 500 }
    );
  }
}
