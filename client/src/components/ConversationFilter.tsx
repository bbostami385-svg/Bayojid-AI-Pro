import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

/**
 * কথোপকথন ফিল্টার কম্পোনেন্ট
 * মডেল, তারিখ এবং সার্চ অনুযায়ী ফিল্টার করুন
 */

export interface ConversationFilterOptions {
  searchQuery?: string;
  model?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month';
  sortBy?: 'recent' | 'oldest' | 'alphabetical';
}

interface ConversationFilterProps {
  onFilterChange: (filters: ConversationFilterOptions) => void;
  availableModels?: string[];
  isLoading?: boolean;
}

export function ConversationFilter({
  onFilterChange,
  availableModels = ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'],
  isLoading = false
}: ConversationFilterProps) {
  const [filters, setFilters] = useState<ConversationFilterOptions>({
    searchQuery: '',
    model: 'all',
    dateRange: 'all',
    sortBy: 'recent'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * ফিল্টার পরিবর্তন হ্যান্ডলার
   */
  const handleFilterChange = (newFilters: Partial<ConversationFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  /**
   * সব ফিল্টার রিসেট করুন
   */
  const handleReset = () => {
    const resetFilters: ConversationFilterOptions = {
      searchQuery: '',
      model: 'all',
      dateRange: 'all',
      sortBy: 'recent'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  /**
   * সক্রিয় ফিল্টার গণনা করুন
   */
  const activeFilterCount = [
    filters.searchQuery ? 1 : 0,
    filters.model !== 'all' ? 1 : 0,
    filters.dateRange !== 'all' ? 1 : 0,
    filters.sortBy !== 'recent' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* মূল ফিল্টার বার */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="কথোপকথন খুঁজুন..."
          value={filters.searchQuery || ''}
          onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
          disabled={isLoading}
          className="flex-1 bg-white border-slate-200"
        />

        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="relative"
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* উন্নত ফিল্টার */}
      {showAdvanced && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* মডেল ফিল্টার */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                AI মডেল
              </label>
              <Select
                value={filters.model || 'all'}
                onValueChange={(value) => handleFilterChange({ model: value })}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="সব মডেল" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">সব মডেল</SelectItem>
                  <SelectItem value="chatgpt">🤖 ChatGPT</SelectItem>
                  <SelectItem value="gemini">✨ Google Gemini</SelectItem>
                  <SelectItem value="claude">🧠 Claude</SelectItem>
                  <SelectItem value="perplexity">🔍 Perplexity</SelectItem>
                  <SelectItem value="grok">⚡ Grok</SelectItem>
                  <SelectItem value="default">ডিফল্ট</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* তারিখ রেঞ্জ ফিল্টার */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                তারিখ রেঞ্জ
              </label>
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={(value) => handleFilterChange({ dateRange: value as any })}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="সব সময়" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">সব সময়</SelectItem>
                  <SelectItem value="today">আজ</SelectItem>
                  <SelectItem value="week">এই সপ্তাহ</SelectItem>
                  <SelectItem value="month">এই মাস</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* সর্ট অপশন */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                সাজান
              </label>
              <Select
                value={filters.sortBy || 'recent'}
                onValueChange={(value) => handleFilterChange({ sortBy: value as any })}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="সাম্প্রতিক" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="recent">সাম্প্রতিক</SelectItem>
                  <SelectItem value="oldest">পুরানো</SelectItem>
                  <SelectItem value="alphabetical">বর্ণানুক্রমিক</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* সক্রিয় ফিল্টার ব্যাজ */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  অনুসন্ধান: {filters.searchQuery}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange({ searchQuery: '' })}
                  />
                </Badge>
              )}
              {filters.model !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  মডেল: {filters.model}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange({ model: 'all' })}
                  />
                </Badge>
              )}
              {filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  তারিখ: {filters.dateRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange({ dateRange: 'all' })}
                  />
                </Badge>
              )}
              {filters.sortBy !== 'recent' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  সাজান: {filters.sortBy}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange({ sortBy: 'recent' })}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationFilter;
