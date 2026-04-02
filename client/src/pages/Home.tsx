import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, MessageCircle, LogOut, Search, Moon, Sun, Smile, User, Zap, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { ConversationFilter, ConversationFilterOptions } from "@/components/ConversationFilter";
import { useConversationFilter, useConversationModelStats } from "@/hooks/useConversationFilter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<ConversationFilterOptions>({
    searchQuery: '',
    model: 'all',
    dateRange: 'all',
    sortBy: 'recent'
  });
  const { data: conversations, isLoading: conversationsLoading } =
    trpc.chat.listConversations.useQuery(undefined, {
      enabled: isAuthenticated,
    });
  const { data: searchResults } = trpc.chat.searchConversations.useQuery(
    { query: searchQuery },
    { enabled: isAuthenticated && searchQuery.length > 0 }
  );

  // ফিল্টার হুক ব্যবহার করুন
  const { filteredConversations, filteredCount, totalCount, hasFilters } = useConversationFilter(
    conversations,
    filterOptions
  );

  // মডেল স্ট্যাটিস্টিক্স
  const modelStats = useConversationModelStats(conversations);

  const displayConversations = filteredConversations;

  const createConversationMutation = trpc.chat.createConversation.useMutation();

  const handleCreateConversation = async () => {
    try {
      const result = await createConversationMutation.mutateAsync({
        title: "নতুন কথোপকথন",
      });
      const conversationId = (result as any)?.insertId || 1;
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-slate-800">
              AI চ্যাট অ্যাপ
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              আপনার ব্যক্তিগত AI সহায়ক
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 text-center">
              শুরু করতে লগইন করুন এবং AI এর সাথে কথোপকথন করুন।
            </p>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            >
              লগইন করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI চ্যাট</h1>
            <p className="text-sm text-slate-500">স্বাগতম, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/analytics")}
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
              title="বিশ্লেষণ / Analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate("/templates")}
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
              title="চ্যাট টেমপ্লেট / Chat Templates"
            >
              <Zap className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
              title="প্রোফাইল"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
              title="থিম পরিবর্তন করুন"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="text-slate-600 hover:text-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create New Conversation and Search */}
        <div className="mb-8 space-y-4">
          <Button
            onClick={handleCreateConversation}
            disabled={createConversationMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 text-lg w-full"
          >
            {createConversationMutation.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            নতুন কথোপকথন / New Chat
          </Button>
          
          {/* Personality Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {personalities?.map((p: any) => (
              <Button
                key={p.id}
                onClick={() => setSelectedPersonality(p.id)}
                className={`text-sm py-2 ${
                  selectedPersonality === p.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                {p.name}
              </Button>
            ))}
          </div>
          
          {/* Conversation Filter */}
          <ConversationFilter
            onFilterChange={setFilterOptions}
            isLoading={conversationsLoading}
          />
        </div>

        {/* Conversations Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              আপনার কথোপকথন
            </h2>
            {hasFilters && (
              <p className="text-sm text-slate-500">
                {filteredCount} / {totalCount} কথোপকথন
              </p>
            )}
          </div>

          {conversationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">কোনো কথোপকথন নেই</p>
                <p className="text-slate-400 text-sm mt-2">
                  শুরু করতে উপরের বোতাম ক্লিক করুন
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayConversations?.map((conv) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-slate-200 hover:border-blue-400"
                  onClick={() => navigate(`/chat/${conv.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 truncate">
                      {conv.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {conv.createdAt ? new Date(conv.createdAt).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      ক্লিক করে খুলুন
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  // Personality selection state
  const [selectedPersonality, setSelectedPersonality] = useState("friendly");
  const { data: personalities } = trpc.chat.getPersonalities.useQuery();
