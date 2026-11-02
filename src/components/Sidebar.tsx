import React from 'react';
import type { NavModule } from '../types';
import {
  LayoutDashboard,
  Send,
  Wand2,
  Users,
  FileText,
  Image,
  Tag,
  CalendarClock,
  Workflow,
  Share2,
  Search,
  KeyRound,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Radio,
  X
} from 'lucide-react';

interface SidebarProps {
  activeNav: NavModule;
  setActiveNav: (nav: NavModule) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  twilioStatus?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  mobileMenuOpen,
  setMobileMenuOpen,
  isCollapsed = false,
  setIsCollapsed,
  twilioStatus = 'CONNECTED'
}) => {
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'overview' as NavModule, label: 'Command Overview', icon: LayoutDashboard },
        { id: 'console' as NavModule, label: 'Campaign Console', icon: Send },
        { id: 'builder' as NavModule, label: 'Visual Builder', icon: Wand2, badge: 'Phase 18' },
        { id: 'audience' as NavModule, label: 'Audience Registry', icon: Users },
        { id: 'templates' as NavModule, label: 'Message Templates', icon: FileText },
        { id: 'media' as NavModule, label: 'Media Library', icon: Image, badge: 'Durable' },
        { id: 'offers' as NavModule, label: 'Offer Management', icon: Tag }
      ]
    },
    {
      title: 'AUTOMATION & ENGINES',
      items: [
        { id: 'scheduler' as NavModule, label: 'Message Scheduler', icon: CalendarClock },
        { id: 'automations' as NavModule, label: 'Follow-up Automations', icon: Workflow, badge: 'Auto' }
      ]
    },
    {
      title: 'AD NETWORKS',
      items: [
        { id: 'meta' as NavModule, label: 'Meta Campaigns', icon: Share2 },
        { id: 'google' as NavModule, label: 'Google Campaigns', icon: Search }
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'integrations' as NavModule, label: 'Integration Console', icon: KeyRound },
        { id: 'settings' as NavModule, label: 'Channel & Care Settings', icon: Sliders }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-[#E8EAF0] flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[72px]' : 'w-[230px]'}`}
      >
        {/* Brand Header */}
        <div className="h-[56px] lg:h-[60px] flex items-center justify-between px-4 border-b border-[#E8EAF0] shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-bold text-[#20283A] leading-tight tracking-tight">SMS Campaign</h1>
                <p className="text-[10px] text-[#737D90] font-medium tracking-wider uppercase">Marketing Suite</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Mobile Close */}
          <div className="flex items-center">
            {setIsCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1 text-[#737D90] hover:text-[#20283A] rounded hover:bg-[#F6F7FB] transition-colors cursor-pointer"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-[#737D90] hover:text-[#20283A] p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-semibold text-[#737D90] uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = activeNav === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      setMobileMenuOpen(false);
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold shadow-2xs'
                        : 'text-[#737D90] hover:bg-[#F7F8FC] hover:text-[#20283A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[var(--color-primary)]' : 'text-[#737D90]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[#F1F4F9] text-[#737D90]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: Gateway status & version */}
        <div className="p-3 border-t border-[#E8EAF0] bg-[#F7F8FC]/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  twilioStatus === 'CONNECTED' ? 'bg-[#16A36A] animate-pulse' : 'bg-[#E5A23B]'
                }`}
              />
              {!isCollapsed && (
                <span className="text-[11px] font-semibold text-[#20283A] truncate">
                  {twilioStatus === 'CONNECTED' ? 'Twilio Live' : 'Gateway Offline'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-[#737D90]">v2.6 Enterprise</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
