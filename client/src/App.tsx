import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ChatTemplates from "./pages/ChatTemplates";
import Analytics from "./pages/Analytics";
import { MediaGeneration } from "./pages/MediaGeneration";
import CustomAIModels from "./pages/CustomAIModels";
import VideoEditor from "./pages/VideoEditor";
import Notifications from "./pages/Notifications";
import Community from "./pages/Community";
import ModerationDashboard from "./pages/ModerationDashboard";
import Reputation from "./pages/Reputation";
import Challenges from "./pages/Challenges";
import { Payment } from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentHistory from "./pages/PaymentHistory";
import ExportAnalytics from "./pages/ExportAnalytics";
import SharedChat from "./pages/SharedChat";
import { NotificationCenter } from "./components/NotificationCenter";
import { ReportDashboard } from "./components/ReportDashboard";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import APIRateLimitingDashboard from "./pages/APIRateLimitingDashboard";
import DashboardWidgets from "./pages/DashboardWidgets";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { LanguageSelector } from "./components/LanguageSelector";
import { QuotaMonitor } from "./components/QuotaMonitor";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/profile" component={Profile} />
      <Route path="/templates" component={ChatTemplates} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/media" component={MediaGeneration} />
      <Route path="/models" component={CustomAIModels} />
      <Route path="/video-editor" component={VideoEditor} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/community" component={Community} />
      <Route path="/moderation" component={ModerationDashboard} />
      <Route path="/reputation" component={Reputation} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/payment" component={Payment} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failed" component={PaymentFailed} />
      <Route path="/payment/history" component={PaymentHistory} />
      <Route path="/export" component={ExportAnalytics} />
      <Route path="/shared/:id" component={SharedChat} />
      <Route path="/notifications-center" component={NotificationCenter} />
      <Route path="/reports" component={ReportDashboard} />
      <Route path="/analytics-charts" component={AnalyticsCharts} />
      <Route path="/api-rate-limiting" component={APIRateLimitingDashboard} />
      <Route path="/dashboard-widgets" component={DashboardWidgets} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Theme is set to light mode with elegant styling

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            {/* Header with Theme, Language, and Quota Switchers */}
            <div className="flex justify-end gap-4 p-4 bg-background border-b">
              <ThemeSwitcher />
              <LanguageSelector />
              <QuotaMonitor />
            </div>
            {/* Main content */}
            <div className="flex-1">
              <Router />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
