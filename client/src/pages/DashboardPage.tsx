import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import WelcomeScreen from "@/components/WelcomeScreen";
import {
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Zap,
  Users,
  FileText,
  Bell,
  User,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const navigationItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Zap, label: "Models", href: "/models" },
  { icon: FileText, label: "Templates", href: "/templates" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/profile-settings" },
];

export function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    // Show welcome screen only for new users (first login)
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && user?.name) {
      setShowWelcome(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user?.name]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarClass = sidebarOpen ? "w-64" : "w-20";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Welcome Screen with Confetti */}
      {showWelcome && user?.name && (
        <WelcomeScreen
          userName={user.name}
          onComplete={() => setShowWelcome(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`${sidebarClass} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BA</span>
            </div>
            {sidebarOpen && <span className="font-bold text-lg text-slate-900 dark:text-white">Bayojid</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          {sidebarOpen && user && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            variant="ghost"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="icon"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Link href="/profile-settings">
              <a>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </a>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(" ")[0]}!</h1>
              <p className="text-purple-100">Ready to explore the power of AI?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: MessageSquare, label: "New Chat", href: "/chat", color: "purple" },
                { icon: Zap, label: "Explore Models", href: "/models", color: "blue" },
                { icon: FileText, label: "Templates", href: "/templates", color: "green" },
                { icon: Users, label: "Community", href: "/community", color: "orange" },
              ].map((action) => {
                const Icon = action.icon;
                const colorClasses: Record<string, string> = {
                  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                };
                return (
                  <Link key={action.href} href={action.href}>
                    <a>
                      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[action.color]}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{action.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get started</p>
                      </Card>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { title: "Started a new chat", time: "2 hours ago", icon: MessageSquare },
                  { title: "Explored GPT-5 model", time: "5 hours ago", icon: Zap },
                  { title: "Joined a study group", time: "1 day ago", icon: Users },
                ].map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
