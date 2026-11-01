import { useState, useEffect } from 'react';
import type { NavModule, IntegrationStatusResponse, Campaign, Offer, InAppNotification, MediaAsset } from './types';
import { api } from './services/api';
import { toast } from './services/toast';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotificationCenter } from './components/NotificationCenter';
import { CommandOverview } from './components/CommandOverview';
import { CampaignConsole } from './components/CampaignConsole';
import { AudienceRegistry } from './components/AudienceRegistry';
import { MessageTemplates } from './components/MessageTemplates';
import { MediaLibrary } from './components/MediaLibrary';
import { OfferManagement } from './components/OfferManagement';
import { MessageScheduler } from './components/MessageScheduler';
import { AutomationEngine } from './components/AutomationEngine';
import { MetaCampaigns } from './components/MetaCampaigns';
import { GoogleCampaigns } from './components/GoogleCampaigns';
import { IntegrationConsole } from './components/IntegrationConsole';
import { ChannelSettings } from './components/ChannelSettings';

interface TemplateStat {
  category: string;
  count: number;
}

export default function App() {
  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<NavModule>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Integrations Vault State
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatusResponse | null>(null);

  // Campaign State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // Audience & Templates State
  const [audienceCount, setAudienceCount] = useState<number>(152);
  const [template, setTemplate] = useState<string>(
    `Hi {{1}} 👋\n\n✨ *Exclusive Special Offer Just for You!* ✨\n\n{{2}}\n\n⏰ *Offer Valid Until:* {{3}}\n\nTake advantage of this limited-time opportunity today!\nFor assistance, contact customer care at {{care_number}}.\n\nReply *STOP* to opt out.`
  );
  const [attachedMedia, setAttachedMedia] = useState<MediaAsset | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStat[]>([]);

  // Offer State
  const [offers, setOffers] = useState<Offer[]>([]);

  // Gateway & Sender State
  const [platform, setPlatform] = useState<'both' | 'whatsapp' | 'sms'>('both');
  const [whatsappNumber, setWhatsappNumber] = useState('whatsapp:+17372508034');
  const [smsNumber, setSmsNumber] = useState('+17372508034');
  const [customerCareNumber, setCustomerCareNumber] = useState('+916369825386');
  const [sendToCustomerCare, setSendToCustomerCare] = useState(true);

  // Centralized Notification & Center State (Phase 15 Addendum)
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(text);
    } else {
      toast.error(text);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [list, countData] = await Promise.all([
        api.getNotifications({ limit: 50 }).catch(() => []),
        api.getUnreadNotificationCount().catch(() => ({ unreadCount: 0 }))
      ]);
      if (Array.isArray(list)) setNotifications(list);
      if (countData && typeof countData.unreadCount === 'number') {
        setUnreadNotifCount(countData.unreadCount);
      }
    } catch (e) {
      console.warn('Notifications fetch warning:', e);
    }
  };

  // Initial Data Fetching & Polling
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getTemplateStats().catch(() => []),
      api.getOffers().catch(() => []),
      api.getSettings().catch(() => ({} as any)),
      api.getIntegrationStatus().catch(() => null),
      api.getCampaigns().catch(() => []),
      api.getCustomers().catch(() => []),
      api.getNotifications({ limit: 50 }).catch(() => []),
      api.getUnreadNotificationCount().catch(() => ({ unreadCount: 0 })),
      api.getTemplate().catch(() => null)
    ]).then(([statsData, offersData, settingsData, vaultData, campaignsData, customersData, notifsData, countData, templateConfig]) => {
      if (!isMounted) return;
      if (Array.isArray(statsData)) setTemplateStats(statsData);
      if (Array.isArray(offersData)) setOffers(offersData);
      if (vaultData) setIntegrationStatus(vaultData);
      if (Array.isArray(campaignsData) && campaignsData.length > 0) setCampaigns(campaignsData);
      if (Array.isArray(customersData)) setAudienceCount(customersData.length);
      if (Array.isArray(notifsData)) setNotifications(notifsData);
      if (countData && typeof countData.unreadCount === 'number') setUnreadNotifCount(countData.unreadCount);
      if (templateConfig) {
        if (templateConfig.template) setTemplate(templateConfig.template);
        if (templateConfig.mediaAsset) setAttachedMedia(templateConfig.mediaAsset);
        if (templateConfig.channel) setPlatform(templateConfig.channel);
      }

      if (settingsData) {
        if (settingsData.customerCareNumber) setCustomerCareNumber(settingsData.customerCareNumber);
        if (settingsData.sendToCustomerCare !== undefined) setSendToCustomerCare(settingsData.sendToCustomerCare);
        if (settingsData.platform) setPlatform(settingsData.platform);
        if (settingsData.whatsappNumber) setWhatsappNumber(settingsData.whatsappNumber);
        if (settingsData.smsNumber) setSmsNumber(settingsData.smsNumber);
      }
    });

    // Background polling for persistent notifications every 8 seconds
    const interval = setInterval(fetchNotifications, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const refreshCoreData = async () => {
    try {
      const [statsData, offersData, campaignsData, customersData] = await Promise.all([
        api.getTemplateStats().catch(() => []),
        api.getOffers().catch(() => []),
        api.getCampaigns().catch(() => []),
        api.getCustomers().catch(() => [])
      ]);
      if (Array.isArray(statsData)) setTemplateStats(statsData);
      if (Array.isArray(offersData)) setOffers(offersData);
      if (Array.isArray(campaignsData) && campaignsData.length > 0) setCampaigns(campaignsData);
      if (Array.isArray(customersData)) setAudienceCount(customersData.length);
    } catch (err) {
      console.warn('Refresh note:', err);
    }
  };

  // Polling for active campaign execution
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (activeCampaign && (activeCampaign.status === 'PROCESSING' || activeCampaign.status === 'SCHEDULED')) {
      interval = setInterval(async () => {
        try {
          const data = await api.getCampaign(activeCampaign.id);
          setActiveCampaign(data);
          if (data.status === ('COMPLETED' as any) || (data.status as any) === 'PAUSED_LIMIT_REACHED') {
            clearInterval(interval);
            showToast(`Campaign #${activeCampaign.id} completed with ${data.sent} deliveries!`);
          }
        } catch (e) {
          console.error('Status polling error:', e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeCampaign]);

  // Campaign Dispatch Action
  const handleLaunchCampaign = async (params: {
    name: string;
    platform: 'both' | 'whatsapp' | 'sms';
    targetAudience: string;
    validUntil: string;
    delayHours: number;
    offerCode?: string;
    mediaId?: string;
    mediaAsset?: MediaAsset;
  }) => {
    const data = await api.startCampaign({
      name: params.name || 'Marketing Campaign',
      scheduleDelayHours: params.delayHours,
      validUntil: params.validUntil,
      targetAudience: params.targetAudience,
      customerCareNumber,
      sendToCustomerCare,
      platform: params.platform,
      template,
      mediaId: params.mediaId,
      mediaAsset: params.mediaAsset
    });

    const newCamp: Campaign = {
      id: data.campaignId,
      name: params.name || 'Marketing Campaign',
      status: params.delayHours > 0 ? 'SCHEDULED' : 'PROCESSING',
      total: 100,
      sent: 0,
      createdAt: new Date().toISOString(),
      platform: (data.platform as 'both' | 'whatsapp' | 'sms') || params.platform,
      targetAudience: params.targetAudience,
      validUntil: params.validUntil,
      mediaId: params.mediaId || null,
      mediaAsset: params.mediaAsset || null,
      mediaEnabled: Boolean(params.mediaId),
      customerCareNumber,
      sendToCustomerCare
    };

    setActiveCampaign(newCamp);
    setCampaigns(prev => [newCamp, ...prev]);
    showToast(`Campaign #${data.campaignId} enqueued for broadcast!`);
  };

  // Pre-flight Single Carrier Test
  const handleSendSingleMessage = async (recipient: string, testPlatform: 'both' | 'whatsapp' | 'sms', mediaId?: string) => {
    const data = await api.sendSingleMessage({
      recipient,
      platform: testPlatform,
      template,
      recipientName: 'Valued Client',
      mediaId
    });
    showToast(data.message || 'Single test message dispatch complete.');
    return data;
  };

  // Save Gateway & Customer Care Settings
  const handleSaveCareSettings = async (number?: string, sendCare?: boolean, chosenPlatform?: 'both' | 'whatsapp' | 'sms') => {
    try {
      await api.saveSettings({
        customerCareNumber: number !== undefined ? number : customerCareNumber,
        sendToCustomerCare: sendCare !== undefined ? sendCare : sendToCustomerCare,
        platform: chosenPlatform !== undefined ? chosenPlatform : platform
      });
      showToast('Gateway settings saved.');
    } catch (e) {
      console.error('Settings save error:', e);
      showToast('Failed to save settings', 'error');
    }
  };

  // Upload Audience CSV
  const handleUploadAudience = async (file: File) => {
    const data = await api.uploadCustomers(file);
    setAudienceCount(prev => prev + data.count);
    showToast(`Ingested ${data.count} audience records.`);
    return data;
  };

  // Upload Offers CSV
  const handleUploadOffers = async (file: File) => {
    const data = await api.uploadOffers(file);
    showToast(`Imported ${data.count} promotional offers.`);
    refreshCoreData();
  };

  // Create Single Offer
  const handleCreateOffer = async (offer: { code: string; discount: string; description?: string }) => {
    await api.createOffer(offer);
    const newOffer: Offer = {
      id: Date.now(),
      code: offer.code,
      discount: offer.discount,
      description: offer.description || 'Special Offer'
    };
    setOffers(prev => [newOffer, ...prev]);
    showToast(`Offer ${offer.code} created and live!`);
  };

  // Upload Templates File
  const handleUploadTemplates = async (file: File) => {
    await api.uploadTemplates(file);
    showToast('Templates refreshed from file.');
    refreshCoreData();
  };

  // Save Template Text & Media Settings
  const handleSaveTemplate = async (text: string, media?: MediaAsset | null, channel?: 'both' | 'whatsapp' | 'sms') => {
    await api.saveTemplate({
      template: text,
      mediaId: media?.id || null,
      mediaAsset: media || null,
      channel: channel || platform
    });
    setTemplate(text);
    if (media !== undefined) setAttachedMedia(media);
    if (channel) setPlatform(channel);
    showToast('Template and media attachments saved.');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F6F7FB] text-[#20283A] font-sans flex antialiased">
      {/* Global Centralized Toaster (Phase 15 Addendum) */}
      <Toaster position="top-right" richColors closeButton theme="light" />

      {/* Persistent Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onRefresh={fetchNotifications}
        onNavigate={(mod) => setActiveNav(mod)}
      />

      {/* 1. Global Application Sidebar (Desktop width 230px / Collapsed 72px) */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        twilioStatus={integrationStatus?.twilio?.status || 'CONNECTED'}
      />

      {/* 2. Main Shell Layout */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[230px]'}`}>
        {/* Global Top Header (Height 56-60px) */}
        <Header
          activeNav={activeNav}
          setMobileMenuOpen={setMobileMenuOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          integrationStatus={integrationStatus}
          onNavigateIntegrations={() => setActiveNav('integrations')}
          unreadNotificationCount={unreadNotifCount}
          onOpenNotifications={() => setNotificationCenterOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className={`flex-1 min-h-0 w-full mx-auto ${activeNav === 'overview' ? 'p-2.5 sm:p-3 lg:p-3 overflow-hidden flex flex-col' : 'p-4 sm:p-6 lg:p-8 overflow-y-auto'}`}>
          {/* Module 1: Command Overview Dashboard */}
          {activeNav === 'overview' && (
            <CommandOverview
              audienceCount={audienceCount}
              sentCount={campaigns.reduce((sum, c) => sum + (c.total || 0), 0) || 1240}
              templatesCount={templateStats.length || 5}
              offersCount={offers.length || 4}
              campaigns={campaigns}
              setActiveNav={setActiveNav}
              integrationStatus={integrationStatus}
              onRefresh={refreshCoreData}
            />
          )}

          {/* Module 2: Campaign Console */}
          {activeNav === 'console' && (
            <CampaignConsole
              campaigns={campaigns}
              activeCampaign={activeCampaign}
              onLaunchCampaign={handleLaunchCampaign}
              onSendSingleMessage={handleSendSingleMessage}
              customerCareNumber={customerCareNumber}
              setCustomerCareNumber={setCustomerCareNumber}
              sendToCustomerCare={sendToCustomerCare}
              setSendToCustomerCare={setSendToCustomerCare}
              platform={platform}
              setPlatform={setPlatform}
              template={template}
              offers={offers}
              setActiveNav={setActiveNav}
              onSaveCareSettings={handleSaveCareSettings}
              attachedMedia={attachedMedia}
              setAttachedMedia={setAttachedMedia}
              setTemplate={setTemplate}
            />
          )}

          {/* Module 3: Audience Registry */}
          {activeNav === 'audience' && (
            <AudienceRegistry
              audienceCount={audienceCount}
              onUploadCsv={handleUploadAudience}
            />
          )}

          {/* Module 4: Message Templates */}
          {activeNav === 'templates' && (
            <MessageTemplates
              template={template}
              setTemplate={setTemplate}
              templateStats={templateStats}
              onUploadTemplates={handleUploadTemplates}
              onSaveTemplate={handleSaveTemplate}
              customerCareNumber={customerCareNumber}
              attachedMedia={attachedMedia}
              setAttachedMedia={setAttachedMedia}
              selectedChannel={platform}
              setSelectedChannel={setPlatform}
            />
          )}

          {/* Module 5: Media Library */}
          {activeNav === 'media' && <MediaLibrary />}

          {/* Module 6: Offer Management */}
          {activeNav === 'offers' && (
            <OfferManagement
              offers={offers}
              onCreateOffer={handleCreateOffer}
              onUploadOffersCsv={handleUploadOffers}
            />
          )}

          {/* Module 7: Message Scheduler */}
          {activeNav === 'scheduler' && <MessageScheduler />}

          {/* Module 8: Follow-up Automations */}
          {activeNav === 'automations' && <AutomationEngine />}

          {/* Module 9: Meta Campaigns */}
          {activeNav === 'meta' && <MetaCampaigns />}

          {/* Module 10: Google Campaigns */}
          {activeNav === 'google' && <GoogleCampaigns />}

          {/* Module 11: Integration Console */}
          {activeNav === 'integrations' && <IntegrationConsole />}

          {/* Module 12: Channel & Care Settings */}
          {activeNav === 'settings' && (
            <ChannelSettings
              whatsappNumber={whatsappNumber}
              smsNumber={smsNumber}
              customerCareNumber={customerCareNumber}
              setCustomerCareNumber={setCustomerCareNumber}
              sendToCustomerCare={sendToCustomerCare}
              setSendToCustomerCare={setSendToCustomerCare}
              platform={platform}
              onSaveCareSettings={handleSaveCareSettings}
            />
          )}
        </main>

        {/* Minimal Enterprise Footer (Visible on sub-modules) */}
        {activeNav !== 'overview' && (
          <footer className="mt-auto border-t border-[#E8EAF0] bg-white py-3 px-6 text-xs text-[#737D90] shrink-0">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="font-medium">SMS Campaign System · Enterprise Marketing Operations Suite</p>
              <p className="text-[11px] font-mono text-[#A0AEC0]">Telephony Core v2.6 · Powered by Twilio, Meta & Google APIs</p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
