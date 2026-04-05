import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Notification {
  id: string;
  channels: string[];
  recipient: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying' | 'bounced';
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notification delivery queue
  const { data: deliveryQueue, refetch } = trpc.notificationDelivery.getUserDeliveryQueue.useQuery();

  // Get delivery statistics
  const { data: stats } = trpc.notificationDelivery.getDeliveryStats.useQuery();

  // Retry failed delivery
  const retryMutation = trpc.notificationDelivery.retryDelivery.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (deliveryQueue) {
      setNotifications(deliveryQueue as Notification[]);
    }
  }, [deliveryQueue]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'retrying':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'retrying':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Notification Bell Icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="text-2xl font-bold">নোটিফিকেশন সেন্টার</h2>
          {notifications.length > 0 && (
            <Badge variant="destructive">{notifications.length}</Badge>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'বন্ধ করুন' : 'খুলুন'}
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">সফল</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ব্যর্থ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">পুনরায় চেষ্টা করছে</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.retrying || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">মোট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications List */}
      {isOpen && (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                কোনো নোটিফিকেশন নেই
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedNotification(notification)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(notification.status)}
                      <div className="flex-1">
                        <CardTitle className="text-base">{notification.subject}</CardTitle>
                        <CardDescription>{notification.recipient}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(notification.status)}>
                      {notification.status === 'sent' && 'পাঠানো হয়েছে'}
                      {notification.status === 'failed' && 'ব্যর্থ'}
                      {notification.status === 'retrying' && 'পুনরায় চেষ্টা করছে'}
                      {notification.status === 'pending' && 'অপেক্ষমাণ'}
                      {notification.status === 'bounced' && 'বাউন্সড'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>চ্যানেল: {notification.channels.join(', ')}</span>
                    <span>প্রচেষ্টা: {notification.attempts}</span>
                  </div>
                  {notification.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        retryMutation.mutate({ notificationId: notification.id });
                      }}
                    >
                      পুনরায় চেষ্টা করুন
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{selectedNotification.subject}</CardTitle>
                <CardDescription>{selectedNotification.recipient}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotification(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">বার্তা</h4>
                <p className="text-sm text-gray-600">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">স্ট্যাটাস</p>
                  <Badge className={getStatusBadgeColor(selectedNotification.status)}>
                    {selectedNotification.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">চ্যানেল</p>
                  <p className="text-sm font-medium">{selectedNotification.channels.join(', ')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">তৈরি</p>
                <p className="text-sm">{new Date(selectedNotification.createdAt).toLocaleString('bn-BD')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
