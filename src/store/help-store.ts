import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HelpTopicAccess {
  topicId: string;
  count: number;
  lastAccessed: number;
}

interface HelpState {
  // Track which help topics have been accessed
  accessedTopics: HelpTopicAccess[];
  
  // Track help button clicks by page
  helpButtonClicks: Record<string, number>;
  
  // Actions
  trackTopicAccess: (topicId: string) => void;
  trackHelpButtonClick: (page: string) => void;
  getMostAccessedTopics: (limit?: number) => HelpTopicAccess[];
  getTopicAccessCount: (topicId: string) => number;
}

export const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      accessedTopics: [],
      helpButtonClicks: {},

      trackTopicAccess: (topicId: string) => {
        set((state) => {
          const existingTopic = state.accessedTopics.find((t) => t.topicId === topicId);

          if (existingTopic) {
            return {
              accessedTopics: state.accessedTopics.map((t) =>
                t.topicId === topicId
                  ? { ...t, count: t.count + 1, lastAccessed: Date.now() }
                  : t
              ),
            };
          }

          return {
            accessedTopics: [
              ...state.accessedTopics,
              { topicId, count: 1, lastAccessed: Date.now() },
            ],
          };
        });
      },

      trackHelpButtonClick: (page: string) => {
        set((state) => ({
          helpButtonClicks: {
            ...state.helpButtonClicks,
            [page]: (state.helpButtonClicks[page] || 0) + 1,
          },
        }));
      },

      getMostAccessedTopics: (limit = 10) => {
        const topics = get().accessedTopics;
        return [...topics].sort((a, b) => b.count - a.count).slice(0, limit);
      },

      getTopicAccessCount: (topicId: string) => {
        const topic = get().accessedTopics.find((t) => t.topicId === topicId);
        return topic?.count || 0;
      },
    }),
    {
      name: 'vibestudy-help-storage',
      partialize: (state) => ({
        accessedTopics: state.accessedTopics,
        helpButtonClicks: state.helpButtonClicks,
      }),
    }
  )
);
