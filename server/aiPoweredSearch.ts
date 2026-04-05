/**
 * AI-Powered Search Service
 * Implements semantic search, contextual search, and intelligent result ranking
 */

export interface SearchResult {
  id: string;
  type: 'message' | 'conversation' | 'user' | 'template';
  title: string;
  content: string;
  preview: string;
  relevanceScore: number;
  matchedKeywords: string[];
  context?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface SearchQuery {
  id: string;
  userId: number;
  query: string;
  filters?: SearchFilters;
  results: SearchResult[];
  executedAt: Date;
  executionTime: number;
}

export interface SearchFilters {
  type?: 'message' | 'conversation' | 'user' | 'template';
  dateRange?: { from: Date; to: Date };
  conversationId?: string;
  userId?: number;
  minRelevance?: number;
  limit?: number;
}

export interface SearchIndex {
  id: string;
  content: string;
  keywords: string[];
  embeddings?: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const searchQueries: Map<string, SearchQuery> = new Map();
const searchIndex: Map<string, SearchIndex> = new Map();
const recentSearches: Map<number, SearchQuery[]> = new Map();

/**
 * Execute AI-powered search
 */
export function executeSearch(
  userId: number,
  query: string,
  filters?: SearchFilters
): SearchQuery {
  const queryId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Parse query for keywords and intent
  const keywords = extractKeywords(query);
  const intent = detectSearchIntent(query);

  // Execute search with different strategies
  const results: SearchResult[] = [];

  // 1. Keyword-based search
  const keywordResults = keywordSearch(keywords, filters);
  results.push(...keywordResults);

  // 2. Semantic search (if embeddings available)
  const semanticResults = semanticSearch(query, filters);
  results.push(...semanticResults);

  // 3. Contextual search based on intent
  const contextualResults = contextualSearch(intent, query, filters);
  results.push(...contextualResults);

  // Deduplicate and rank results
  const uniqueResults = deduplicateResults(results);
  const rankedResults = rankResults(uniqueResults, query);

  // Apply limit
  const finalResults = rankedResults.slice(0, filters?.limit || 20);

  const executionTime = Date.now() - startTime;

  const searchQuery: SearchQuery = {
    id: queryId,
    userId,
    query,
    filters,
    results: finalResults,
    executedAt: new Date(),
    executionTime,
  };

  searchQueries.set(queryId, searchQuery);

  // Store in recent searches
  if (!recentSearches.has(userId)) {
    recentSearches.set(userId, []);
  }
  recentSearches.get(userId)!.unshift(searchQuery);

  // Keep only last 50 searches
  if (recentSearches.get(userId)!.length > 50) {
    recentSearches.get(userId)!.pop();
  }

  return searchQuery;
}

/**
 * Extract keywords from query
 */
function extractKeywords(query: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !stopWords.has(word) && word.length > 2)
    .map((word) => word.replace(/[^\w]/g, ''));
}

/**
 * Detect search intent
 */
function detectSearchIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('how') || lowerQuery.includes('what')) {
    return 'question';
  } else if (lowerQuery.includes('find') || lowerQuery.includes('show')) {
    return 'lookup';
  } else if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
    return 'comparison';
  } else if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
    return 'recent';
  }

  return 'general';
}

/**
 * Keyword-based search
 */
function keywordSearch(keywords: string[], filters?: SearchFilters): SearchResult[] {
  const results: SearchResult[] = [];

  for (const [_, index] of searchIndex) {
    if (filters?.type && index.metadata.type !== filters.type) continue;
    if (filters?.conversationId && index.metadata.conversationId !== filters.conversationId) continue;
    if (filters?.userId && index.metadata.userId !== filters.userId) continue;

    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      if (index.keywords.includes(keyword)) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    if (matchCount > 0) {
      const relevanceScore = matchCount / keywords.length;

      if (!filters?.minRelevance || relevanceScore >= filters.minRelevance) {
        results.push({
          id: index.id,
          type: (index.metadata.type as any) || 'message',
          title: (index.metadata.title as string) || 'Untitled',
          content: index.content,
          preview: index.content.substring(0, 200),
          relevanceScore,
          matchedKeywords,
          metadata: index.metadata,
          timestamp: index.createdAt,
        });
      }
    }
  }

  return results;
}

/**
 * Semantic search (placeholder for embeddings-based search)
 */
function semanticSearch(query: string, filters?: SearchFilters): SearchResult[] {
  // TODO: Implement embeddings-based semantic search
  // This would require:
  // 1. Generate embeddings for the query
  // 2. Compare with stored embeddings
  // 3. Return results based on semantic similarity
  return [];
}

/**
 * Contextual search based on intent
 */
function contextualSearch(intent: string, query: string, filters?: SearchFilters): SearchResult[] {
  const results: SearchResult[] = [];

  if (intent === 'recent') {
    // Return most recent items
    const items = Array.from(searchIndex.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    items.forEach((item) => {
      results.push({
        id: item.id,
        type: (item.metadata.type as any) || 'message',
        title: (item.metadata.title as string) || 'Untitled',
        content: item.content,
        preview: item.content.substring(0, 200),
        relevanceScore: 0.9,
        matchedKeywords: [],
        metadata: item.metadata,
        timestamp: item.createdAt,
      });
    });
  }

  return results;
}

/**
 * Deduplicate search results
 */
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    if (seen.has(result.id)) return false;
    seen.add(result.id);
    return true;
  });
}

/**
 * Rank search results
 */
function rankResults(results: SearchResult[], query: string): SearchResult[] {
  return results.sort((a, b) => {
    // Primary: relevance score
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }

    // Secondary: recency
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

/**
 * Add item to search index
 */
export function indexItem(
  id: string,
  content: string,
  type: string,
  metadata: Record<string, unknown>
): SearchIndex {
  const keywords = extractKeywords(content);

  const index: SearchIndex = {
    id,
    content,
    keywords,
    metadata: { ...metadata, type },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  searchIndex.set(id, index);
  return index;
}

/**
 * Update search index
 */
export function updateIndexItem(
  id: string,
  content: string,
  metadata?: Record<string, unknown>
): SearchIndex | undefined {
  const index = searchIndex.get(id);
  if (!index) return undefined;

  index.content = content;
  index.keywords = extractKeywords(content);
  index.updatedAt = new Date();

  if (metadata) {
    index.metadata = { ...index.metadata, ...metadata };
  }

  return index;
}

/**
 * Remove item from search index
 */
export function removeIndexItem(id: string): boolean {
  return searchIndex.delete(id);
}

/**
 * Get recent searches
 */
export function getRecentSearches(userId: number, limit: number = 10): SearchQuery[] {
  return (recentSearches.get(userId) || []).slice(0, limit);
}

/**
 * Get search statistics
 */
export function getSearchStats() {
  return {
    totalIndexedItems: searchIndex.size,
    totalSearches: searchQueries.size,
    averageExecutionTime:
      Array.from(searchQueries.values()).reduce((sum, q) => sum + q.executionTime, 0) /
      searchQueries.size || 0,
    topSearches: getTopSearches(10),
  };
}

/**
 * Get top searches
 */
function getTopSearches(limit: number): Array<{ query: string; count: number }> {
  const queryMap = new Map<string, number>();

  for (const query of searchQueries.values()) {
    queryMap.set(query.query, (queryMap.get(query.query) || 0) + 1);
  }

  return Array.from(queryMap.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Clear old search queries
 */
export function clearOldSearchQueries(maxAgeDays: number = 30): number {
  const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let cleared = 0;

  const queriesToDelete: string[] = [];
  for (const [queryId, query] of searchQueries) {
    if (query.executedAt.getTime() < cutoffTime) {
      queriesToDelete.push(queryId);
      cleared++;
    }
  }

  queriesToDelete.forEach((id) => searchQueries.delete(id));
  console.log(`[Search] Cleared ${cleared} old search queries`);

  return cleared;
}

/**
 * Export search index
 */
export function exportSearchIndex(): string {
  const indexArray = Array.from(searchIndex.values());
  return JSON.stringify(indexArray, null, 2);
}

/**
 * Import search index
 */
export function importSearchIndex(jsonData: string): number {
  try {
    const indexArray = JSON.parse(jsonData) as SearchIndex[];
    let imported = 0;

    for (const item of indexArray) {
      searchIndex.set(item.id, item);
      imported++;
    }

    return imported;
  } catch (error) {
    console.error('Failed to import search index:', error);
    return 0;
  }
}

/**
 * Rebuild search index
 */
export function rebuildSearchIndex(): number {
  const oldSize = searchIndex.size;
  searchIndex.clear();
  console.log(`[Search] Rebuilt search index (cleared ${oldSize} items)`);
  return oldSize;
}
