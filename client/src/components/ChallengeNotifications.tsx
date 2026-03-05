import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCircle, Flame, Award } from "lucide-react";

export function ChallengeNotifications() {
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const { data: notificationsData } = trpc.challengeNotifications.getChallengeNotifications.useQuery();
  const markAsReadMutation = trpc.challengeNotifications.markNotificationAsRead.useMutation();

  const notifications = notificationsData?.notifications || [];
  const visibleNotifications = notifications.filter((n) => !dismissedNotifications.includes(n.id));

  const handleDismiss = (notificationId: string) => {
    setDismissedNotifications([...dismissedNotifications, notificationId]);
    markAsReadMutation.mutate({ notificationId });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "challenge_completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "streak_milestone":
        return <Flame className="w-5 h-5 text-orange-600" />;
      case "badge_earned":
        return <Award className="w-5 h-5 text-yellow-600" />;
      case "milestone_achieved":
        return <Award className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "challenge_completed":
        return "bg-green-50 border-green-200";
      case "streak_milestone":
        return "bg-orange-50 border-orange-200";
      case "badge_earned":
        return "bg-yellow-50 border-yellow-200";
      case "milestone_achieved":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (visibleNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">কোনো নতুন নোটিফিকেশন নেই</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">চ্যালেঞ্জ নোটিফিকেশন / Challenge Notifications</h3>
      
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border-2 ${getNotificationColor(notification.type)} transition-all hover:shadow-md`}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{notification.title}</h4>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">নতুন</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(notification.id)}
                className="mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {dismissedNotifications.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDismissedNotifications([])}
          >
            সমস্ত নোটিফিকেশন দেখান
          </Button>
        </div>
      )}
    </div>
  );
}
