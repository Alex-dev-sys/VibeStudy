import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { fetchGroupMessages, sendGroupMessage } from '@/lib/supabase/groups';
import type { SendMessageData } from '@/types/groups';

export const dynamic = 'force-dynamic';

/**
 * GET /api/groups/[id]/messages
 * Fetch messages for a group
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before') || undefined;

    const result = await fetchGroupMessages(groupId, limit, before);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: result.data || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/messages
 * Send a message to a group
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
    const body = (await request.json()) as SendMessageData;

    // Validate input
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR: Message content cannot be empty' },
        { status: 400 }
      );
    }

    if (body.content.trim().length > 1000) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR: Message content must be 1-1000 characters' },
        { status: 400 }
      );
    }

    const result = await sendGroupMessage(groupId, user.id, body.content.trim());

    if (result.error) {
      // Handle specific errors
      if (result.error.message.includes('NOT_MEMBER')) {
        return NextResponse.json(
          { error: 'NOT_MEMBER: Must be a member to send messages' },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ message: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
