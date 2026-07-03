import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Plus, MessageCircle, LogOut, Search, Moon, Sun, 
  Zap, BarChart3, Palette, Code, ShoppingCart, Smartphone, 
  Brain, Lightbulb, FileText, Music, Image, Video, Send, Paperclip, Smile
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative text-center max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Bayojid AI Pro</h1>
          <p className="text-xl text-gray-300 mb-8">
            আপনার ব্যক্তিগত AI সহায়ক - যেকোনো কিছু তৈরি করুন, যেকোনো সমস্যা সমাধান করুন
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold"
          >
            শুরু করুন
          </Button>
        </div>
      </div>
    );
  }

  // Feature cards data
  const features = [
    {
      icon: Palette,
      title: "Design to Code",
      description: "Upload an image and have AI build it",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Code,
      title: "Build a fullstack app",
      description: "Create a templated full-stack application",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingCart,
      title: "Launch a storefront",
      description: "Create a beautiful online shop",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Build iOS and Android apps",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: FileText,
      title: "Write Content",
      description: "Generate articles, blogs, and documents",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Music,
      title: "Create Music",
      description: "Generate original music and audio",
      color: "from-yellow-500 to-orange-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Bayojid AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-300 hover:text-white"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2 text-gray-300">
              <span>{user?.name || "User"}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            What would you like to do?
          </h2>
          <p className="text-xl text-gray-400">
            Choose from our AI-powered tools to create, build, and innovate
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group bg-slate-800/50 border-slate-700 hover:border-slate-600 backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="p-6 space-y-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Search/Chat Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Ask anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-slate-700/50"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-slate-700/50"
              >
                <Image className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-slate-700/50"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Ideas
              </Button>
              <div className="flex-1" />
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>💡 Tip: Use natural language to describe what you want to create</p>
          </div>
        </div>
      </div>
    </div>
  );
}
