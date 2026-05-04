/**
 * Advanced Search Service
 * Semantic search, keyword extraction, and intelligent filtering
 */

export interface SearchResult {
  conversationId: string;
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  relevanceScore: number; // 0-1
  highlights: string[]; // Highlighted matching phrases
}

export interface SearchFilters {
  query: string;
  model?: string;
  role?: 'user' | 'assistant';
  dateFrom?: Date;
  dateTo?: Date;
  minRelevance?: number;
  limit?: number;
}

export interface SearchIndex {
  conversationId: string;
  messageId: string;
  content: string;
  keywords: string[];
  embedding?: number[]; // For semantic search
  role: 'user' | 'assistant';
  timestamp: Date;
  model: string;
}

// In-memory search index
const searchIndex = new Map<string, SearchIndex>();

/**
 * Index a message for search
 */
export function indexMessage(
  conversationId: string,
  messageId: string,
  content: string,
  role: 'user' | 'assistant',
  model: string,
  timestamp: Date
): SearchIndex {
  const keywords = extractKeywords(content);
  const index: SearchIndex = {
    conversationId,
    messageId,
    content,
    keywords,
    role,
    timestamp,
    model,
  };

  const key = `${conversationId}:${messageId}`;
  searchIndex.set(key, index);

  return index;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Remove common words
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'what',
    'which',
    'who',
    'when',
    'where',
    'why',
    'how',
  ]);

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .slice(0, 20); // Limit to 20 keywords

  return [...new Set(words)]; // Remove duplicates
}

/**
 * Search conversations
 */
export function search(filters: SearchFilters): SearchResult[] {
  const query = filters.query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  const results: SearchResult[] = [];

  searchIndex.forEach((index) => {
    // Apply filters
    if (filters.model && index.model !== filters.model) return;
    if (filters.role && index.role !== filters.role) return;
    if (filters.dateFrom && index.timestamp < filters.dateFrom) return;
    if (filters.dateTo && index.timestamp > filters.dateTo) return;

    // Calculate relevance score
    let relevanceScore = 0;

    // Keyword matching
    const matchedKeywords = queryKeywords.filter((kw) => index.keywords.includes(kw));
    relevanceScore += matchedKeywords.length * 0.3;

    // Exact phrase matching
    if (index.content.toLowerCase().includes(query)) {
      relevanceScore += 0.5;
    }

    // Partial word matching
    const contentWords = index.content.toLowerCase().split(/\s+/);
    queryKeywords.forEach((kw) => {
      const matches = contentWords.filter((w) => w.includes(kw)).length;
      relevanceScore += Math.min(matches * 0.1, 0.2);
    });

    // Normalize score to 0-1
    relevanceScore = Math.min(1, relevanceScore);

    if (relevanceScore >= (filters.minRelevance || 0.1)) {
      const highlights = extractHighlights(index.content, queryKeywords);

      results.push({
        conversationId: index.conversationId,
        messageId: index.messageId,
        content: index.content,
        role: index.role,
        timestamp: index.timestamp,
        relevanceScore,
        highlights,
      });
    }
  });

  // Sort by relevance and limit results
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, filters.limit || 20);
}

/**
 * Extract highlights from content
 */
function extractHighlights(content: string, keywords: string[]): string[] {
  const highlights: string[] = [];
  const contentLower = content.toLowerCase();

  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b\\w*${keyword}\\w*\\b`, 'gi');
    const matches = content.match(regex);

    if (matches) {
      matches.slice(0, 3).forEach((match) => {
        if (!highlights.includes(match)) {
          highlights.push(match);
        }
      });
    }
  });

  return highlights;
}

/**
 * Advanced search with filters
 */
export function advancedSearch(
  query: string,
  filters?: {
    model?: string;
    role?: 'user' | 'assistant';
    dateFrom?: Date;
    dateTo?: Date;
    conversationId?: string;
    minRelevance?: number;
  }
): SearchResult[] {
  let results = search({
    query,
    ...filters,
    limit: 100,
  });

  // Filter by conversation if specified
  if (filters?.conversationId) {
    results = results.filter((r) => r.conversationId === filters.conversationId);
  }

  return results;
}

/**
 * Get search suggestions based on query
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();

  searchIndex.forEach((index) => {
    index.keywords.forEach((keyword) => {
      if (keyword.startsWith(queryLower) && suggestions.size < limit) {
        suggestions.add(keyword);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get trending topics
 */
export function getTrendingTopics(limit: number = 10): Array<{ topic: string; count: number }> {
  const topicCounts = new Map<string, number>();

  searchIndex.forEach((index) => {
    index.keywords.forEach((keyword) => {
      topicCounts.set(keyword, (topicCounts.get(keyword) || 0) + 1);
    });
  });

  return Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Clear search index for a conversation
 */
export function clearConversationIndex(conversationId: string): number {
  let deletedCount = 0;

  searchIndex.forEach((_, key) => {
    if (key.startsWith(conversationId)) {
      searchIndex.delete(key);
      deletedCount++;
    }
  });

  return deletedCount;
}

/**
 * Get search statistics
 */
export function getSearchStats() {
  const totalIndexed = searchIndex.size;
  const conversations = new Set<string>();
  const models = new Set<string>();
  const keywords = new Set<string>();

  searchIndex.forEach((index) => {
    conversations.add(index.conversationId);
    models.add(index.model);
    index.keywords.forEach((kw) => keywords.add(kw));
  });

  return {
    totalIndexed,
    uniqueConversations: conversations.size,
    uniqueModels: models.size,
    uniqueKeywords: keywords.size,
    averageKeywordsPerMessage: totalIndexed > 0 ? keywords.size / totalIndexed : 0,
  };
}

/**
 * Export search index
 */
export function exportSearchIndex(): SearchIndex[] {
  return Array.from(searchIndex.values());
}

/**
 * Import search index
 */
export function importSearchIndex(indices: SearchIndex[]): number {
  let importedCount = 0;

  indices.forEach((index) => {
    const key = `${index.conversationId}:${index.messageId}`;
    if (!searchIndex.has(key)) {
      searchIndex.set(key, index);
      importedCount++;
    }
  });

  return importedCount;
}
