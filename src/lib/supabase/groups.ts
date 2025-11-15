import { getSupabaseClient } from './client';
import type { DatabaseResult } from './types';
import type {
  Group,
  GroupMember,
  GroupMessage,
  GroupWithMembership,
  CreateGroupData,
  UpdateGroupData
} from '@/types/groups';

/**
 * Groups Database Operations
 * Provides type-safe wrappers for Supabase group operations
 */

// ============================================================================
// Group Operations
// ============================================================================

/**
 * Fetch all groups with membership info for a user
 */
export async function fetchGroupsWithMembership(
  userId: string
): Promise<DatabaseResult<GroupWithMembership[]>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase.rpc('get_groups_with_membership', {
      user_id_param: userId
    });

    if (error) {
      return { data: null, error };
    }

    const groups: GroupWithMembership[] = data.map((entry: any) => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      languageId: entry.language_id,
      ownerId: entry.owner_id,
      memberCount: entry.member_count,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
      isMember: entry.is_member,
      isOwner: entry.is_owner
    }));

    return { data: groups, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch all groups (public list)
 */
export async function fetchAllGroups(): Promise<DatabaseResult<Group[]>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    const groups: Group[] = data.map((entry: any) => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      languageId: entry.language_id,
      ownerId: entry.owner_id,
      memberCount: entry.member_count,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));

    return { data: groups, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch a single group by ID
 */
export async function fetchGroupById(groupId: string): Promise<DatabaseResult<Group | null>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    const group: Group = {
      id: data.id,
      name: data.name,
      description: data.description,
      languageId: data.language_id,
      ownerId: data.owner_id,
      memberCount: data.member_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: group, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Create a new group
 */
export async function createGroup(
  userId: string,
  groupData: CreateGroupData
): Promise<DatabaseResult<Group>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Check if user can create more groups
    const { data: canCreate, error: checkError } = await supabase.rpc('can_create_group', {
      user_id_param: userId
    });

    if (checkError) {
      return { data: null, error: checkError };
    }

    if (!canCreate) {
      return {
        data: null,
        error: new Error('MAX_GROUPS_CREATED: You can create maximum 3 groups')
      };
    }

    // Create the group
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        language_id: groupData.languageId,
        owner_id: userId
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Add creator as first member
    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: userId
    });

    if (memberError) {
      // Rollback: delete the group
      await supabase.from('groups').delete().eq('id', data.id);
      return { data: null, error: memberError };
    }

    const group: Group = {
      id: data.id,
      name: data.name,
      description: data.description,
      languageId: data.language_id,
      ownerId: data.owner_id,
      memberCount: data.member_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: group, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Update a group
 */
export async function updateGroup(
  groupId: string,
  userId: string,
  groupData: UpdateGroupData
): Promise<DatabaseResult<Group>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Check if user is the owner
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (group.owner_id !== userId) {
      return { data: null, error: new Error('UNAUTHORIZED: Only owner can update group') };
    }

    // Update the group
    const updateData: any = {};
    if (groupData.name !== undefined) updateData.name = groupData.name;
    if (groupData.description !== undefined) updateData.description = groupData.description;
    if (groupData.languageId !== undefined) updateData.language_id = groupData.languageId;

    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    const updatedGroup: Group = {
      id: data.id,
      name: data.name,
      description: data.description,
      languageId: data.language_id,
      ownerId: data.owner_id,
      memberCount: data.member_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { data: updatedGroup, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId: string, userId: string): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Check if user is the owner
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (group.owner_id !== userId) {
      return { data: null, error: new Error('UNAUTHORIZED: Only owner can delete group') };
    }

    // Delete the group (CASCADE will handle members and messages)
    const { error } = await supabase.from('groups').delete().eq('id', groupId);

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Membership Operations
// ============================================================================

/**
 * Join a group
 */
export async function joinGroup(groupId: string, userId: string): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Check if user can join more groups
    const { data: canJoin, error: checkError } = await supabase.rpc('can_join_group', {
      user_id_param: userId
    });

    if (checkError) {
      return { data: null, error: checkError };
    }

    if (!canJoin) {
      return {
        data: null,
        error: new Error('MAX_GROUPS_JOINED: You can join maximum 10 groups')
      };
    }

    // Check if already a member
    const { data: existing, error: existError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!existError && existing) {
      return { data: null, error: new Error('ALREADY_MEMBER: Already a member of this group') };
    }

    // Join the group
    const { error } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: userId
    });

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string, userId: string): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Check if member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      return { data: null, error: new Error('NOT_MEMBER: Not a member of this group') };
    }

    // Leave the group (trigger will handle ownership transfer)
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch members of a group
 */
export async function fetchGroupMembers(
  groupId: string
): Promise<DatabaseResult<GroupMember[]>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(
        `
        *,
        profiles:user_id (
          id,
          name,
          avatar
        )
      `
      )
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    const members: GroupMember[] = data.map((entry: any) => ({
      id: entry.id,
      groupId: entry.group_id,
      userId: entry.user_id,
      joinedAt: entry.joined_at,
      isOnline: entry.is_online,
      lastSeen: entry.last_seen,
      user: entry.profiles
        ? {
            id: entry.profiles.id,
            name: entry.profiles.name,
            avatar: entry.profiles.avatar
          }
        : undefined
    }));

    return { data: members, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Update member online status
 */
export async function updateMemberStatus(
  groupId: string,
  userId: string,
  isOnline: boolean
): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('group_members')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Message Operations
// ============================================================================

/**
 * Fetch messages for a group
 */
export async function fetchGroupMessages(
  groupId: string,
  limit: number = 50,
  before?: string
): Promise<DatabaseResult<GroupMessage[]>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    let query = supabase
      .from('group_messages')
      .select(
        `
        *,
        profiles:user_id (
          id,
          name,
          avatar
        )
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    const messages: GroupMessage[] = data
      .map((entry: any) => ({
        id: entry.id,
        groupId: entry.group_id,
        userId: entry.user_id,
        content: entry.content,
        createdAt: entry.created_at,
        user: entry.profiles
          ? {
              id: entry.profiles.id,
              name: entry.profiles.name,
              avatar: entry.profiles.avatar
            }
          : undefined
      }))
      .reverse(); // Reverse to show oldest first

    return { data: messages, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Send a message to a group
 */
export async function sendGroupMessage(
  groupId: string,
  userId: string,
  content: string
): Promise<DatabaseResult<GroupMessage>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Check if user is a member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      return { data: null, error: new Error('NOT_MEMBER: Must be a member to send messages') };
    }

    // Send the message
    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        content
      })
      .select(
        `
        *,
        profiles:user_id (
          id,
          name,
          avatar
        )
      `
      )
      .single();

    if (error) {
      return { data: null, error };
    }

    const message: GroupMessage = {
      id: data.id,
      groupId: data.group_id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at,
      user: data.profiles
        ? {
            id: data.profiles.id,
            name: data.profiles.name,
            avatar: data.profiles.avatar
          }
        : undefined
    };

    return { data: message, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
