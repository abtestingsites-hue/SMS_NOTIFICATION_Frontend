import React, { useState } from 'react';
import type { InAppNotification, NavModule } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  Shield,
  Send,
  Zap,
  Sliders,
  Sparkles
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  onRefresh: () => void;
  onNavigate: (module: NavModule) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
  onNavigate
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All' },
    { id: 'CAMPAIGN', label: 'Campaigns' },
    { id: 'SYSTEM', label: 'System' },
    { id: 'SECURITY', label: 'Security' },
    { id: 'AUTOMATION', label: 'Automations' },
    { id: 'GOVERNANCE', label: 'Governance' }
  ];

  const filtered = notifications.filter((n) => {
    if (activeCategory !== 'ALL' && n.category !== activeCategory) return false;
    if (filterUnreadOnly && n.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatRelativeTime = (isoString: string): string => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(id);
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to update notification', { description: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markAllNotificationsRead();
      toast.success('All notifications marked as read', {
        description: `${res.updatedCount || 0} items updated.`
      });
      onRefresh();
    } catch (err: any) {
      toast.error('Error marking all read', { description: err.message });
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(id);
      await api.deleteNotification(id);
      toast.info('Notification dismissed');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to delete notification', { description: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all notifications from history?')) return;
    try {
      await api.clearAllNotifications();
      toast.info('Notification history cleared');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to clear notifications', { description: err.message });
    }
  };

  const handleItemClick = async (notif: InAppNotification) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.actionUrl) {
      const validModules: NavModule[] = [
        'overview',
        'console',
        'audience',
        'templates',
        'media',
        'offers',
        'scheduler',
        'automations',
        'meta',
        'google',
        'integrations',
        'settings'
      ];
      const target = notif.actionUrl.toLowerCase() as NavModule;
      if (validModules.includes(target)) {
        onNavigate(target);
        onClose();
      }
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#D94D59]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#E5A23B]" />;
      default:
        if (category === 'SECURITY') return <Shield className="w-4 h-4 text-[#5269D9]" />;
        if (category === 'CAMPAIGN') return <Send className="w-4 h-4 text-[#5269D9]" />;
        if (category === 'AUTOMATION') return <Zap className="w-4 h-4 text-[#5269D9]" />;
        if (category === 'GOVERNANCE') return <Sliders className="w-4 h-4 text-[#5269D9]" />;
        return <Info className="w-4 h-4 text-[#5269D9]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E8EAF0] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8EAF0] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEF1FC] text-[#5269D9] flex items-center justify-center relative">
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D94D59] rounded-full ring-2 ring-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#20283A]">Notifications</h2>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D94D59]/10 text-[#D94D59]">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F7F0] text-[#16A36A]">
                      All caught up
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#737D90] mt-0.5">Campaigns, automations, and gateway events</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-[#737D90] hover:text-[#5269D9] hover:bg-[#EEF1FC] transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Clear all"
                  className="p-1.5 rounded-lg text-[#737D90] hover:text-[#D94D59] hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#737D90] hover:text-[#20283A] hover:bg-[#F7F8FC] transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 border-b border-[#E8EAF0] bg-[#F7F8FC] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                    activeCategory === c.id
                      ? 'bg-white text-[#5269D9] shadow-2xs border border-[#E8EAF0]'
                      : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer shrink-0 border ${
                filterUnreadOnly
                  ? 'bg-[#EEF1FC] text-[#5269D9] border-[#5269D9]/30'
                  : 'bg-white text-[#737D90] border-[#E8EAF0] hover:text-[#20283A]'
              }`}
            >
              Unread
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8EAF0] bg-white">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 transition-colors cursor-pointer relative group flex items-start gap-3 ${
                    item.isRead ? 'bg-white hover:bg-[#F7F8FC]/60' : 'bg-[#EEF1FC]/30 hover:bg-[#EEF1FC]/50'
                  }`}
                >
                  {/* Category / Type Icon */}
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8EAF0] shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(item.type, item.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-[#20283A] truncate">{item.title}</span>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5269D9] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#737D90] shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-[#5A6478] mt-1 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E8EAF0]/40">
                      <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-[#737D90] bg-[#F7F8FC] px-1.5 py-0.5 rounded border border-[#E8EAF0]">
                        {item.category}
                      </span>

                      {item.actionUrl && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5269D9] group-hover:underline">
                          <span>View Module</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        disabled={processingId === item.id}
                        title="Mark as read"
                        className="p-1 rounded text-[#737D90] hover:text-[#5269D9] hover:bg-white border border-[#E8EAF0] shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={processingId === item.id}
                      title="Dismiss"
                      className="p-1 rounded text-[#737D90] hover:text-[#D94D59] hover:bg-white border border-[#E8EAF0] shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF1FC] text-[#5269D9] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#20283A]">No notifications</h3>
                <p className="text-xs text-[#737D90] mt-1 max-w-xs mx-auto">
                  {filterUnreadOnly
                    ? 'No unread notifications matching current filter.'
                    : 'System, campaign, and carrier events will appear here in real-time.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E8EAF0] bg-[#F7F8FC] text-center text-[10px] text-[#737D90] font-mono shrink-0">
            Persistent In-App Notification Stream · Telephony v2.6
          </div>
        </div>
      </div>
    </div>
  );
};
