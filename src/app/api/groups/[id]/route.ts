import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { fetchGroupById, updateGroup, deleteGroup } from '@/lib/supabase/groups';
import type { UpdateGroupData } from '@/types/groups';

/**
 * GET /api/groups/[id]
 * Fetch a single group by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;

    const result = await fetchGroupById(groupId);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'GROUP_NOT_FOUND: Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ group: result.data });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]
 * Update a group
 */
export async function PATCH(
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
    const body = (await request.json()) as UpdateGroupData;

    // Validate input
    if (body.name !== undefined) {
      if (body.name.trim().length < 3 || body.name.trim().length > 50) {
        return NextResponse.json(
          { error: 'VALIDATION_ERROR: Group name must be 3-50 characters' },
          { status: 400 }
        );
      }
    }

    if (body.description !== undefined) {
      if (body.description.trim().length < 10 || body.description.trim().length > 500) {
        return NextResponse.json(
          { error: 'VALIDATION_ERROR: Group description must be 10-500 characters' },
          { status: 400 }
        );
      }
    }

    // Update group
    const updateData: UpdateGroupData = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.languageId !== undefined) updateData.languageId = body.languageId.trim();

    const result = await updateGroup(groupId, user.id, updateData);

    if (result.error) {
      // Handle specific errors
      if (result.error.message.includes('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED: Only owner can update group' },
          { status: 403 }
        );
      }

      if (result.error.message.includes('PGRST116')) {
        return NextResponse.json(
          { error: 'GROUP_NOT_FOUND: Group not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ group: result.data });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete a group
 */
export async function DELETE(
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

    const result = await deleteGroup(groupId, user.id);

    if (result.error) {
      // Handle specific errors
      if (result.error.message.includes('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED: Only owner can delete group' },
          { status: 403 }
        );
      }

      if (result.error.message.includes('PGRST116')) {
        return NextResponse.json(
          { error: 'GROUP_NOT_FOUND: Group not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
