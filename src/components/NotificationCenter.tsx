import React, { useState, useEffect, useRef } from 'react';
import type { InAppNotification, NavModule } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Check,
  Trash2,
  X,
  Shield,
  Send,
  Zap,
  Sliders,
  ExternalLink
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
  const [showAll, setShowAll] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside without backdrop overlay
  useEffect(() => {
    if (!isOpen) return;

    let cleanupClick: (() => void) | null = null;

    const timer = setTimeout(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Prevent closing if clicking the trigger bell in the header
        if (target.closest('[data-notification-trigger="true"]')) {
          return;
        }
        if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      cleanupClick = () => document.removeEventListener('mousedown', handleClickOutside);
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      if (cleanupClick) cleanupClick();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All' },
    { id: 'CAMPAIGN', label: 'Campaigns' },
    { id: 'SYSTEM', label: 'System' },
    { id: 'SECURITY', label: 'Security' },
    { id: 'AUTOMATION', label: 'Automations' }
  ];

  const filtered = notifications.filter((n) => {
    if (activeCategory !== 'ALL' && n.category !== activeCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // Maximum of 5 recent notifications unless "View All" is toggled
  const displayNotifications = showAll ? filtered : filtered.slice(0, 5);

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
      return 'Recent';
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProcessingId(id);
    try {
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
      await api.markAllNotificationsRead();
      toast.success('All notifications marked as read');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to mark all as read', { description: err.message });
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProcessingId(id);
    try {
      await api.deleteNotification(id);
      toast.info('Notification removed');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to remove notification', { description: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearAll = async () => {
    try {
      await api.clearAllNotifications();
      toast.info('Notification history cleared');
      setIsClearConfirmOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to clear notifications', { description: err.message });
      setIsClearConfirmOpen(false);
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
        'builder',
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
        return <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />;
      default:
        if (category === 'SECURITY') return <Shield className="w-4 h-4 text-[var(--color-primary)]" />;
        if (category === 'CAMPAIGN') return <Send className="w-4 h-4 text-[var(--color-primary)]" />;
        if (category === 'AUTOMATION') return <Zap className="w-4 h-4 text-[var(--color-primary)]" />;
        if (category === 'GOVERNANCE') return <Sliders className="w-4 h-4 text-[var(--color-primary)]" />;
        return <Info className="w-4 h-4 text-[var(--color-primary)]" />;
    }
  };

  return (
    <>
      {/* 
        COMPACT FLOATING NOTIFICATION POPUP (Phase 20.3)
        Anchored below header notification bell without covering or blurring the application.
      */}
      <div
        ref={popupRef}
        id="notification-popup-modal"
        data-notification-popup="true"
        role="dialog"
        aria-label="Notifications"
        className="fixed top-14 sm:top-16 right-3 sm:right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-24px)] max-h-[520px] bg-[var(--color-surface,#FFFFFF)] border border-[var(--color-border,#E4E8E4)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* 1. Popup Header */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 bg-[var(--color-surface)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--color-text-primary)] truncate">Notifications</h2>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-danger-light)] text-[var(--color-danger-text)] shrink-0">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-success-light)] text-[var(--color-success-text)] shrink-0">
                    All caught up
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                Campaign, carrier & system updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-hover)] transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notification popup"
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Compact Category Filter Pills */}
        <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-1 overflow-x-auto bg-[var(--color-surface-secondary)] shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0000FF] text-white shadow-2xs font-bold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 3. Scrollable Notification List (Max 5 Recent items default) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 max-h-[340px]">
          {displayNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full mx-auto bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] flex items-center justify-center">
                <Bell className="w-5 h-5 opacity-60" />
              </div>
              <div className="text-xs font-bold text-[var(--color-text-primary)]">No notifications</div>
              <p className="text-[11px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
                System, campaign, and carrier events will appear here in real-time.
              </p>
            </div>
          ) : (
            displayNotifications.map((notif) => {
              const isProcessing = processingId === notif.id;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-start gap-2.5 relative ${
                    notif.isRead
                      ? 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-80 hover:opacity-100 hover:border-[#0000FF]'
                      : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] hover:border-[#0000FF] shadow-2xs'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type, notif.category)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[9.5px] font-mono text-[var(--color-text-secondary)] shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-snug line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>

                    {/* Meta info & Action hint */}
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--color-border)] text-[9.5px] text-[var(--color-text-secondary)]">
                      <span className="uppercase font-mono tracking-wider">{notif.category}</span>
                      {notif.actionUrl && (
                        <span className="flex items-center gap-0.5 text-[#0000FF] dark:text-[#60A5FA] font-medium">
                          <span>Open</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Hover Bar */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        disabled={isProcessing}
                        title="Mark as read"
                        className="p-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[#0000FF] transition-colors"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(notif.id, e)}
                      disabled={isProcessing}
                      title="Delete notification"
                      className="p-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[#ED2939] dark:hover:text-[#FF0000] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#0000FF] group-hover:opacity-0 transition-opacity" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 4. Popup Footer */}
        {notifications.length > 0 && (
          <div className="px-3.5 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex items-center justify-between text-xs shrink-0">
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              Showing {displayNotifications.length} of {filtered.length}
            </span>

            <div className="flex items-center gap-3">
              {filtered.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs font-bold text-[#0000FF] dark:text-[#60A5FA] hover:underline cursor-pointer"
                >
                  {showAll ? 'Show 5 Recent' : `View All (${filtered.length})`}
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-[#ED2939] dark:text-[#FF0000] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Standardized Confirmation Dialog for Clear All */}
      <ConfirmationDialog
        isOpen={isClearConfirmOpen}
        title="Clear All Notifications?"
        description="Are you sure you want to remove all notification history records? This operation cannot be undone."
        confirmLabel="Clear Notifications"
        cancelLabel="Keep History"
        confirmVariant="danger"
        onConfirm={confirmClearAll}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
};
