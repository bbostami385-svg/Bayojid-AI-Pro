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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
