import { useMemo } from 'react';

/**
 * কথোপকথন ফিল্টার হুক
 * মডেল, তারিখ এবং সার্চ অনুযায়ী কথোপকথন ফিল্টার করুন
 */

export interface Conversation {
  id: number;
  title: string;
  createdAt?: number | Date;
  model?: string;
  messageCount?: number;
  lastMessage?: string;
}

export interface FilterOptions {
  searchQuery?: string;
  model?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month';
  sortBy?: 'recent' | 'oldest' | 'alphabetical';
}

export function useConversationFilter(
  conversations: Conversation[] | undefined,
  filters: FilterOptions
) {
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    let result = [...conversations];

    // সার্চ ফিল্টার
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        conv =>
          conv.title.toLowerCase().includes(query) ||
          (conv.lastMessage && conv.lastMessage.toLowerCase().includes(query))
      );
    }

    // মডেল ফিল্টার
    if (filters.model && filters.model !== 'all') {
      result = result.filter(conv => {
        if (filters.model === 'default') {
          return !conv.model || conv.model === 'default';
        }
        return conv.model === filters.model;
      });
    }

    // তারিখ রেঞ্জ ফিল্টার
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      result = result.filter(conv => {
        const convDate = conv.createdAt
          ? typeof conv.createdAt === 'number'
            ? conv.createdAt
            : new Date(conv.createdAt).getTime()
          : 0;

        const diff = now - convDate;

        switch (filters.dateRange) {
          case 'today':
            return diff <= oneDay;
          case 'week':
            return diff <= oneWeek;
          case 'month':
            return diff <= oneMonth;
          default:
            return true;
        }
      });
    }

    // সর্ট করুন
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'recent':
          result.sort((a, b) => {
            const dateA = a.createdAt
              ? typeof a.createdAt === 'number'
                ? a.createdAt
                : new Date(a.createdAt).getTime()
              : 0;
            const dateB = b.createdAt
              ? typeof b.createdAt === 'number'
                ? b.createdAt
                : new Date(b.createdAt).getTime()
              : 0;
            return dateB - dateA;
          });
          break;

        case 'oldest':
          result.sort((a, b) => {
            const dateA = a.createdAt
              ? typeof a.createdAt === 'number'
                ? a.createdAt
                : new Date(a.createdAt).getTime()
              : 0;
            const dateB = b.createdAt
              ? typeof b.createdAt === 'number'
                ? b.createdAt
                : new Date(b.createdAt).getTime()
              : 0;
            return dateA - dateB;
          });
          break;

        case 'alphabetical':
          result.sort((a, b) => a.title.localeCompare(b.title, 'bn'));
          break;
      }
    }

    return result;
  }, [conversations, filters]);

  return {
    filteredConversations,
    totalCount: conversations?.length || 0,
    filteredCount: filteredConversations.length,
    hasFilters:
      (filters.searchQuery && filters.searchQuery.trim() !== '') ||
      (filters.model && filters.model !== 'all') ||
      (filters.dateRange && filters.dateRange !== 'all') ||
      (filters.sortBy && filters.sortBy !== 'recent')
  };
}

/**
 * মডেল স্ট্যাটিস্টিক্স হুক
 * কথোপকথনে কোন কোন মডেল ব্যবহার হয়েছে তা গণনা করুন
 */
export function useConversationModelStats(conversations: Conversation[] | undefined) {
  const stats = useMemo(() => {
    if (!conversations) return {};

    const modelCounts: Record<string, number> = {};

    conversations.forEach(conv => {
      const model = conv.model || 'default';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });

    return modelCounts;
  }, [conversations]);

  return stats;
}

/**
 * তারিখ পরিসংখ্যান হুক
 */
export function useConversationDateStats(conversations: Conversation[] | undefined) {
  const stats = useMemo(() => {
    if (!conversations) {
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        older: 0
      };
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const result = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      older: 0
    };

    conversations.forEach(conv => {
      const convDate = conv.createdAt
        ? typeof conv.createdAt === 'number'
          ? conv.createdAt
          : new Date(conv.createdAt).getTime()
        : 0;

      const diff = now - convDate;

      if (diff <= oneDay) {
        result.today++;
      } else if (diff <= oneWeek) {
        result.thisWeek++;
      } else if (diff <= oneMonth) {
        result.thisMonth++;
      } else {
        result.older++;
      }
    });

    return result;
  }, [conversations]);

  return stats;
}
