// Community Groups Types

export interface Group {
  id: string;
  name: string;
  description: string;
  languageId: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
  isOnline: boolean;
  lastSeen: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface GroupWithMembership extends Group {
  isMember: boolean;
  isOwner: boolean;
}

export interface CreateGroupData {
  name: string;
  description: string;
  languageId: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  languageId?: string;
}

export interface SendMessageData {
  content: string;
}

export enum GroupErrorCode {
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  MAX_GROUPS_CREATED = 'MAX_GROUPS_CREATED',
  MAX_GROUPS_JOINED = 'MAX_GROUPS_JOINED',
  ALREADY_MEMBER = 'ALREADY_MEMBER',
  NOT_MEMBER = 'NOT_MEMBER',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface GroupError {
  code: GroupErrorCode;
  message: string;
  details?: any;
}
