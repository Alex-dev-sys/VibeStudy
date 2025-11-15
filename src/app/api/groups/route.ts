import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import {
  fetchGroupsWithMembership,
  fetchAllGroups,
  createGroup
} from '@/lib/supabase/groups';
import type { CreateGroupData } from '@/types/groups';

/**
 * GET /api/groups
 * Fetch all groups with membership info for authenticated user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      // Return public groups list for non-authenticated users
      const result = await fetchAllGroups();

      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      return NextResponse.json({ groups: result.data || [] });
    }

    // Return groups with membership info for authenticated users
    const result = await fetchGroupsWithMembership(user.id);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ groups: result.data || [] });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Authentication required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateGroupData;

    // Validate input
    if (!body.name || body.name.trim().length < 3 || body.name.trim().length > 50) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR: Group name must be 3-50 characters' },
        { status: 400 }
      );
    }

    if (
      !body.description ||
      body.description.trim().length < 10 ||
      body.description.trim().length > 500
    ) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR: Group description must be 10-500 characters' },
        { status: 400 }
      );
    }

    if (!body.languageId || !body.languageId.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR: Language ID is required' },
        { status: 400 }
      );
    }

    // Create group
    const result = await createGroup(user.id, {
      name: body.name.trim(),
      description: body.description.trim(),
      languageId: body.languageId.trim()
    });

    if (result.error) {
      // Handle specific errors
      if (result.error.message.includes('MAX_GROUPS_CREATED')) {
        return NextResponse.json(
          { error: 'MAX_GROUPS_CREATED: You can create maximum 3 groups' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ group: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
