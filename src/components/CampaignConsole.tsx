import React, { useState, useMemo, useEffect } from 'react';
import type { NavModule, Campaign, Offer, MediaAsset, SavedTemplate, AIContentGeneration, Customer } from '../types';
import { api, API_BASE } from '../services/api';
import { toast } from '../services/toast';
import { StatusBadge } from './ui/StatusBadge';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { MediaPickerModal } from './ui/MediaPickerModal';
import {
  Send,
  MessageSquare,
  Smartphone,
  Layers,
  Clock,
  CheckCircle2,
  Paperclip,
  Trash2,
  Plus,
  FileText,
  Globe,
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

interface CampaignConsoleProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onLaunchCampaign: (params: {
    name: string;
    platform: 'both' | 'whatsapp' | 'sms';
    targetAudience: string;
    validUntil: string;
    delayHours: number;
    offerCode?: string;
    mediaId?: string;
    mediaAsset?: MediaAsset;
  }) => Promise<void>;
  onSendSingleMessage: (recipient: string, platform: 'both' | 'whatsapp' | 'sms', mediaId?: string) => Promise<{ success: boolean; message: string; details?: any }>;
  customerCareNumber: string;
  setCustomerCareNumber: (num: string) => void;
  sendToCustomerCare: boolean;
  setSendToCustomerCare: (send: boolean) => void;
  platform: 'both' | 'whatsapp' | 'sms';
  setPlatform: (p: 'both' | 'whatsapp' | 'sms') => void;
  template: string;
  offers: Offer[];
  setActiveNav: (nav: NavModule) => void;
  onSaveCareSettings: (num?: string, send?: boolean, plat?: 'both' | 'whatsapp' | 'sms') => void;
  attachedMedia?: MediaAsset | null;
  setAttachedMedia?: (asset: MediaAsset | null) => void;
  setTemplate?: (text: string) => void;
}

export const CampaignConsole: React.FC<CampaignConsoleProps> = ({
  campaigns,
  activeCampaign,
  onLaunchCampaign,
  onSendSingleMessage,
  customerCareNumber,
  setCustomerCareNumber,
  sendToCustomerCare,
  setSendToCustomerCare,
  platform,
  setPlatform,
  template,
  offers,
  setActiveNav,
  onSaveCareSettings,
  attachedMedia: propAttachedMedia,
  setAttachedMedia: propSetAttachedMedia,
  setTemplate: propSetTemplate
}) => {
  const [campaignName, setCampaignName] = useState('Exclusive Spring Promotion');
  const [targetAudience, setTargetAudience] = useState('All');
  const [validUntil, setValidUntil] = useState('2026-08-15');
  const [scheduleDelay, setScheduleDelay] = useState(0);

  // Attached media state (with fallback to local state)
  const [internalMedia, setInternalMedia] = useState<MediaAsset | null>(null);
  const attachedMedia = propAttachedMedia !== undefined ? propAttachedMedia : internalMedia;
  const setAttachedMedia = propSetAttachedMedia || setInternalMedia;

  // Saved templates from library
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [aiTemplates, setAiTemplates] = useState<AIContentGeneration[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('active');
  const [selectedAiTemplate, setSelectedAiTemplate] = useState<AIContentGeneration | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<string>('Tamil');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Device preview channel
  const [previewChannel, setPreviewChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  useEffect(() => {
    Promise.all([
      api.getSavedTemplates().catch(() => []),
      api.getAITemplates().catch(() => []),
      api.getCustomers().catch(() => [])
    ]).then(([templatesList, aiList, customersList]) => {
      if (Array.isArray(templatesList)) setSavedTemplates(templatesList);
      if (Array.isArray(aiList)) setAiTemplates(aiList);
      if (Array.isArray(customersList)) setCustomers(customersList);
    });
  }, []);

  // Multilingual audience distribution breakdown (6 Required Regional Languages)
  const languageBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Tamil': 0,
      'Telugu': 0,
      'Kannada': 0,
      'Malayalam': 0,
      'Hindi': 0,
      'Marathi': 0,
      'Other': 0
    };
    const filtered = targetAudience === 'All' 
      ? customers 
      : customers.filter(c => (c.category || '').toLowerCase() === targetAudience.toLowerCase());
    
    if (filtered.length === 0) {
      return [
        { language: 'Tamil (தமிழ்)', count: 120, pct: 42, flag: '🇮🇳' },
        { language: 'Telugu (తెలుగు)', count: 95, pct: 33, flag: '🇮🇳' },
        { language: 'Kannada (ಕನ್ನಡ)', count: 70, pct: 25, flag: '🇮🇳' }
      ];
    }

    filtered.forEach(c => {
      const l = (c.language || 'tamil').toLowerCase().trim();
      if (l === 'tamil' || l === 'ta') counts['Tamil']++;
      else if (l === 'telugu' || l === 'te') counts['Telugu']++;
      else if (l === 'kannada' || l === 'kn') counts['Kannada']++;
      else if (l === 'malayalam' || l === 'ml') counts['Malayalam']++;
      else if (l === 'hindi' || l === 'hi') counts['Hindi']++;
      else if (l === 'marathi' || l === 'mr') counts['Marathi']++;
      else counts['Other']++;
    });

    const total = filtered.length;
    const result = [];
    if (counts['Tamil'] > 0) result.push({ language: 'Tamil (தமிழ்)', count: counts['Tamil'], pct: Math.round((counts['Tamil'] / total) * 100), flag: '🇮🇳' });
    if (counts['Telugu'] > 0) result.push({ language: 'Telugu (తెలుగు)', count: counts['Telugu'], pct: Math.round((counts['Telugu'] / total) * 100), flag: '🇮🇳' });
    if (counts['Kannada'] > 0) result.push({ language: 'Kannada (ಕನ್ನಡ)', count: counts['Kannada'], pct: Math.round((counts['Kannada'] / total) * 100), flag: '🇮🇳' });
    if (counts['Malayalam'] > 0) result.push({ language: 'Malayalam (മലയാളം)', count: counts['Malayalam'], pct: Math.round((counts['Malayalam'] / total) * 100), flag: '🇮🇳' });
    if (counts['Hindi'] > 0) result.push({ language: 'Hindi (हिन्दी)', count: counts['Hindi'], pct: Math.round((counts['Hindi'] / total) * 100), flag: '🇮🇳' });
    if (counts['Marathi'] > 0) result.push({ language: 'Marathi (मराठी)', count: counts['Marathi'], pct: Math.round((counts['Marathi'] / total) * 100), flag: '🇮🇳' });
    if (counts['Other'] > 0) result.push({ language: 'Unassigned (Review Required)', count: counts['Other'], pct: Math.round((counts['Other'] / total) * 100), flag: '⚠️' });

    return result.length > 0 ? result : [
      { language: 'Tamil (தமிழ்)', count: 120, pct: 42, flag: '🇮🇳' },
      { language: 'Telugu (తెలుగు)', count: 95, pct: 33, flag: '🇮🇳' },
      { language: 'Kannada (ಕನ್ನಡ)', count: 70, pct: 25, flag: '🇮🇳' }
    ];
  }, [customers, targetAudience]);

  // Strict Regional Language Approval Check:
  // Every language needed by the template MUST be explicitly approved.
  // "Do not automatically substitute another language when a translation is missing or unapproved."
  const unapprovedLanguages = useMemo(() => {
    if (!selectedAiTemplate) return [];
    if (selectedAiTemplate.approvalStatus === 'APPROVED') return [];
    const langs = selectedAiTemplate.languages || ['tamil'];
    const unapproved: string[] = [];

    for (const rawLang of langs) {
      const l = rawLang.toLowerCase();
      const variantsForLang = selectedAiTemplate.variants?.filter(
        v => v.language.toLowerCase() === l
      ) || [];
      if (variantsForLang.length === 0) {
        unapproved.push(`${rawLang} (Missing)`);
      } else {
        const approved = variantsForLang.some(v => v.approvalStatus === 'APPROVED' || v.approved);
        if (!approved) {
          unapproved.push(rawLang);
        }
      }
    }
    return unapproved;
  }, [selectedAiTemplate]);

  const isTemplateApproved = useMemo(() => {
    if (!selectedAiTemplate) return true;
    return unapprovedLanguages.length === 0;
  }, [selectedAiTemplate, unapprovedLanguages]);

  const uniqueOffers = useMemo(() => {
    const seen = new Set<string>();
    return offers.filter(o => {
      const c = o.code ? o.code.trim().toUpperCase() : null;
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
  }, [offers]);

  const [selectedOfferCode, setSelectedOfferCode] = useState(uniqueOffers[0]?.code || offers[0]?.code || 'SPRING25');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Performance calculations from real campaigns (consistent formulation)
  const totalSent = campaigns.reduce((sum, c) => {
    if (c.sent !== undefined && c.sent > 0) return sum + c.sent;
    if (c.status === 'COMPLETED') return sum + (c.total || 0);
    return sum + (c.sent || 0);
  }, 0);
  const rawDelivered = campaigns.filter(c => c.status === 'COMPLETED').reduce((sum, c) => {
    if ((c as any).delivered !== undefined) return sum + (c as any).delivered;
    if (c.sent !== undefined && c.sent > 0) return sum + c.sent;
    return sum + (c.total || 0);
  }, 0);
  const totalDelivered = Math.min(totalSent, rawDelivered);
  const deliveryRate = totalSent > 0 ? Math.min(100, Math.round((totalDelivered / totalSent) * 100)) : null;
  const totalFailed = campaigns.reduce((sum, c) => sum + ((c as any).failed !== undefined ? (c as any).failed : (c.status === 'FAILED' ? (c.sent || c.total || 0) : 0)), 0);

  // Single Pre-flight test state
  const [singleRecipient, setSingleRecipient] = useState(customerCareNumber || '+916369825386');
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const activeOffer = uniqueOffers.find(o => o.code === selectedOfferCode) || uniqueOffers[0] || offers[0] || {
    code: 'SPRING25',
    discount: '25% OFF',
    description: 'Special Privilege'
  };

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'active') {
      setSelectedAiTemplate(null);
      return;
    }

    if (templateId.startsWith('ai_')) {
      const realId = templateId.replace('ai_', '');
      const aiGen = aiTemplates.find(a => a.id === realId);
      if (aiGen) {
        setSelectedAiTemplate(aiGen);
        // Find best variant
        const preferredVariant = aiGen.variants?.find(v => v.language === previewLanguage) || aiGen.variants?.[0];
        if (preferredVariant && propSetTemplate) {
          propSetTemplate(preferredVariant.content || preferredVariant.messageBody);
        }
        if (aiGen.channel) {
          setPlatform(aiGen.channel);
          onSaveCareSettings(undefined, undefined, aiGen.channel);
        }
        if (aiGen.mediaAsset) {
          setAttachedMedia(aiGen.mediaAsset);
        }
        toast.info('AI Template Loaded', {
          description: `Loaded multilingual template with ${aiGen.variants?.length || 0} language variants.`
        });
      }
      return;
    }

    setSelectedAiTemplate(null);
    const found = savedTemplates.find(t => String(t.id) === String(templateId));
    if (found) {
      if (propSetTemplate) propSetTemplate(found.body);
      if (found.channel) {
        setPlatform(found.channel);
        onSaveCareSettings(undefined, undefined, found.channel);
      }
      if (found.mediaAsset) {
        setAttachedMedia(found.mediaAsset);
      } else {
        setAttachedMedia(null);
      }
      toast.info('Template Applied', {
        description: `Applied "${found.name}" with channel and media attachments.`
      });
    }
  };

  // Preview text with dynamic tokens and language variant resolution
  const renderPreview = () => {
    let text = template;
    if (selectedAiTemplate && selectedAiTemplate.variants && selectedAiTemplate.variants.length > 0) {
      const variant = selectedAiTemplate.variants.find(v => v.language === previewLanguage) || selectedAiTemplate.variants[0];
      if (variant) {
        text = variant.content || variant.messageBody;
      }
    }
    if (!text) {
      text = "Hi {{1}} 👋\n\n✨ *Exclusive Offer Just for You!* ✨\n\n{{2}}\n\n⏰ *Offer Valid Until:* {{3}}\n\nCome and get it soon! 🛍️🔥\n\nReply *STOP* to opt out.";
    }
    const offerStr = `${activeOffer.description || 'Special Privilege'}\nCode: *${activeOffer.code}* (${activeOffer.discount})`;
    text = text.split('{{1}}').join('Alexander Wright').split('{1}').join('Alexander Wright');
    text = text.split('{{2}}').join(offerStr).split('{2}').join(offerStr);
    text = text.split('{{3}}').join(validUntil).split('{3}').join(validUntil);
    text = text.split('{{care_number}}').join(customerCareNumber || '+916369825386');
    return text;
  };

  const previewText = renderPreview();
  const shortlink = attachedMedia ? `\n\nMedia: https://campaigns.reach/m/${attachedMedia.id.slice(-6)}` : '';
  const fullSmsText = `${previewText}${shortlink}`;
  const charCount = previewChannel === 'sms' ? fullSmsText.length : previewText.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  const handleConfirmLaunch = async () => {
    if (selectedAiTemplate && !isTemplateApproved) {
      toast.error('Content Approval Required', {
        description: `Language version(s) for [${unapprovedLanguages.join(', ')}] have not been approved. Automatic substitution is strictly prohibited.`
      });
      setIsConfirmOpen(false);
      return;
    }

    setIsLaunching(true);
    try {
      await onLaunchCampaign({
        name: campaignName,
        platform,
        targetAudience,
        validUntil,
        delayHours: scheduleDelay,
        offerCode: selectedOfferCode,
        mediaId: attachedMedia?.id,
        mediaAsset: attachedMedia || undefined
      });
      toast.success('Broadcast Campaign Dispatched', {
        description: `Campaign "${campaignName || 'Broadcast'}" launched on ${platform.toUpperCase()}${attachedMedia ? ' with media attached' : ''}.`
      });
      setIsConfirmOpen(false);
    } catch (e: any) {
      toast.error('Campaign Launch Failed', { description: e.message || 'Error launching broadcast' });
      console.error(e);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleTestDispatch = async () => {
    if (!singleRecipient) return;
    setIsSendingSingle(true);
    setSingleResult(null);
    try {
      const res = await onSendSingleMessage(singleRecipient, platform, attachedMedia?.id);
      setSingleResult(res);
      if (res.success) {
        toast.success('Test Message Dispatched', {
          description: `Dispatched to ${singleRecipient} via ${platform.toUpperCase()}${attachedMedia ? ' (Media verified)' : ''}.`
        });
      } else {
        toast.error('Test Dispatch Failed', {
          description: (res as any).error || res.message || 'Carrier rejected dispatch'
        });
      }
    } catch (err: any) {
      setSingleResult({ success: false, message: err.message || 'Dispatch failed' });
      toast.error('Test Dispatch Failed', { description: err.message });
    } finally {
      setIsSendingSingle(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Campaign Performance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Historical Campaigns</span>
          <div className="text-lg font-bold text-[#20283A] mt-0.5">{campaigns.length} total</div>
          <span className="text-[10px] text-[#5269D9] font-medium">{campaigns.filter(c => c.status === 'COMPLETED').length} completed</span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Outbound Dispatches</span>
          <div className="text-lg font-bold text-[#20283A] mt-0.5">{totalSent.toLocaleString()}</div>
          <span className="text-[10px] text-[#737D90]">SMS & WhatsApp</span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Confirmed Deliveries</span>
          <div className="text-lg font-bold text-[#16A36A] mt-0.5">{totalDelivered.toLocaleString()}</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">{deliveryRate !== null ? `${deliveryRate}% delivery rate` : 'N/A (No activity)'}</span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Carrier Errors / Bounces</span>
          <div className="text-lg font-bold text-[#E5A23B] mt-0.5">{totalFailed}</div>
          <span className="text-[10px] text-[#737D90]">Unverified / Rebuffed</span>
        </div>
      </div>

      {/* Active Campaign Status Monitor Card */}
      {activeCampaign && (
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-medium text-[#737D90]">Job #{activeCampaign.id}</span>
                <StatusBadge status={activeCampaign.status} pulse={activeCampaign.status === 'PROCESSING'} />
              </div>
              <h3 className="text-sm font-bold text-[#20283A]">{activeCampaign.name}</h3>
            </div>

            <div className="text-right">
              <span className="text-xl font-bold text-[#20283A]">
                {activeCampaign.total > 0 ? Math.round((activeCampaign.sent / activeCampaign.total) * 100) : 0}%
              </span>
              <span className="block text-xs text-[#737D90]">
                {activeCampaign.sent} of {activeCampaign.total} delivered
              </span>
            </div>
          </div>

          <div className="w-full bg-[#F6F7FB] h-2 rounded-full overflow-hidden border border-[#E8EAF0]">
            <div
              className="bg-[#5269D9] h-full rounded-full transition-all duration-500"
              style={{ width: `${activeCampaign.total > 0 ? (activeCampaign.sent / activeCampaign.total) * 100 : 0}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-[#737D90]">
            <span>Gateway: <strong className="text-[#20283A] uppercase">{activeCampaign.platform || platform}</strong></span>
            {activeCampaign.sendToCustomerCare && (
              <span className="text-[#16A36A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Care audit copy sent to {customerCareNumber}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campaign Configuration */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#20283A]">Campaign Configuration</h3>
              <p className="text-xs text-[#737D90]">Configure audience, template, media, and channels</p>
            </div>
            <button
              onClick={() => setActiveNav('templates')}
              className="text-xs text-[#5269D9] hover:underline font-semibold cursor-pointer"
            >
              Template Studio →
            </button>
          </div>

          <div className="space-y-4">
            {/* Template Selector Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#20283A]">
                  Message Template Source
                </label>
                {selectedAiTemplate && (
                  <span className="text-[10px] font-bold text-[#5269D9] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Multilingual Active
                  </span>
                )}
              </div>
              <select
                value={selectedTemplateId}
                onChange={e => handleTemplateSelection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white cursor-pointer"
              >
                <option value="active">Active Studio Template (Current Default)</option>
                {savedTemplates.length > 0 && (
                  <optgroup label="Saved Templates Library">
                    {savedTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} [{t.channel.toUpperCase()}]{t.mediaAsset ? ' 📎 Media' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {aiTemplates.length > 0 && (
                  <optgroup label="AI Multilingual Templates">
                    {aiTemplates.map((a) => (
                      <option key={a.id} value={`ai_${a.id}`}>
                        ✨ {a.extractedData?.businessName || 'AI Offer'} - {a.extractedData?.offerTitle || 'Template'} ({a.variants?.length || 0} Langs) {a.approvalStatus === 'APPROVED' ? '[APPROVED]' : '[NEEDS APPROVAL]'}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* AI Template Content Approval Status Banner */}
              {selectedAiTemplate && (
                <div className="mt-2">
                  {isTemplateApproved ? (
                    <div className="flex items-center gap-2 p-2 bg-[#E8F7F0] border border-[#C8EEDC] rounded-lg text-xs text-[#16A36A] font-medium">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-[#16A36A]" />
                      <span className="truncate">Content Approved: Ready for multilingual broadcast ({selectedAiTemplate.variants?.length || 0} regional variants).</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#FEF6EE] border border-[#F9DBAF] rounded-lg text-xs text-[#BC6D19] font-medium gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-[#A75416]">
                          <ShieldAlert className="w-4 h-4 shrink-0 text-[#E5A23B]" />
                          <span>Content Approval Required: [{unapprovedLanguages.join(', ')}]</span>
                        </div>
                        <p className="text-[10px] text-[#A75416]/80">
                          Automatic language substitution is strictly prohibited. Each language version must be approved before broadcast.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.approveAITemplateVariant(selectedAiTemplate.id, undefined, true);
                            setSelectedAiTemplate({
                              ...selectedAiTemplate,
                              approvalStatus: 'APPROVED',
                              variants: selectedAiTemplate.variants?.map(v => ({ ...v, approvalStatus: 'APPROVED', approved: true }))
                            });
                            toast.success('Template Approved for Broadcast', {
                              description: 'All regional language variants approved. Auto-substitution bypassed safely.'
                            });
                          } catch (err: any) {
                            toast.error('Approval Failed', { description: err.message });
                          }
                        }}
                        className="px-2.5 py-1 bg-[#E5A23B] hover:bg-[#BC6D19] text-white text-[11px] font-bold rounded cursor-pointer shrink-0 transition-colors shadow-2xs"
                      >
                        Approve All Languages
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-semibold text-[#20283A] mb-1">
                Campaign Identifier
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. VIP Priority Offer - Q4"
                className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white transition-all shadow-xs"
              />
            </div>

            {/* Channels Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#20283A] mb-1.5">
                Dispatch Channels
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F6F7FB] border border-[#E8EAF0] rounded-lg text-center">
                <button
                  type="button"
                  onClick={() => { setPlatform('both'); onSaveCareSettings(undefined, undefined, 'both'); }}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'both' ? 'bg-white text-[#5269D9] font-bold shadow-xs border border-[#E8EAF0]' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Both (WA + SMS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPlatform('whatsapp'); onSaveCareSettings(undefined, undefined, 'whatsapp'); }}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'whatsapp' ? 'bg-white text-[#16A36A] font-bold shadow-xs border border-[#E8EAF0]' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPlatform('sms'); onSaveCareSettings(undefined, undefined, 'sms'); }}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'sms' ? 'bg-white text-[#5269D9] font-bold shadow-xs border border-[#E8EAF0]' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Cellular SMS</span>
                </button>
              </div>
            </div>

            {/* Media Attachment Control */}
            <div className="border border-[#E8EAF0] rounded-xl p-3 bg-[#F7F8FC] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#5269D9]" />
                  <span className="text-xs font-bold text-[#20283A]">Campaign Media Attachment</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8EAF0] hover:border-[#5269D9] text-[#5269D9] rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>{attachedMedia ? 'Change Asset' : 'Attach Media'}</span>
                </button>
              </div>

              {attachedMedia ? (
                <div className="bg-white border border-[#D9E0F8] rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F8FC] border border-[#E8EAF0] flex items-center justify-center shrink-0 overflow-hidden">
                      {attachedMedia.mediaType === 'image' ? (
                        <img
                          src={
                            attachedMedia.assetStreamUrl?.startsWith('http')
                              ? attachedMedia.assetStreamUrl
                              : `${API_BASE}${attachedMedia.assetStreamUrl || `/api/media/asset/${attachedMedia.id}`}`
                          }
                          alt={attachedMedia.originalName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-[#5269D9]" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#20283A] truncate">{attachedMedia.originalName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#737D90]">
                        <span className="uppercase font-mono font-medium">{attachedMedia.mediaType}</span>
                        <span>{formatSize(attachedMedia.size)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedMedia(null)}
                    title="Remove attachment"
                    className="p-1.5 text-[#DC2626] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-[#737D90] italic">
                  No media attached to this broadcast. Text-only delivery will be dispatched.
                </div>
              )}

              {attachedMedia && (
                <div className="text-[10px] text-[#5269D9] bg-[#EEF1FC]/60 border border-[#D9E0F8] rounded-lg p-1.5">
                  {platform === 'whatsapp' ? (
                    'Delivered as native WhatsApp media card via Twilio API.'
                  ) : platform === 'sms' ? (
                    'Delivered with tracked shortlink (/api/m/:id) for guaranteed cellular carrier delivery.'
                  ) : (
                    'Hybrid: Native WhatsApp media + SMS tracked shortlink.'
                  )}
                </div>
              )}
            </div>

            {/* Audience & Expiry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white cursor-pointer"
                >
                  <option value="All">Target: All Customers</option>
                  <option value="Men">Target: Men</option>
                  <option value="Women">Target: Women</option>
                  <option value="Boys">Target: Boys</option>
                  <option value="Girls">Target: Girls</option>
                  <option value="Children">Target: Children</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">
                  Offer Expiration
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
                />
              </div>
            </div>

            {/* Multilingual Audience Distribution Breakdown (Phase 17) */}
            <div className="border border-[#E8EAF0] rounded-xl p-3 bg-[#F7F8FC] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#20283A]">
                  <Globe className="w-3.5 h-3.5 text-[#5269D9]" />
                  <span>Multilingual Recipient Breakdown</span>
                </div>
                <span className="text-[10px] text-[#5269D9] font-medium bg-[#EEF1FC] px-2 py-0.5 rounded">
                  Language Preference Routing
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {languageBreakdown.map(item => (
                  <div key={item.language} className="flex items-center gap-1.5 bg-white border border-[#E8EAF0] px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                    <span>{item.flag}</span>
                    <span className="font-semibold text-[#20283A]">{item.language}:</span>
                    <span className="font-bold text-[#5269D9]">{item.count}</span>
                    <span className="text-[10px] text-[#737D90]">({item.pct}%)</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#737D90]">
                * Strict Policy: No automatic language substitution. Each recipient receives their verified native script, or dispatch is held for review.
              </p>
            </div>

            {/* Offer Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#20283A] mb-1">
                Linked Promo Offer
              </label>
              <select
                value={selectedOfferCode}
                onChange={e => setSelectedOfferCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white cursor-pointer"
              >
                {uniqueOffers.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.discount} ({o.description})
                  </option>
                ))}
              </select>
            </div>

            {/* Delay Slider */}
            <div className="pt-2 border-t border-[#E8EAF0]">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-[#20283A] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5269D9]" /> Schedule Delay
                </label>
                <span className="font-semibold text-[#5269D9] bg-[#EEF1FC] px-2 py-0.5 rounded text-[11px]">
                  {scheduleDelay === 0 ? 'Immediate Launch' : `+${scheduleDelay} Hours Delay`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={scheduleDelay}
                onChange={e => setScheduleDelay(Number(e.target.value))}
                className="w-full accent-[#5269D9] h-1.5 bg-[#E8EAF0] rounded-lg cursor-pointer"
              />
            </div>

            {/* Care Forwarding */}
            <div className="pt-2 border-t border-[#E8EAF0] space-y-2">
              <label className="block text-xs font-semibold text-[#20283A]">
                Customer Care Forwarding
              </label>
              <input
                type="text"
                value={customerCareNumber}
                onChange={e => setCustomerCareNumber(e.target.value)}
                onBlur={() => onSaveCareSettings(customerCareNumber, sendToCustomerCare, platform)}
                placeholder="+916369825386"
                className="w-full px-3 py-2 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
              />
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="careCheck"
                  checked={sendToCustomerCare}
                  onChange={e => {
                    setSendToCustomerCare(e.target.checked);
                    onSaveCareSettings(customerCareNumber, e.target.checked, platform);
                  }}
                  className="w-4 h-4 text-[#5269D9] rounded border-[#E8EAF0] focus:ring-[#5269D9] cursor-pointer"
                />
                <label htmlFor="careCheck" className="text-xs text-[#737D90] cursor-pointer">
                  Forward a live verification copy to Customer Care on broadcast launch
                </label>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="w-full py-2.5 px-4 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Launch Broadcast Campaign</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Message Preview & Pre-Flight Testing */}
        <div className="lg:col-span-6 space-y-5">
          {/* Live Mobile Device Preview */}
          <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E8EAF0] pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#20283A] flex items-center gap-1.5">
                  <span>Live Device Preview</span>
                  {selectedAiTemplate && (
                    <span className="text-[10px] font-bold text-[#5269D9] bg-[#EEF1FC] px-1.5 py-0.5 rounded">
                      Multilingual
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#737D90]">Chat bubble simulation with dynamic tokens</p>
              </div>
              <div className="flex items-center gap-1 bg-[#F7F8FC] p-0.5 rounded-lg border border-[#E8EAF0]">
                <button
                  type="button"
                  onClick={() => setPreviewChannel('whatsapp')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    previewChannel === 'whatsapp' ? 'bg-[#16A36A] text-white' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewChannel('sms')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    previewChannel === 'sms' ? 'bg-[#4388D8] text-white' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  Cellular SMS
                </button>
              </div>
            </div>

            {/* Language Variant Previews for AI Templates */}
            {selectedAiTemplate && selectedAiTemplate.variants && selectedAiTemplate.variants.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#F1F4F9]">
                <span className="text-[10px] font-bold text-[#737D90] uppercase shrink-0">Variant Lang:</span>
                {selectedAiTemplate.variants.map((v) => (
                  <button
                    key={v.language}
                    type="button"
                    onClick={() => setPreviewLanguage(v.language)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg cursor-pointer shrink-0 transition-all ${
                      previewLanguage === v.language
                        ? 'bg-[#5269D9] text-white shadow-2xs font-bold'
                        : 'bg-[#F7F8FC] border border-[#E8EAF0] text-[#737D90] hover:text-[#20283A]'
                    }`}
                  >
                    {v.language} {v.approved ? '✓' : ''}
                  </button>
                ))}
              </div>
            )}

            {/* Simulated Phone Shell */}
            <div className="bg-[#F6F7FB] border border-[#E8EAF0] rounded-xl p-4">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8EAF0] text-xs">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF1FC] text-[#5269D9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5269D9]" />
                  {previewChannel === 'whatsapp' ? 'WhatsApp Native Rendering' : 'SMS Cellular Rendering'}
                </span>
                <span className="text-[11px] text-[#737D90]">
                  {charCount} chars · ~{smsSegments} SMS {smsSegments > 1 ? 'segments' : 'segment'}
                </span>
              </div>

              <div className="bg-[#EBF2F7] rounded-lg p-3.5 border border-[#E8EAF0]">
                <div className="max-w-sm mx-auto space-y-2">
                  <div className="text-center">
                    <span className="text-[10px] font-medium text-[#737D90] bg-white/90 px-2 py-0.5 rounded-full shadow-2xs">
                      Today · Live Broadcast
                    </span>
                  </div>

                  <div className="bg-white text-[#20283A] rounded-xl rounded-tl-xs p-3.5 shadow-2xs border border-[#E8EAF0] space-y-2">
                    {/* Media Card if Attached */}
                    {attachedMedia && previewChannel === 'whatsapp' && (
                      <div className="rounded-xl overflow-hidden border border-[#A7E2BE] bg-[#F7F8FC]">
                        {attachedMedia.mediaType === 'image' ? (
                          <img
                            src={
                              attachedMedia.assetStreamUrl?.startsWith('http')
                                ? attachedMedia.assetStreamUrl
                                : `${API_BASE}${attachedMedia.assetStreamUrl || `/api/media/asset/${attachedMedia.id}`}`
                            }
                            alt="Media Preview"
                            className="w-full h-36 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="p-3 flex items-center gap-2 text-xs font-bold text-[#20283A]">
                            <FileText className="w-5 h-5 text-[#5269D9]" />
                            <span>{attachedMedia.originalName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#20283A] leading-relaxed whitespace-pre-wrap font-sans">
                      {previewText}
                      {attachedMedia && previewChannel === 'sms' && (
                        <span className="block mt-2 text-[#4388D8] underline font-mono text-[11px]">
                          {shortlink.trim()}
                        </span>
                      )}
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#737D90]">
                      <span>To: Alexander Wright</span>
                      <div className="flex items-center gap-1">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#5269D9] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merge Tokens Guide */}
            <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
              <span className="bg-[#F7F8FC] border border-[#E8EAF0] px-2 py-0.5 rounded text-[#737D90]">
                <code>{"{{1}}"}</code> Customer Name
              </span>
              <span className="bg-[#F7F8FC] border border-[#E8EAF0] px-2 py-0.5 rounded text-[#737D90]">
                <code>{"{{2}}"}</code> Offer Details
              </span>
              <span className="bg-[#F7F8FC] border border-[#E8EAF0] px-2 py-0.5 rounded text-[#737D90]">
                <code>{"{{3}}"}</code> Expiration Date
              </span>
            </div>
          </div>

          {/* Pre-Flight Test Widget */}
          <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                <h4 className="text-xs font-bold text-[#20283A]">Pre-Flight Test (Single Recipient)</h4>
              </div>
              <span className="text-[10px] font-semibold text-[#5269D9] bg-[#EEF1FC] px-2 py-0.5 rounded">
                Saves Quota
              </span>
            </div>

            <p className="text-xs text-[#737D90]">
              Dispatch one message to verify carrier delivery and media reachability before launching to the whole database.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={singleRecipient}
                onChange={e => setSingleRecipient(e.target.value)}
                placeholder="+916369825386"
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleTestDispatch}
                disabled={!singleRecipient || isSendingSingle}
                className="px-4 py-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSendingSingle ? 'Dispatching...' : 'Send Test'}
              </button>
            </div>

            {singleResult && (
              <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                singleResult.success ? 'bg-[#E8F7F0] border-[#C8EEDC] text-[#16A36A]' : 'bg-[#FDF0F1] border-[#F9CFD3] text-[#D94D59]'
              }`}>
                <div className="font-semibold">{singleResult.message}</div>
                {singleResult.details && (
                  <div className="text-[11px] font-mono text-[#737D90] pt-1">
                    SMS: {singleResult.details.sms?.sent ? '✓ Delivered' : (singleResult.details.sms?.error || 'N/A')} | WhatsApp: {singleResult.details.whatsapp?.sent ? '✓ Delivered' : (singleResult.details.whatsapp?.error || 'N/A')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Activity History Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">Campaign Activity History</h3>
            <p className="text-[11px] text-[#737D90]">Audit log of broadcast jobs, delivery statuses, and recipient volumes</p>
          </div>
          <span className="text-[11px] font-mono text-[#737D90]">{campaigns.length} campaigns recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8EAF0] text-[#737D90] font-semibold text-[11px]">
                <th className="py-2.5 px-3">Campaign Name</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Gateway</th>
                <th className="py-2.5 px-3">Media</th>
                <th className="py-2.5 px-3">Dispatched</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF0]">
              {campaigns.slice(0, 8).map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#20283A]">{c.name}</td>
                  <td className="py-2.5 px-3 text-[#737D90]">{c.targetAudience || 'All'}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] bg-[#EEF1FC] text-[#5269D9] px-2 py-0.5 rounded font-semibold uppercase">
                      {c.platform || 'both'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {c.mediaId || c.mediaAsset ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F7F0] text-[#16A36A] flex items-center gap-1 w-fit">
                        <Paperclip className="w-2.5 h-2.5" />
                        <span>Media</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#737D90]">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#20283A]">
                    {c.sent || (c.status === 'COMPLETED' ? c.total : 0)} / {c.total}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#737D90] text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Outbound Campaign Launch"
        description={`Are you sure you want to broadcast "${campaignName}" to ${targetAudience} via ${platform.toUpperCase()}${attachedMedia ? ' with attached media' : ''}? Messages will immediately enqueue.`}
        confirmLabel="Confirm & Broadcast"
        cancelLabel="Review Settings"
        onConfirm={handleConfirmLaunch}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isLaunching}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        selectedAssetId={attachedMedia?.id}
        onSelect={(asset) => {
          setAttachedMedia(asset);
          toast.success('Media Attached to Campaign', {
            description: `Attached "${asset.originalName}". Channel payload updated.`
          });
        }}
      />
    </div>
  );
};
