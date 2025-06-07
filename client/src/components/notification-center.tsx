import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Star, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'success' | 'warning' | 'info' | 'error' | 'feature' | 'celebration';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  isRead: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle Escape key to close notifications
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const getIcon = (type: NotificationType) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle {...iconProps} className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 text-blue-500" />;
      case 'feature':
        return <Star {...iconProps} className="w-5 h-5 text-purple" />;
      case 'celebration':
        return <Heart {...iconProps} className="w-5 h-5 text-coral" />;
      default:
        return <Info {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange';
      case 'medium':
        return 'bg-primary';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'Срочно';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return 'Низкий';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  const handleDismiss = (id: string) => {
    setAnimatingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      onDismiss(id);
      setAnimatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (a.priority !== b.priority) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 transition-all duration-200"
      >
        <Bell className={cn(
          "w-5 h-5 transition-all duration-300",
          unreadCount > 0 && "animate-pulse text-orange"
        )} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-coral text-white animate-bounce"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={handleClose}
          />
          
          {/* Panel */}
          <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden
                         w-80 sm:w-96 max-w-[calc(100vw-1rem)] min-w-[320px]
                         left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0">
            {/* Header */}
            <div className="border-b bg-slate-50">
              {/* Title Row */}
              <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{t('notifications')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="p-1 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Navigation Row */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-center justify-center gap-2 sm:gap-3 w-full">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 px-3 py-1 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">{t('markAllAsRead')}</span>
                    <span className="sm:hidden">Все прочитать</span>
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">{t('clearAll')}</span>
                    <span className="sm:hidden">Очистить все</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">{t('noNotifications')}</p>
                </div>
              ) : (
                <div className="p-2">
                  {sortedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 mb-2 rounded-lg border transition-all duration-300 cursor-pointer",
                        notification.isRead 
                          ? "bg-gray-50 border-gray-200 opacity-75" 
                          : "bg-white border-gray-300 shadow-sm hover:shadow-md active:scale-98",
                        animatingIds.has(notification.id) && "animate-pulse scale-95 opacity-50"
                      )}
                      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon with Animation */}
                        <div className={cn(
                          "p-1.5 rounded-full transition-all duration-500",
                          !notification.isRead && "animate-pulse"
                        )}>
                          {getIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header with Priority */}
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              "font-medium text-sm truncate flex-1",
                              notification.isRead ? "text-gray-600" : "text-gray-900"
                            )}>
                              {notification.title}
                            </h4>
                            <Badge 
                              className={cn(
                                "text-xs px-1.5 py-0.5 text-white border-0 shrink-0",
                                getPriorityColor(notification.priority)
                              )}
                            >
                              <span className="hidden sm:inline">{getPriorityLabel(notification.priority)}</span>
                              <span className="sm:hidden">
                                {notification.priority === 'urgent' ? '⚡' : 
                                 notification.priority === 'high' ? '🔴' : 
                                 notification.priority === 'medium' ? '🟡' : '⚪'}
                              </span>
                            </Badge>
                          </div>

                          {/* Message */}
                          <p className={cn(
                            "text-xs mb-2 line-clamp-2 leading-relaxed",
                            notification.isRead ? "text-gray-500" : "text-gray-700"
                          )}>
                            {notification.message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-400 truncate">
                              {formatTime(notification.timestamp)}
                            </span>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              {notification.action && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.action!.onClick();
                                  }}
                                  className="text-xs h-6 px-2 text-primary hover:text-primary/80"
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismiss(notification.id);
                                }}
                                className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600 shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Auto-dismiss low priority notifications after 10 seconds
    if (notification.priority === 'low') {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 10000);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  };
}