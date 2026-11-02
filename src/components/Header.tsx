import React from 'react';
import type { NavModule, IntegrationStatusResponse } from '../types';
import { Menu, Search, Bell, ChevronRight, ShieldCheck } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  activeNav: NavModule;
  setMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  integrationStatus?: IntegrationStatusResponse | null;
  onNavigateIntegrations: () => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
}

const moduleTitles: Record<NavModule, { title: string; category: string }> = {
  overview: { title: 'Command Overview', category: 'Operations' },
  console: { title: 'Campaign Console & Dispatch', category: 'Messaging' },
  builder: { title: 'Visual Campaign Builder', category: 'Studio' },
  audience: { title: 'Audience Registry', category: 'Contacts' },
  templates: { title: 'Message Templates', category: 'Studio' },
  media: { title: 'Media Library', category: 'Assets' },
  offers: { title: 'Offer Management', category: 'Marketing' },
  scheduler: { title: 'Message Scheduler', category: 'Automation' },
  automations: { title: 'Follow-up Automations', category: 'Engines' },
  meta: { title: 'Meta Campaigns', category: 'Advertising' },
  google: { title: 'Google Campaigns', category: 'Advertising' },
  integrations: { title: 'Integration Console & Vault', category: 'Security' },
  settings: { title: 'Channel & Care Settings', category: 'Governance' }
};

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  setMobileMenuOpen,
  searchQuery,
  setSearchQuery,
  integrationStatus,
  onNavigateIntegrations,
  unreadNotificationCount = 0,
  onOpenNotifications
}) => {
  const current = moduleTitles[activeNav] || { title: 'Dashboard', category: 'Platform' };

  const isTwilioOk = integrationStatus?.twilio?.status === 'CONNECTED';
  const isMetaOk = integrationStatus?.meta?.status === 'CONNECTED';
  const isGoogleOk = integrationStatus?.google?.status === 'CONNECTED';

  return (
    <header className="sticky top-0 z-30 h-[56px] lg:h-[60px] bg-white border-b border-[#E8EAF0] px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left: Mobile Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-1.5 text-[#737D90] hover:text-[#20283A] rounded-lg hover:bg-[#F6F7FB]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#737D90]">
            <span>{current.category}</span>
            <ChevronRight className="w-3 h-3 text-[#A0AEC0]" />
            <span className="text-[#5269D9] font-semibold">{current.title}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#20283A] tracking-tight leading-tight">
            {current.title}
          </h2>
        </div>
      </div>

      {/* Right: Search, Integrations Pill, Notification & Profile */}
      <div className="flex items-center gap-3">
        {/* Universal Search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737D90] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, contacts..."
            className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#20283A] placeholder-[#737D90] focus:outline-none focus:border-[#5269D9] focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* Integration Status Badges */}
        <button
          onClick={onNavigateIntegrations}
          className="hidden sm:flex items-center gap-2 bg-[#F7F8FC] hover:bg-[#EEF1FC] border border-[#E8EAF0] px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
          title="Manage Vault & Integration Credentials"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#5269D9]" />
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#20283A]">
            <span className={`w-1.5 h-1.5 rounded-full ${isTwilioOk ? 'bg-[#16A36A]' : 'bg-[#E5A23B]'}`} />
            <span className="text-[10px] text-[#737D90]">Twilio</span>
          </div>
          <span className="text-[#E8EAF0]">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#20283A]">
            <span className={`w-1.5 h-1.5 rounded-full ${isMetaOk ? 'bg-[#16A36A]' : 'bg-slate-300'}`} />
            <span className="text-[10px] text-[#737D90]">Meta</span>
          </div>
          <span className="text-[#E8EAF0]">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#20283A]">
            <span className={`w-1.5 h-1.5 rounded-full ${isGoogleOk ? 'bg-[#16A36A]' : 'bg-slate-300'}`} />
            <span className="text-[10px] text-[#737D90]">Google</span>
          </div>
        </button>

        {/* Global Enterprise Theme Switcher */}
        <ThemeSwitcher />

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          aria-label={`Notifications (${unreadNotificationCount} unread)`}
          title={unreadNotificationCount > 0 ? `${unreadNotificationCount} unread notifications` : 'View notifications'}
          className="relative p-2 text-[#737D90] hover:text-[#20283A] rounded-lg hover:bg-[#F6F7FB] cursor-pointer transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#D94D59] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#A0AEC0] rounded-full" />
          )}
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E8EAF0]">
          <div className="w-8 h-8 rounded-full bg-[#EEF1FC] border border-[#D9E0F8] flex items-center justify-center text-[#5269D9] font-bold text-xs shadow-2xs">
            OP
          </div>
        </div>
      </div>
    </header>
  );
};
