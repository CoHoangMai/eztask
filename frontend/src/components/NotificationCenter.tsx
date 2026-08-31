import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Clock, 
  Layers, 
  MessageSquare, 
  X 
} from 'lucide-react';
import type { AppNotification } from '../types/kanban';
import { notificationApi } from '../api/notificationApi';

interface NotificationCenterProps {
  isOnline: boolean;
  onNavigateToCard?: (cardId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOnline,
  onNavigateToCard,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => [
    {
      id: 'notif-seed-1',
      recipientId: 'user-1',
      actorName: 'Alex Morgan',
      actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      eventType: 'TASK_MOVED',
      taskTitle: 'Conduct customer feedback survey',
      message: 'Alex Morgan moved task to In Progress',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'notif-seed-2',
      recipientId: 'user-1',
      actorName: 'Sarah Chen',
      actorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      eventType: 'URGENT_ALERT',
      taskTitle: 'Multi-factor authentication (MFA)',
      message: 'Urgent priority card created and assigned to Sprint',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'notif-seed-3',
      recipientId: 'user-1',
      actorName: 'David Kim',
      actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      eventType: 'COMMENT_ADDED',
      taskTitle: 'Redesign pricing table',
      message: 'David Kim commented: "Let us make sure the 20% annual discount is clear."',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll or fetch notifications when online
  const fetchNotifications = async () => {
    if (!isOnline) return;
    try {
      const res = await notificationApi.getNotifications();
      if (res.notifications && res.notifications.length > 0) {
        setNotifications(res.notifications);
      }
    } catch {
      // Fallback silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (isOnline) {
      notificationApi.markAsRead(id).catch(console.warn);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isOnline) {
      notificationApi.markAllRead().catch(console.warn);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'URGENT_ALERT':
        return <AlertCircle size={14} className="text-rose-500" />;
      case 'TASK_MOVED':
        return <Layers size={14} className="text-blue-500" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={14} className="text-amber-500" />;
      default:
        return <Clock size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        title="Notifications & Activity"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span 
            id="notification-unread-badge"
            className="absolute 0.5 top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-900"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div 
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-blue-400" />
              <span className="text-xs font-bold text-white">Activity & Updates</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-blue-600/80 text-white px-1.5 py-0.2 rounded-md font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No activity notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) handleMarkAsRead(notif.id);
                    if (notif.taskId && onNavigateToCard) {
                      onNavigateToCard(notif.taskId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                    notif.read ? 'bg-slate-950 hover:bg-slate-900/60' : 'bg-slate-900/90 hover:bg-slate-850'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700/80 shrink-0">
                    {getEventIcon(notif.eventType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-white truncate">
                        {notif.taskTitle || notif.actorName || 'Workspace Update'}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.actorName && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {notif.actorAvatar && (
                          <img
                            src={notif.actorAvatar}
                            alt={notif.actorName}
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-700"
                          />
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {notif.actorName}
                        </span>
                      </div>
                    )}
                  </div>

                  {!notif.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Mark as read"
                      className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer status */}
          <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Workspace Activity Feed</span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {isOnline ? 'Synced' : 'Local'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
