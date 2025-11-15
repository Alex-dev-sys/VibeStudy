'use client';

import { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useGroupsStore } from '@/store/groups-store';

interface GroupChatProps {
  groupId: string;
}

export function GroupChat({ groupId }: GroupChatProps) {
  const { messages, fetchMessages, isLoading } = useGroupsStore();

  useEffect(() => {
    fetchMessages(groupId);
  }, [groupId, fetchMessages]);

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Messages */}
      <div className="flex-1">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <MessageInput groupId={groupId} />
      </div>
    </div>
  );
}
