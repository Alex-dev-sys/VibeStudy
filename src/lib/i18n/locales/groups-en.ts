export const groupsEn = {
  groups: {
    title: 'Groups',
    subtitle: 'Join groups or create your own',
    createGroup: 'Create Group',
    joinGroup: 'Join',
    leaveGroup: 'Leave Group',
    deleteGroup: 'Delete Group',
    openGroup: 'Open',
    members: 'Members',
    member: 'member',
    members_plural: 'members',
    chat: 'Chat',
    settings: 'Settings',
    search: 'Search by name...',
    allLanguages: 'All languages',
    noGroups: 'No groups found',
    noGroupsDescription: 'Try changing filters or create the first group',
    loading: 'Loading...',
    owner: 'You are owner',
    ownerBadge: 'Group owner',
    online: 'Online',
    offline: 'Offline',
    joined: 'Joined',
    today: 'Today',
    yesterday: 'Yesterday',
    
    // Create Group Dialog
    createDialog: {
      title: 'Create Group',
      subtitle: 'Create a group for collaborative learning',
      nameLabel: 'Group Name',
      namePlaceholder: 'Python for Beginners',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Learning Python from scratch. Discussing tasks, helping each other.',
      languageLabel: 'Programming Language',
      create: 'Create',
      cancel: 'Cancel',
      nameRequired: 'Name is required',
      nameMinLength: 'Minimum 3 characters',
      nameMaxLength: 'Maximum 50 characters',
      descriptionRequired: 'Description is required',
      descriptionMinLength: 'Minimum 10 characters',
      descriptionMaxLength: 'Maximum 500 characters',
      languageRequired: 'Select a language',
      charactersCount: 'characters'
    },
    
    // Settings Dialog
    settingsDialog: {
      title: 'Group Settings',
      subtitle: 'Edit group information',
      save: 'Save',
      cancel: 'Cancel',
      dangerZone: 'Danger Zone',
      deleteButton: 'Delete Group',
      deleteTitle: 'Delete Group?',
      deleteWarning: 'This action cannot be undone. All messages and group data will be permanently deleted.',
      deleteConfirm: 'You are about to delete group',
      deleteForever: 'Delete Forever'
    },
    
    // Chat
    chatMessages: {
      noMessages: 'No messages yet',
      startConversation: 'Start the conversation!',
      loadingMessages: 'Loading messages...',
      messagePlaceholder: 'Write a message... (Enter to send, Shift+Enter for new line)',
      user: 'User'
    },
    
    // Members
    membersSection: {
      title: 'Members',
      noMembers: 'No members yet'
    },
    
    // Notices
    notices: {
      authRequired: 'Sign in to create and join groups',
      authRequiredChat: 'Sign in to chat in the group',
      notMember: 'You are not a member of this group',
      comingSoon: 'This community section will be available soon! Stay tuned.',
      login: 'Sign In',
      backToList: 'Back to list'
    },
    
    // Errors
    errors: {
      GROUP_NOT_FOUND: 'Group not found',
      UNAUTHORIZED: 'Authentication required',
      MAX_GROUPS_CREATED: 'You can create maximum 3 groups',
      MAX_GROUPS_JOINED: 'You can join maximum 10 groups',
      ALREADY_MEMBER: 'You are already a member of this group',
      NOT_MEMBER: 'You are not a member of this group',
      VALIDATION_ERROR: 'Validation error',
      DATABASE_ERROR: 'Database error',
      FAILED_TO_CREATE: 'Failed to create group',
      FAILED_TO_UPDATE: 'Failed to update group',
      FAILED_TO_DELETE: 'Failed to delete group',
      FAILED_TO_JOIN: 'Failed to join group',
      FAILED_TO_LEAVE: 'Failed to leave group',
      FAILED_TO_SEND_MESSAGE: 'Failed to send message',
      MESSAGE_TOO_LONG: 'Message is too long (maximum 1000 characters)',
      MUST_BE_MEMBER: 'You must be a member of the group'
    },
    
    // Success messages
    success: {
      groupCreated: 'Group created successfully!',
      groupUpdated: 'Group updated successfully!',
      groupDeleted: 'Group deleted',
      joined: 'You joined the group!',
      left: 'You left the group'
    }
  }
};
