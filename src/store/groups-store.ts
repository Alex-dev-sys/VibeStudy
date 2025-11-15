import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Group,
  GroupMember,
  GroupMessage,
  GroupWithMembership,
  CreateGroupData,
  UpdateGroupData
} from '@/types/groups';

interface GroupsStore {
  // State
  groups: GroupWithMembership[];
  currentGroup: Group | null;
  members: GroupMember[];
  messages: GroupMessage[];
  isLoading: boolean;
  error: string | null;

  // Filters
  searchQuery: string;
  languageFilter: string | null;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: number;

  // Actions - Groups
  fetchGroups: () => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<Group>;
  updateGroup: (groupId: string, data: UpdateGroupData) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;

  // Actions - Membership
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  fetchMembers: (groupId: string) => Promise<void>;

  // Actions - Messages
  fetchMessages: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, content: string) => Promise<void>;
  subscribeToMessages: (groupId: string) => void;
  unsubscribeFromMessages: () => void;

  // Actions - Filters
  setSearchQuery: (query: string) => void;
  setLanguageFilter: (languageId: string | null) => void;

  // Computed
  getFilteredGroups: () => GroupWithMembership[];

  // Internal
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addMessage: (message: GroupMessage) => void;
  updateMemberStatus: (member: GroupMember) => void;
}

let messageSubscription: any = null;

export const useGroupsStore = create<GroupsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      groups: [],
      currentGroup: null,
      members: [],
      messages: [],
      isLoading: false,
      error: null,

      // Filters
      searchQuery: '',
      languageFilter: null,

      // Sync state
      isSyncing: false,
      lastSyncTime: 0,

      // Actions - Groups
      fetchGroups: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/groups');
          if (!response.ok) {
            throw new Error('Failed to fetch groups');
          }

          const data = await response.json();
          set({
            groups: data.groups || [],
            isLoading: false,
            lastSyncTime: Date.now()
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },

      fetchGroupById: async (groupId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch group');
          }

          const data = await response.json();
          set({
            currentGroup: data.group,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },

      createGroup: async (data: CreateGroupData) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[groups-store] Creating group:', data);
          
          const response = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include' // Ensure cookies are sent
          });

          console.log('[groups-store] Response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('[groups-store] Error response:', errorData);
            throw new Error(errorData.error || 'Failed to create group');
          }

          const result = await response.json();
          console.log('[groups-store] Group created successfully:', result.group);
          
          // Refresh groups list
          await get().fetchGroups();
          
          set({ isLoading: false });
          return result.group;
        } catch (error) {
          console.error('[groups-store] Exception:', error);
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
          throw error;
        }
      },

      updateGroup: async (groupId: string, data: UpdateGroupData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error('Failed to update group');
          }

          // Refresh current group and groups list
          await get().fetchGroupById(groupId);
          await get().fetchGroups();
          
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
          throw error;
        }
      },

      deleteGroup: async (groupId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Failed to delete group');
          }

          // Clear current group and refresh list
          set({ currentGroup: null });
          await get().fetchGroups();
          
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
          throw error;
        }
      },

      // Actions - Membership
      joinGroup: async (groupId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}/join`, {
            method: 'POST'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to join group');
          }

          // Refresh groups list
          await get().fetchGroups();
          
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
          throw error;
        }
      },

      leaveGroup: async (groupId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}/leave`, {
            method: 'POST'
          });

          if (!response.ok) {
            throw new Error('Failed to leave group');
          }

          // Unsubscribe from messages
          get().unsubscribeFromMessages();

          // Clear current group and refresh list
          set({ currentGroup: null, members: [], messages: [] });
          await get().fetchGroups();
          
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
          throw error;
        }
      },

      fetchMembers: async (groupId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}/members`);
          if (!response.ok) {
            throw new Error('Failed to fetch members');
          }

          const data = await response.json();
          set({
            members: data.members || [],
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },

      // Actions - Messages
      fetchMessages: async (groupId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/groups/${groupId}/messages`);
          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }

          const data = await response.json();
          set({
            messages: data.messages || [],
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },

      sendMessage: async (groupId: string, content: string) => {
        try {
          // Optimistic update
          const { getCurrentUser } = await import('@/lib/supabase/auth');
          const user = await getCurrentUser();
          
          if (user) {
            const optimisticMessage: GroupMessage = {
              id: `temp-${Date.now()}`,
              groupId,
              userId: user.id,
              content,
              createdAt: new Date().toISOString(),
              user: {
                id: user.id,
                name: user.user_metadata?.name || 'User',
                avatar: user.user_metadata?.avatar_url || ''
              }
            };

            set((state) => ({
              messages: [...state.messages, optimisticMessage]
            }));
          }

          const response = await fetch(`/api/groups/${groupId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
          });

          if (!response.ok) {
            throw new Error('Failed to send message');
          }

          // Message will be updated via real-time subscription
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          throw error;
        }
      },

      subscribeToMessages: (groupId: string) => {
        // Unsubscribe from previous subscription
        get().unsubscribeFromMessages();

        // Subscribe to new messages
        (async () => {
          const { getSupabaseClient } = await import('@/lib/supabase/client');
          const supabase = getSupabaseClient();

          if (!supabase) {
            console.warn('Supabase not configured, real-time messages disabled');
            return;
          }

          messageSubscription = supabase
            .channel(`group:${groupId}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'group_messages',
                filter: `group_id=eq.${groupId}`
              },
              async (payload: any) => {
                // Fetch user info for the message
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('id, name, avatar')
                  .eq('id', payload.new.user_id)
                  .single();

                const newMessage: GroupMessage = {
                  id: payload.new.id,
                  groupId: payload.new.group_id,
                  userId: payload.new.user_id,
                  content: payload.new.content,
                  createdAt: payload.new.created_at,
                  user: userData || undefined
                };

                get().addMessage(newMessage);
              }
            )
            .subscribe();
        })();
      },

      unsubscribeFromMessages: () => {
        if (messageSubscription) {
          messageSubscription.unsubscribe();
          messageSubscription = null;
        }
      },

      // Actions - Filters
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setLanguageFilter: (languageId: string | null) => {
        set({ languageFilter: languageId });
      },

      // Computed
      getFilteredGroups: () => {
        const { groups, searchQuery, languageFilter } = get();

        return groups.filter((group) => {
          const matchesSearch =
            !searchQuery ||
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesLanguage = !languageFilter || group.languageId === languageFilter;

          return matchesSearch && matchesLanguage;
        });
      },

      // Internal
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      addMessage: (message: GroupMessage) => {
        set((state) => {
          // Remove optimistic message if exists
          const filteredMessages = state.messages.filter(
            (m) => !m.id.startsWith('temp-')
          );

          // Check if message already exists
          const exists = filteredMessages.some((m) => m.id === message.id);
          if (exists) return state;

          return {
            messages: [...filteredMessages, message]
          };
        });
      },

      updateMemberStatus: (member: GroupMember) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === member.id ? { ...m, ...member } : m
          )
        }));
      }
    }),
    {
      name: 'vibestudy-groups',
      partialize: (state) => ({
        groups: state.groups,
        searchQuery: state.searchQuery,
        languageFilter: state.languageFilter
      })
    }
  )
);
