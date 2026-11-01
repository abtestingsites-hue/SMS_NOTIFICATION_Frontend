import React, { useState, useEffect, useMemo } from 'react';
import type {
  NavModule,
  Campaign,
  Offer,
  MediaAsset,
  VisualCampaignDraft,
  CampaignContentBlock,
  CampaignBlockType,
  CampaignFollowUpStep,
  AudienceSummary,
  ExtractedOfferData,
  SavedTemplate,
  AIContentGeneration
} from '../types';
import { api, API_BASE } from '../services/api';
import { toast } from '../services/toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { MediaPickerModal } from './ui/MediaPickerModal';
import {
  Wand2,
  Image as ImageIcon,
  Sparkles,
  Users,
  Globe,
  Tag,
  Clock,
  Eye,
  Send,
  GripVertical,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
  RotateCcw,
  RotateCw,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Smartphone,
  MessageSquare,
  Upload,
  FolderOpen,
  Save,
  FileText,
  ChevronRight,
  X,
  Layers,
  ExternalLink,
  ShieldAlert,
  Search
} from 'lucide-react';

interface VisualCampaignBuilderProps {
  campaigns: Campaign[];
  offers: Offer[];
  setActiveNav: (nav: NavModule) => void;
  onLaunchCampaignSuccess?: (campaign: any) => void;
  customerCareNumber?: string;
}

const REGIONAL_LANGUAGES = [
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

const DEFAULT_BLOCKS: CampaignContentBlock[] = [
  { id: 'b_headline', type: 'headline', label: 'Headline', content: '🎉 Special Festival Privilege Announced!', order: 1, editable: true },
  { id: 'b_pers', type: 'personalization', label: 'Personalization', content: 'Hi {{customer_name}},', order: 2, editable: true },
  { id: 'b_desc', type: 'description', label: 'Message Body', content: 'We are delighted to bring you exclusive festive savings across premium electronics and home appliances.', order: 3, editable: true },
  { id: 'b_offer', type: 'offer', label: 'Offer Details', content: '🎁 Special Privilege Flash Sale: Flat 25% OFF on selected brands!', order: 4, editable: true },
  { id: 'b_coupon', type: 'coupon', label: 'Coupon Code', content: '🏷️ Use Coupon: SUMMER25', order: 5, editable: true },
  { id: 'b_cta', type: 'cta', label: 'Call to Action', content: '👉 Claim your offer now: https://store.deals/vip', order: 6, editable: true },
  { id: 'b_contact', type: 'contact', label: 'Helpline', content: '📞 Customer Support: +91 63698 25386', order: 7, editable: true },
  { id: 'b_optout', type: 'optout', label: 'Opt-out Notice', content: 'Reply STOP to unsubscribe.', order: 8, editable: true }
];

const getFieldValue = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && 'value' in field) return String(field.value || '');
  return String(field);
};

export const VisualCampaignBuilder: React.FC<VisualCampaignBuilderProps> = ({
  campaigns: _campaigns,
  offers,
  setActiveNav,
  onLaunchCampaignSuccess,
  customerCareNumber = '+916369825386'
}) => {
  // Navigation & Workspace State
  const [activeRightTab, setActiveRightTab] = useState<'ai' | 'audience' | 'language' | 'offers' | 'schedule' | 'preview' | 'launch'>('ai');
  const [assetCategory, setAssetCategory] = useState<'all' | 'media' | 'templates' | 'blocks' | 'offers'>('all');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'assets' | 'canvas' | 'config'>('canvas');

  // Available System Assets
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [draftsList, setDraftsList] = useState<VisualCampaignDraft[]>([]);
  const [audienceSummary, setAudienceSummary] = useState<AudienceSummary>({
    totalSelected: 0,
    smsEligible: 0,
    whatsappEligible: 0,
    suppressed: 0,
    optedOut: 0,
    invalid: 0,
    languageBreakdown: {}
  });

  // Current Draft / Campaign Working State
  const [draftId, setDraftId] = useState<string>(() => `draft_${Date.now()}`);
  const [campaignName, setCampaignName] = useState('Festive VIP Broadcast 2026');
  const [channel, setChannel] = useState<'both' | 'whatsapp' | 'sms'>('both');
  const [selectedCreative, setSelectedCreative] = useState<MediaAsset | null>(null);
  const [contentBlocks, setContentBlocks] = useState<CampaignContentBlock[]>(DEFAULT_BLOCKS);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(offers[0] || null);
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  
  // Undo / Redo History
  const [history, setHistory] = useState<CampaignContentBlock[][]>([DEFAULT_BLOCKS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Gemini Vision State
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [geminiFacts, setGeminiFacts] = useState<ExtractedOfferData | null>(null);
  const [isGeneratingLanguages, setIsGeneratingLanguages] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<any>(null);

  // Multilingual Configuration (Phase 17 + 18)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['ta', 'te', 'kn', 'ml', 'hi', 'mr']);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('ta');
  const [languageVariants, setLanguageVariants] = useState<Record<string, string>>({});
  const [languageApprovals, setLanguageApprovals] = useState<Record<string, boolean>>({
    ta: true,
    te: true,
    kn: true,
    ml: true,
    hi: true,
    mr: true
  });
  const [strictAntiSubstitution, setStrictAntiSubstitution] = useState(true);

  // Schedule Configuration
  const [scheduleMode, setScheduleMode] = useState<'NOW' | 'SCHEDULED'>('NOW');
  const [scheduledDate, setScheduledDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [timezone] = useState('Asia/Kolkata (IST - UTC+5:30)');
  const [followUps, setFollowUps] = useState<CampaignFollowUpStep[]>([
    {
      id: 'fu_1',
      stage: 'REMINDER',
      sequenceNumber: 1,
      scheduledInterval: 'Day 3 - 11:00 AM',
      scheduledOffsetHours: 72,
      messageBody: 'Reminder: Hi {{customer_name}}, don\'t forget your Special Privilege at Sathya! Use code SUMMER25 before 15 Aug 2026. Visit us today.',
      channel: 'both',
      language: 'en',
      eligibilityRule: 'ALL_ELIGIBLE',
      approvalStatus: 'APPROVED'
    },
    {
      id: 'fu_2',
      stage: 'REINFORCEMENT',
      sequenceNumber: 2,
      scheduledInterval: 'Day 5 - 05:00 PM',
      scheduledOffsetHours: 120,
      messageBody: 'Hi {{customer_name}}, premium quality & easy exchanges guaranteed! Claim your Special Privilege at Sathya using code SUMMER25. Questions? Call +916369825386.',
      channel: 'both',
      language: 'en',
      eligibilityRule: 'NOT_REPLIED',
      approvalStatus: 'APPROVED'
    },
    {
      id: 'fu_3',
      stage: 'EXPIRY',
      sequenceNumber: 3,
      scheduledInterval: 'Day 7 - 12:00 PM',
      scheduledOffsetHours: 168,
      messageBody: 'Final Call: Hi {{customer_name}}, your Sathya Special Privilege offer expires tonight! Claim code SUMMER25 now. Reply STOP to opt out.',
      channel: 'both',
      language: 'en',
      eligibilityRule: 'NOT_CONVERTED',
      approvalStatus: 'APPROVED'
    }
  ]);

  // Preview & Telecom Diagnostics State
  const [previewDevice, setPreviewDevice] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [previewCustomerName] = useState('Alexander Wright');

  // Autosave and Loading State
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);

  // Load Initial Resources
  useEffect(() => {
    loadAllResources();
  }, []);

  const loadAllResources = async () => {
    try {
      const [mediaList, templatesList, drafts, audience, geminiInfo] = await Promise.all([
        api.getMedia().catch(() => []),
        api.getSavedTemplates().catch(() => []),
        api.getBuilderDrafts().catch(() => []),
        api.getAudienceSummary('All').catch(() => ({
          totalSelected: 0,
          smsEligible: 0,
          whatsappEligible: 0,
          suppressed: 0,
          optedOut: 0,
          invalid: 0,
          languageBreakdown: {}
        })),
        api.getGeminiStatus().catch(() => null)
      ]);

      if (Array.isArray(mediaList)) {
        setMediaAssets(mediaList);
        if (!selectedCreative && mediaList.length > 0) {
          const imageAsset = mediaList.find(m => m.mediaType === 'image') || mediaList[0];
          setSelectedCreative(imageAsset);
        }
      }
      if (Array.isArray(templatesList)) setSavedTemplates(templatesList);
      if (Array.isArray(drafts)) setDraftsList(drafts);
      if (audience) setAudienceSummary(audience);
      if (geminiInfo) setGeminiStatus(geminiInfo);
    } catch (err: any) {
      console.warn('Error loading initial builder resources:', err);
    }
  };

  // Reload audience when segment changes
  useEffect(() => {
    api.getAudienceSummary(selectedSegment)
      .then(res => setAudienceSummary(res))
      .catch(err => console.warn('Audience summary error:', err));
  }, [selectedSegment]);

  // Push History State on Block Change
  const updateContentBlocksWithHistory = (newBlocks: CampaignContentBlock[]) => {
    const updated = [...history.slice(0, historyIndex + 1), newBlocks];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setContentBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContentBlocks(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContentBlocks(history[historyIndex + 1]);
    }
  };

  // Autosave Draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraftSilently();
    }, 30000);
    return () => clearInterval(timer);
  }, [campaignName, channel, selectedCreative, contentBlocks, selectedOffer, selectedSegment, selectedLanguages, scheduleMode, scheduledDate, scheduledTime, followUps]);

  const saveDraftSilently = async () => {
    try {
      const draftPayload: Partial<VisualCampaignDraft> = {
        id: draftId,
        name: campaignName,
        status: 'DRAFT',
        channel,
        creativeAssetId: selectedCreative?.id || null,
        creativeAsset: selectedCreative || null,
        contentBlocks,
        offerId: selectedOffer?.id || null,
        offer: selectedOffer || null,
        audienceSelection: {
          type: selectedSegment === 'All' ? 'all' : 'segment',
          segmentName: selectedSegment,
          totalCount: audienceSummary.totalSelected,
          smsEligibleCount: audienceSummary.smsEligible,
          whatsappEligibleCount: audienceSummary.whatsappEligible,
          suppressedCount: audienceSummary.suppressed,
          optedOutCount: audienceSummary.optedOut,
          languageBreakdown: audienceSummary.languageBreakdown
        },
        languageConfig: {
          selectedLanguages,
          defaultLanguage,
          languageVariants,
          languageApprovals
        },
        scheduleConfig: {
          mode: scheduleMode,
          scheduledDate,
          scheduledTime,
          timezone,
          followUps
        },
        geminiExtraction: geminiFacts
      };
      await api.saveBuilderDraft(draftPayload);
      setLastAutosaved(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Autosave warning:', e);
    }
  };

  const handleExplicitSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraftSilently();
      toast.success('Campaign Draft Saved', {
        description: `Draft "${campaignName}" persisted to durable storage.`
      });
      const drafts = await api.getBuilderDrafts().catch(() => []);
      setDraftsList(drafts);
    } catch (err: any) {
      toast.error('Draft Save Failed', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Load a Saved Draft
  const handleLoadDraft = (draft: VisualCampaignDraft) => {
    setDraftId(draft.id);
    setCampaignName(draft.name || 'Untitled Campaign');
    setChannel(draft.channel || 'both');
    setSelectedCreative(draft.creativeAsset || null);
    setContentBlocks(draft.contentBlocks && draft.contentBlocks.length > 0 ? draft.contentBlocks : DEFAULT_BLOCKS);
    setSelectedOffer(draft.offer || null);
    setSelectedSegment(draft.audienceSelection?.segmentName || 'All');
    if (draft.languageConfig) {
      setSelectedLanguages(draft.languageConfig.selectedLanguages || ['ta', 'te', 'kn', 'ml', 'hi', 'mr']);
      setDefaultLanguage(draft.languageConfig.defaultLanguage || 'ta');
      setLanguageVariants(draft.languageConfig.languageVariants || {});
      setLanguageApprovals(draft.languageConfig.languageApprovals || {});
    }
    if (draft.scheduleConfig) {
      setScheduleMode(draft.scheduleConfig.mode || 'NOW');
      setScheduledDate(draft.scheduleConfig.scheduledDate || new Date().toISOString().split('T')[0]);
      setScheduledTime(draft.scheduleConfig.scheduledTime || '11:00');
      if (draft.scheduleConfig.followUps) setFollowUps(draft.scheduleConfig.followUps);
    }
    if (draft.geminiExtraction) setGeminiFacts(draft.geminiExtraction);
    setIsDraftsModalOpen(false);
    toast.success('Draft Loaded', { description: `Restored campaign "${draft.name}".` });
  };

  // Delete a Draft
  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteBuilderDraft(id);
      setDraftsList(prev => prev.filter(d => d.id !== id));
      toast.success('Draft deleted.');
    } catch (err: any) {
      toast.error('Failed to delete draft', { description: err.message });
    }
  };

  // Content Block Management
  const handleUpdateBlockContent = (id: string, newContent: string) => {
    const updated = contentBlocks.map(b => b.id === id ? { ...b, content: newContent } : b);
    updateContentBlocksWithHistory(updated);
  };

  const handleDuplicateBlock = (id: string) => {
    const index = contentBlocks.findIndex(b => b.id === id);
    if (index === -1) return;
    const original = contentBlocks[index];
    const newBlock: CampaignContentBlock = {
      ...original,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `${original.label} (Copy)`,
      order: original.order + 0.5
    };
    const updated = [...contentBlocks.slice(0, index + 1), newBlock, ...contentBlocks.slice(index + 1)]
      .map((b, i) => ({ ...b, order: i + 1 }));
    updateContentBlocksWithHistory(updated);
    toast.success('Block duplicated');
  };

  const handleDeleteBlock = (id: string) => {
    if (contentBlocks.length <= 1) {
      toast.error('Cannot remove all blocks', { description: 'At least one content block is required.' });
      return;
    }
    const updated = contentBlocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i + 1 }));
    updateContentBlocksWithHistory(updated);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= contentBlocks.length) return;
    const newBlocks = [...contentBlocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    const reordered = newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
    updateContentBlocksWithHistory(reordered);
  };

  const handleInsertToken = (blockId: string, token: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (!block) return;
    handleUpdateBlockContent(blockId, `${block.content} {{${token}}}`);
  };

  // Add a standard block type
  const handleAddBlockType = (type: CampaignBlockType) => {
    const defaultLabels: Record<CampaignBlockType, { label: string; text: string }> = {
      headline: { label: 'Headline', text: '🔥 Massive Clearance Sale!' },
      description: { label: 'Message Body', text: 'Get high-end electronics at factory pricing.' },
      offer: { label: 'Offer', text: '🎁 Special Privilege Discount: Up to 40% OFF!' },
      coupon: { label: 'Coupon Code', text: '🏷️ Code: FESTIVE40' },
      cta: { label: 'Call to Action', text: '👉 Shop Online: https://store.deals/festive' },
      contact: { label: 'Helpline', text: `📞 Support: ${customerCareNumber}` },
      personalization: { label: 'Personalization', text: 'Hello {{customer_name}},' },
      optout: { label: 'Opt-out Notice', text: 'Reply STOP to unsubscribe.' },
      media: { label: 'Media Attachment', text: 'Attached: Promotional Poster Creative' }
    };
    const info = defaultLabels[type] || { label: 'Content Block', text: 'Enter message text here...' };
    const newBlock: CampaignContentBlock = {
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      label: info.label,
      content: info.text,
      order: contentBlocks.length + 1,
      editable: true
    };
    updateContentBlocksWithHistory([...contentBlocks, newBlock]);
    toast.success(`Added ${info.label} block`);
  };

  // Reset Canvas
  const handleResetCanvas = () => {
    setContentBlocks(DEFAULT_BLOCKS);
    setHistory([DEFAULT_BLOCKS]);
    setHistoryIndex(0);
    setSelectedCreative(null);
    setGeminiFacts(null);
    setIsResetConfirmOpen(false);
    toast.info('Canvas reset to default layout.');
  };

  // Drag and Drop Handling from Left Panel to Composer Canvas
  const [draggedItem, setDraggedItem] = useState<{ type: string; data: any } | null>(null);

  const handleDragStart = (e: React.DragEvent, itemType: string, data: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemType, data }));
    setDraggedItem({ type: itemType, data });
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === 'media') {
      setSelectedCreative(draggedItem.data);
      toast.success('Creative attached to canvas');
    } else if (draggedItem.type === 'block') {
      handleAddBlockType(draggedItem.data);
    } else if (draggedItem.type === 'template') {
      const tmpl = draggedItem.data;
      if (tmpl.body) {
        const newBlock: CampaignContentBlock = {
          id: `b_${Date.now()}`,
          type: 'description',
          label: tmpl.name || 'Imported Template',
          content: tmpl.body,
          order: contentBlocks.length + 1,
          editable: true
        };
        updateContentBlocksWithHistory([...contentBlocks, newBlock]);
        toast.success(`Imported template: ${tmpl.name}`);
      }
    } else if (draggedItem.type === 'offer') {
      setSelectedOffer(draggedItem.data);
      toast.success(`Attached offer: ${draggedItem.data.code}`);
    }
    setDraggedItem(null);
  };

  // File Upload directly to durable Media Library
  const handleDirectFileUpload = async (file: File) => {
    try {
      const res = await api.uploadMedia(file, 'Visual Campaign Creative');
      const uploaded = res.asset;
      setMediaAssets(prev => [uploaded, ...prev]);
      setSelectedCreative(uploaded);
      toast.success('Media uploaded & attached', {
        description: `Saved as durable asset ${uploaded.id}`
      });
    } catch (err: any) {
      toast.error('Upload Failed', { description: err.message });
    }
  };

  // Gemini Vision Multimodal Extraction
  const handleRunGeminiVision = async () => {
    if (!selectedCreative) {
      toast.error('No Creative Selected', { description: 'Attach an image to the canvas before running Gemini analysis.' });
      return;
    }
    setIsAnalyzingImage(true);
    try {
      const res = await api.analyzeOfferImage({ mediaId: selectedCreative.id });
      if (res && res.extractedOfferData) {
        setGeminiFacts(res.extractedOfferData);
        toast.success('Gemini Vision Extraction Complete', {
          description: `Extracted brand: ${getFieldValue(res.extractedOfferData.brand || res.extractedOfferData.brandName) || 'Detected'}, discount: ${getFieldValue(res.extractedOfferData.discount) || 'Special Offer'}`
        });
        setActiveRightTab('ai');
      }
    } catch (err: any) {
      toast.error('Gemini Analysis Error', { description: err.message });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Generate 6 Regional Languages using Gemini
  const handleGenerateRegionalLanguages = async () => {
    if (!geminiFacts && !selectedCreative) {
      toast.error('Creative Analysis Required', { description: 'Run Gemini OCR analysis first to ground translations in verified creative facts.' });
      return;
    }
    setIsGeneratingLanguages(true);
    try {
      const payload = {
        sourceMediaId: selectedCreative?.id || null,
        sourceMediaAsset: selectedCreative || null,
        extractedOfferData: geminiFacts || {
          brand: 'Sathya Agencies',
          offerTitle: 'Special Privilege Flash Sale',
          discount: 'Special Privilege',
          couponCode: selectedOffer?.code || 'SUMMER25',
          validUntil: '15 Aug 2026',
          helpline: customerCareNumber,
          ctaText: 'Visit Store Today'
        },
        languages: selectedLanguages,
        channel,
        tone: 'Festive & Promotional' as any
      };

      const result: AIContentGeneration = await api.generateAITemplates(payload);
      if (result && result.variants) {
        const variantsMap: Record<string, string> = {};
        result.variants.forEach(v => {
          const langObj = REGIONAL_LANGUAGES.find(l => l.name.toLowerCase() === (v.language || '').toLowerCase() || l.code === v.language);
          const code = langObj ? langObj.code : v.language;
          variantsMap[code] = v.content || v.messageBody;
        });
        setLanguageVariants(variantsMap);
        toast.success('Regional Languages Generated', {
          description: `Created grounded promotional copy for ${result.variants.length} regional languages.`
        });
      }
    } catch (err: any) {
      toast.error('Generation Error', { description: err.message });
    } finally {
      setIsGeneratingLanguages(false);
    }
  };

  // Insert Generated Regional Content into Canvas
  const handleInsertLanguageToCanvas = (langCode: string) => {
    const text = languageVariants[langCode];
    if (!text) {
      toast.error('No variant generated for this language yet');
      return;
    }
    const langObj = REGIONAL_LANGUAGES.find(l => l.code === langCode);
    const newBlock: CampaignContentBlock = {
      id: `b_lang_${langCode}_${Date.now()}`,
      type: 'description',
      label: `${langObj?.name || langCode} (${langObj?.nativeName || ''}) Message`,
      content: text,
      order: contentBlocks.length + 1,
      editable: true
    };
    updateContentBlocksWithHistory([...contentBlocks, newBlock]);
    toast.success(`Inserted ${langObj?.name || langCode} block into canvas`);
  };

  // Compose Full Message Text for Device Preview & Telecom Diagnostics
  const composedFullMessage = useMemo(() => {
    const brandStr = getFieldValue(geminiFacts?.brand || geminiFacts?.brandName) || 'Sathya';
    const discountStr = selectedOffer?.discount || getFieldValue(geminiFacts?.discount) || '25% OFF';
    const couponStr = selectedOffer?.code || getFieldValue(geminiFacts?.couponCode) || 'SUMMER25';
    const validUntilStr = getFieldValue(geminiFacts?.validUntil) || '15 Aug 2026';

    return contentBlocks
      .map(b => b.content)
      .join('\n\n')
      .replace(/\{\{customer_name\}\}/g, previewCustomerName)
      .replace(/\{\{coupon_code\}\}/g, couponStr)
      .replace(/\{\{discount\}\}/g, discountStr)
      .replace(/\{\{brand\}\}/g, brandStr)
      .replace(/\{\{valid_until\}\}/g, validUntilStr)
      .replace(/\{\{helpline\}\}/g, customerCareNumber);
  }, [contentBlocks, previewCustomerName, selectedOffer, geminiFacts, customerCareNumber]);

  // Telecom Diagnostics Computation (UCS-2 vs GSM-7 detection)
  const telecomDiagnostics = useMemo(() => {
    const text = composedFullMessage;
    const isUnicode = /[^\u0020-\u007E\u00A0-\u00FF]/.test(text);
    const charCount = text.length;
    let segments = 1;

    if (isUnicode) {
      segments = charCount <= 70 ? 1 : Math.ceil(charCount / 67);
    } else {
      segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
    }

    const estimatedCreditsPerRecipient = segments;
    const totalCreditsNeeded = estimatedCreditsPerRecipient * (audienceSummary.smsEligible || 0);

    return {
      encoding: isUnicode ? 'Unicode (UCS-2)' : 'GSM-7 Standard',
      isUnicode,
      charCount,
      segments,
      estimatedCreditsPerRecipient,
      totalCreditsNeeded
    };
  }, [composedFullMessage, audienceSummary]);

  // Offer Discrepancy Conflict Alert
  const offerConflictAlert = useMemo(() => {
    if (!selectedOffer || !geminiFacts) return null;
    const errors: string[] = [];
    const factsCoupon = getFieldValue(geminiFacts.couponCode);
    const factsDiscount = getFieldValue(geminiFacts.discount);

    if (factsCoupon && selectedOffer.code && factsCoupon.toLowerCase() !== selectedOffer.code.toLowerCase()) {
      errors.push(`Coupon code discrepancy: Image shows "${factsCoupon}", but attached offer uses "${selectedOffer.code}".`);
    }
    if (factsDiscount && selectedOffer.discount && !selectedOffer.discount.includes(factsDiscount) && !factsDiscount.includes(selectedOffer.discount)) {
      errors.push(`Discount variance: Creative visually advertises "${factsDiscount}", while offer gives "${selectedOffer.discount}".`);
    }
    return errors.length > 0 ? errors : null;
  }, [selectedOffer, geminiFacts]);

  // Pre-Flight Validation Checklist
  const preFlightChecklist = useMemo(() => {
    const checks = [
      { id: 'creative', label: 'Promotional Creative Attached', pass: Boolean(selectedCreative) },
      { id: 'content', label: 'Message Content Defined (>20 chars)', pass: composedFullMessage.trim().length >= 20 },
      { id: 'optout', label: 'Opt-Out Disclaimer Present', pass: /stop|unsubscribe/i.test(composedFullMessage) },
      { id: 'audience', label: 'Eligible Audience Available (>0)', pass: (audienceSummary.smsEligible + audienceSummary.whatsappEligible) > 0 },
      {
        id: 'languages',
        label: 'Regional Languages Approved',
        pass: selectedLanguages.every(lang => languageApprovals[lang] === true)
      }
    ];
    const isReady = checks.every(c => c.pass);
    return { checks, isReady };
  }, [selectedCreative, composedFullMessage, audienceSummary, selectedLanguages, languageApprovals]);

  // Execute Bulk Campaign Launch via Backend Service
  const handleExecuteLaunch = async () => {
    setIsLaunching(true);
    try {
      const payload = {
        name: campaignName,
        channel,
        selectedCreativeId: selectedCreative?.id || null,
        contentBlocks,
        fullMessage: composedFullMessage,
        offerId: selectedOffer?.id || null,
        targetSegment: selectedSegment,
        selectedLanguages,
        defaultLanguage,
        languageVariants,
        languageApprovals,
        scheduleMode,
        scheduledDate,
        scheduledTime,
        timezone,
        followUps: followUps.filter(f => f.approvalStatus === 'APPROVED')
      };

      const result = await api.launchBuilderCampaign(payload);
      if (result && result.success) {
        setLaunchResult(result);
        toast.success('Campaign Launched Successfully!', {
          description: `Dispatched bulk campaign #${result.campaignId} to ${result.stats?.totalDispatched || audienceSummary.totalSelected} recipients.`
        });
        if (onLaunchCampaignSuccess) {
          onLaunchCampaignSuccess(result.campaign);
        }
      } else {
        throw new Error('Launch dispatch returned unconfirmed state.');
      }
    } catch (err: any) {
      toast.error('Campaign Launch Failed', { description: err.message });
    } finally {
      setIsLaunching(false);
      setIsLaunchModalOpen(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col bg-[#F8FAFC] overflow-hidden select-none">
      {/* =========================================================================
          TOP WORKSPACE TOOLBAR
      ========================================================================= */}
      <div className="bg-white border-b border-[#E8EAF0] px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs z-20">
        {/* Left: Module identity & editable title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#5269D9] flex items-center justify-center font-bold shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="Campaign Title..."
                className="text-xs sm:text-sm font-bold text-[#20283A] bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent focus:border-[#5269D9] outline-none px-1 py-0.5 rounded transition-all max-w-[150px] sm:max-w-[280px] lg:max-w-[380px] truncate"
              />
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Phase 18
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#737D90]">
              <span className="hidden xs:inline">Channel:</span>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5">
                {(['both', 'whatsapp', 'sms'] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] font-semibold transition-all ${
                      channel === ch ? 'bg-white text-[#20283A] shadow-2xs' : 'text-[#737D90] hover:text-[#20283A]'
                    }`}
                  >
                    {ch === 'both' ? 'Both' : ch === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Autosave status & Undo/Redo (Visible on desktop screens >= lg) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#737D90]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{lastAutosaved ? `Autosaved ${lastAutosaved}` : 'Autosave active'}</span>
          </div>

          <div className="h-4 w-px bg-[#E8EAF0]"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo last change"
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-[#737D90] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo change"
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-[#737D90] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-[11px] text-[#737D90] hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Reset Canvas
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsDraftsModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EAF0] bg-white hover:bg-slate-50 text-[#20283A] text-xs font-semibold shadow-2xs transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#737D90]" />
            <span>Drafts</span>
            {draftsList.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-100 text-[#737D90] rounded text-[10px] font-mono">
                {draftsList.length}
              </span>
            )}
          </button>

          <button
            onClick={handleExplicitSaveDraft}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EAF0] bg-white hover:bg-slate-50 text-[#20283A] text-xs font-semibold shadow-2xs transition-colors"
          >
            <Save className={`w-3.5 h-3.5 text-[#5269D9] ${isSaving ? 'animate-spin' : ''}`} />
            <span>Save</span>
          </button>

          <button
            onClick={() => setActiveRightTab('preview')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#20283A] text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#5269D9]" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => {
              setActiveRightTab('launch');
              setIsLaunchModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-[#5269D9] hover:bg-[#4357c5] text-white text-xs font-bold shadow-xs hover:shadow transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Campaign</span>
            <span className="sm:hidden">Launch</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Responsive Mode Switcher (< lg) */}
      <div className="lg:hidden flex items-center border-b border-[#E8EAF0] bg-white p-1 gap-1 shrink-0 shadow-2xs">
        <button
          onClick={() => setMobileView('assets')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'assets' ? 'bg-[#5269D9] text-white shadow-xs' : 'text-[#737D90] hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Assets</span>
        </button>
        <button
          onClick={() => setMobileView('canvas')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'canvas' ? 'bg-[#5269D9] text-white shadow-xs' : 'text-[#737D90] hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>
        <button
          onClick={() => setMobileView('config')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'config' ? 'bg-[#5269D9] text-white shadow-xs' : 'text-[#737D90] hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Config ({activeRightTab.toUpperCase()})</span>
        </button>
      </div>

      {/* =========================================================================
          THREE-PANEL WORKSPACE GRID
      ========================================================================= */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* -----------------------------------------------------------------------
            LEFT PANEL: ASSET LIBRARY (Width ~280px)
        ----------------------------------------------------------------------- */}
        <div className={`w-full lg:w-72 xl:w-80 bg-white border-r border-[#E8EAF0] flex-col shrink-0 overflow-hidden ${mobileView === 'assets' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Asset Library Header & Categories */}
          <div className="p-3 border-b border-[#E8EAF0] space-y-2 bg-[#FAFBFD]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#5269D9]" />
                Asset Library
              </h2>
              <span className="text-[10px] text-[#737D90]">Drag items to canvas</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {(['all', 'media', 'templates', 'blocks', 'offers'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setAssetCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap capitalize transition-all ${
                    assetCategory === cat
                      ? 'bg-[#5269D9] text-white shadow-2xs'
                      : 'bg-white border border-[#E8EAF0] text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Asset Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737D90]" />
              <input
                type="text"
                placeholder="Search assets & blocks..."
                value={assetSearchQuery}
                onChange={e => setAssetSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-[#E8EAF0] rounded-lg outline-none focus:border-[#5269D9] text-[#20283A] placeholder-[#A0AEC0]"
              />
            </div>
          </div>

          {/* Asset Library Scrollable Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            
            {/* Quick Upload Dropzone at top */}
            {(assetCategory === 'all' || assetCategory === 'media') && (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleDirectFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-[#D6DCF0] hover:border-[#5269D9] bg-[#F8FAFF] rounded-xl p-3 text-center transition-all cursor-pointer group"
                onClick={() => setIsMediaModalOpen(true)}
              >
                <div className="w-8 h-8 mx-auto rounded-full bg-white shadow-2xs border border-[#E8EAF0] flex items-center justify-center text-[#5269D9] group-hover:scale-105 transition-transform mb-1.5">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#20283A]">Upload Promotional Image</div>
                <div className="text-[10px] text-[#737D90]">Drag file here or click to browse Media Library</div>
              </div>
            )}

            {/* Category Section: Content Blocks */}
            {(assetCategory === 'all' || assetCategory === 'blocks') && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-[#737D90] uppercase tracking-wider px-1">
                  Content Blocks
                </div>
                {[
                  { type: 'headline' as const, label: 'Headline Banner', desc: 'Promotional hook title', icon: Tag, color: 'text-purple-600 bg-purple-50' },
                  { type: 'personalization' as const, label: 'Personalization', desc: 'Customer name merge tag', icon: Users, color: 'text-blue-600 bg-blue-50' },
                  { type: 'description' as const, label: 'Message Body', desc: 'Core marketing copy', icon: FileText, color: 'text-slate-600 bg-slate-50' },
                  { type: 'offer' as const, label: 'Offer Highlight', desc: 'Discount percentage & terms', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
                  { type: 'coupon' as const, label: 'Coupon Code', desc: 'Voucher or promo code', icon: Tag, color: 'text-amber-600 bg-amber-50' },
                  { type: 'cta' as const, label: 'Call to Action', desc: 'Website URL link', icon: ExternalLink, color: 'text-indigo-600 bg-indigo-50' },
                  { type: 'contact' as const, label: 'Helpline / Care', desc: 'Telephone number support', icon: Smartphone, color: 'text-cyan-600 bg-cyan-50' },
                  { type: 'optout' as const, label: 'Opt-out Notice', desc: 'STOP unsubscribe notice', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' }
                ].map(b => (
                  <div
                    key={b.type}
                    draggable
                    onDragStart={e => handleDragStart(e, 'block', b.type)}
                    onClick={() => handleAddBlockType(b.type)}
                    className="p-2 rounded-lg border border-[#E8EAF0] bg-white hover:border-[#5269D9] hover:shadow-2xs transition-all flex items-center justify-between cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-md ${b.color} flex items-center justify-center shrink-0`}>
                        <b.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#20283A] truncate">{b.label}</div>
                        <div className="text-[10px] text-[#737D90] truncate">{b.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                      <Plus className="w-3.5 h-3.5 text-[#5269D9]" />
                      <GripVertical className="w-3.5 h-3.5 text-[#A0AEC0]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Category Section: Media Assets */}
            {(assetCategory === 'all' || assetCategory === 'media') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-[#737D90] uppercase tracking-wider">
                    Media Assets ({mediaAssets.length})
                  </span>
                  <button
                    onClick={() => setIsMediaModalOpen(true)}
                    className="text-[10px] text-[#5269D9] hover:underline font-semibold"
                  >
                    Browse All
                  </button>
                </div>

                {mediaAssets.slice(0, 6).map(asset => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={e => handleDragStart(e, 'media', asset)}
                    onClick={() => {
                      setSelectedCreative(asset);
                      toast.success(`Creative attached: ${asset.originalName || asset.id}`);
                    }}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-grab active:cursor-grabbing group ${
                      selectedCreative?.id === asset.id
                        ? 'border-[#5269D9] bg-[#F5F7FF]'
                        : 'border-[#E8EAF0] bg-white hover:border-[#5269D9]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded bg-slate-100 border border-[#E8EAF0] overflow-hidden shrink-0 flex items-center justify-center">
                        {asset.mediaType === 'image' ? (
                          <img
                            src={asset.url.startsWith('http') ? asset.url : `${API_BASE}${asset.url}`}
                            alt={asset.originalName}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="%23CBD5E1"><rect width="30" height="30"/></svg>';
                            }}
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#20283A] truncate max-w-[140px]">
                          {asset.originalName || asset.id}
                        </div>
                        <div className="text-[10px] text-[#737D90]">
                          {asset.mimeType || 'Durable Asset'}
                        </div>
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-[#A0AEC0] opacity-60 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Category Section: Active Offers */}
            {(assetCategory === 'all' || assetCategory === 'offers') && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-[#737D90] uppercase tracking-wider px-1">
                  Active Offers ({offers.length})
                </div>
                {offers.map(off => (
                  <div
                    key={off.id}
                    draggable
                    onDragStart={e => handleDragStart(e, 'offer', off)}
                    onClick={() => {
                      setSelectedOffer(off);
                      toast.success(`Attached offer: ${off.code}`);
                    }}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-grab active:cursor-grabbing group ${
                      selectedOffer?.id === off.id
                        ? 'border-[#5269D9] bg-[#F5F7FF]'
                        : 'border-[#E8EAF0] bg-white hover:border-[#5269D9]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#20283A] font-mono">{off.code}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {off.discount}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#737D90] truncate max-w-[180px]">
                        {off.description || 'Special Discount'}
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-[#A0AEC0] opacity-60 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Category Section: Saved Templates */}
            {(assetCategory === 'all' || assetCategory === 'templates') && savedTemplates.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-[#737D90] uppercase tracking-wider px-1">
                  Saved Templates ({savedTemplates.length})
                </div>
                {savedTemplates.slice(0, 4).map(tmpl => (
                  <div
                    key={tmpl.id}
                    draggable
                    onDragStart={e => handleDragStart(e, 'template', tmpl)}
                    className="p-2 rounded-lg border border-[#E8EAF0] bg-white hover:border-[#5269D9] transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#20283A] truncate">{tmpl.name}</span>
                      <span className="text-[9px] font-semibold text-[#737D90] uppercase">{tmpl.category || 'Promo'}</span>
                    </div>
                    <p className="text-[10px] text-[#737D90] line-clamp-2">{tmpl.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            CENTER PANEL: CAMPAIGN COMPOSER CANVAS (Flex-1)
        ----------------------------------------------------------------------- */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropOnCanvas}
          className={`flex-1 bg-[#F8FAFC] flex-col min-w-0 overflow-y-auto p-4 sm:p-6 ${mobileView === 'canvas' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className="max-w-3xl w-full mx-auto space-y-4">

            {/* Offer Conflict Banner if discrepancies detected */}
            {offerConflictAlert && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold">Creative & Offer Discrepancy Alert</div>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px] text-amber-800">
                    {offerConflictAlert.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ===================================================================
                DROP ZONE 1: PROMOTIONAL CREATIVE
            =================================================================== */}
            <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#5269D9] text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                    Promotional Creative
                  </h3>
                </div>

                {selectedCreative && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunGeminiVision}
                      disabled={isAnalyzingImage}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                      <span>{isAnalyzingImage ? 'Analyzing...' : 'Run Gemini Vision'}</span>
                    </button>
                    <button
                      onClick={() => setIsMediaModalOpen(true)}
                      className="text-xs text-[#5269D9] hover:underline font-semibold"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => setSelectedCreative(null)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {selectedCreative ? (
                <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#E8EAF0] p-3 rounded-lg">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#E8EAF0] shrink-0 flex items-center justify-center">
                    <img
                      src={selectedCreative.url.startsWith('http') ? selectedCreative.url : `${API_BASE}${selectedCreative.url}`}
                      alt={selectedCreative.originalName}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="%23CBD5E1"><rect width="60" height="60"/></svg>';
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#20283A] truncate">
                      {selectedCreative.originalName || selectedCreative.id}
                    </div>
                    <div className="text-xs text-[#737D90] font-mono mt-0.5">
                      Durable Asset ID: {selectedCreative.id}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Ingested to Durable Storage
                      </span>
                      {geminiFacts && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Gemini Grounded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsMediaModalOpen(true)}
                  className="border-2 border-dashed border-[#D6DCF0] hover:border-[#5269D9] bg-[#F8FAFF] rounded-xl p-6 text-center transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-white shadow-2xs border border-[#E8EAF0] flex items-center justify-center text-[#5269D9] group-hover:scale-105 transition-transform mb-2">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-[#20283A]">Drop Promotional Poster or Creative Here</div>
                  <div className="text-[11px] text-[#737D90] mt-0.5">
                    Drag from Asset Library on the left or click to browse existing media
                  </div>
                </div>
              )}
            </div>

            {/* ===================================================================
                DROP ZONE 2: MESSAGE CONTENT BLOCKS STACK
            =================================================================== */}
            <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#5269D9] text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                    Message Content Blocks ({contentBlocks.length})
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddBlockType('headline')}
                    className="text-xs text-[#5269D9] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Block
                  </button>
                </div>
              </div>

              {/* Stack of Reorderable Content Blocks */}
              <div className="space-y-2.5">
                {contentBlocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="p-3 rounded-xl border border-[#E8EAF0] bg-white hover:border-[#CBD5E1] transition-all group/block"
                  >
                    {/* Block Toolbar Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-[#A0AEC0] cursor-grab" />
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-[#20283A]">
                          #{idx + 1} {block.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-70 group-hover/block:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveBlock(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 rounded hover:bg-slate-100 text-[#737D90] disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveBlock(idx, 'down')}
                          disabled={idx === contentBlocks.length - 1}
                          title="Move Down"
                          className="p-1 rounded hover:bg-slate-100 text-[#737D90] disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDuplicateBlock(block.id)}
                          title="Duplicate Block"
                          className="p-1 rounded hover:bg-slate-100 text-[#737D90]"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          title="Remove Block"
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Block Editable Content */}
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                      className="w-full text-xs text-[#20283A] bg-[#FAFBFD] hover:bg-white focus:bg-white border border-[#E8EAF0] focus:border-[#5269D9] rounded-lg p-2.5 outline-none resize-none transition-colors"
                      placeholder={`Enter ${block.label.toLowerCase()} text...`}
                    />

                    {/* Quick Insert Tokens Bar */}
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#737D90]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] uppercase font-semibold text-[#A0AEC0]">Insert:</span>
                        {['customer_name', 'coupon_code', 'discount', 'brand', 'valid_until'].map(t => (
                          <button
                            key={t}
                            onClick={() => handleInsertToken(block.id, t)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#EEF2FF] hover:text-[#5269D9] font-mono transition-colors"
                          >
                            + {`{{${t}}}`}
                          </button>
                        ))}
                      </div>
                      <span className="font-mono">{block.content.length} chars</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Block Quick Bar */}
              <div className="pt-2 flex items-center justify-center gap-2 border-t border-[#E8EAF0]">
                <span className="text-[11px] text-[#737D90]">Quick Add:</span>
                {(['headline', 'description', 'offer', 'cta', 'optout'] as const).map(bt => (
                  <button
                    key={bt}
                    onClick={() => handleAddBlockType(bt)}
                    className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-[#20283A] capitalize transition-colors"
                  >
                    + {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* ===================================================================
                DROP ZONE 3: ATTACHED OFFER DETAILS
            =================================================================== */}
            <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#5269D9] text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                    Offer & Promotional Terms
                  </h3>
                </div>

                <button
                  onClick={() => setActiveRightTab('offers')}
                  className="text-xs text-[#5269D9] hover:underline font-semibold"
                >
                  Configure in Offers Tab
                </button>
              </div>

              {selectedOffer ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBFD] border border-[#E8EAF0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#20283A] font-mono">{selectedOffer.code}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {selectedOffer.discount}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#737D90]">
                        {selectedOffer.description || 'Special customer promotion'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">✓ Validated</span>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-[#737D90] bg-[#FAFBFD] rounded-lg border border-dashed border-[#E8EAF0]">
                  No active offer attached. Drag one from the left panel or select in Offers tab.
                </div>
              )}
            </div>

            {/* ===================================================================
                DROP ZONE 4: MULTI-STAGE FOLLOW-UP TIMELINE
            =================================================================== */}
            <div className="bg-white rounded-xl border border-[#E8EAF0] p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#5269D9] text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                    Schedule-Aware Follow-Up Sequence ({followUps.length} Stages)
                  </h3>
                </div>

                <button
                  onClick={() => setActiveRightTab('schedule')}
                  className="text-xs text-[#5269D9] hover:underline font-semibold"
                >
                  Edit Timing Rules
                </button>
              </div>

              {/* Timeline Sequence List */}
              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8EAF0]">
                {followUps.map(step => (
                  <div key={step.id} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#5269D9] ring-4 ring-white"></span>
                    <div className="p-2.5 rounded-lg border border-[#E8EAF0] bg-[#FAFBFD] space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#20283A]">{step.stage}</span>
                          <span className="text-[10px] text-[#737D90] font-mono">({step.scheduledInterval})</span>
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Rule: {step.eligibilityRule}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737D90] line-clamp-2">{step.messageBody}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* -----------------------------------------------------------------------
            RIGHT PANEL: CAMPAIGN CONFIGURATION (7 TABS) (Width ~380px)
        ----------------------------------------------------------------------- */}
        <div className={`w-full lg:w-[350px] xl:w-[380px] bg-white border-l border-[#E8EAF0] flex-col shrink-0 overflow-hidden ${mobileView === 'config' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Configuration Tab Navigation Bar */}
          <div className="grid grid-cols-7 gap-0.5 p-1 bg-[#FAFBFD] border-b border-[#E8EAF0] shrink-0">
            {[
              { id: 'ai' as const, label: 'AI', icon: Sparkles },
              { id: 'audience' as const, label: 'Audience', icon: Users },
              { id: 'language' as const, label: 'Language', icon: Globe },
              { id: 'offers' as const, label: 'Offers', icon: Tag },
              { id: 'schedule' as const, label: 'Schedule', icon: Clock },
              { id: 'preview' as const, label: 'Preview', icon: Eye },
              { id: 'launch' as const, label: 'Launch', icon: Send }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={`py-1.5 px-0.5 rounded-md transition-all flex flex-col items-center justify-center gap-0.5 min-w-0 text-center ${
                  activeRightTab === tab.id
                    ? 'bg-white text-[#5269D9] shadow-2xs font-bold border border-[#E8EAF0]'
                    : 'text-[#737D90] hover:text-[#20283A] hover:bg-slate-100'
                }`}
                title={tab.label}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[9.5px] font-medium leading-none truncate max-w-full">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* ===================================================================
                TAB 1: AI GENERATOR (GEMINI MULTIMODAL VISION & 6 LANGUAGES)
            =================================================================== */}
            {activeRightTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5269D9]" />
                    Google Gemini Multimodal AI
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Analyzes visual poster facts & generates fluent copy in 6 regional languages.
                  </p>
                </div>

                {/* Gemini Model Badge */}
                <div className="p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E8EAF0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-[#20283A]">
                      {geminiStatus?.model || 'gemini-3.5-flash'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Operational
                  </span>
                </div>

                {/* Trigger Multimodal OCR Extraction */}
                <div className="space-y-2">
                  <button
                    onClick={handleRunGeminiVision}
                    disabled={isAnalyzingImage || !selectedCreative}
                    className="w-full py-2 px-3 rounded-lg bg-[#5269D9] hover:bg-[#4357c5] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingImage ? 'Analyzing Image...' : 'Extract Facts with Gemini Vision'}</span>
                  </button>

                  {!selectedCreative && (
                    <p className="text-[10px] text-amber-600 text-center">
                      * Attach an image to the canvas first to enable vision extraction.
                    </p>
                  )}
                </div>

                {/* Extracted Facts Card */}
                {geminiFacts && (
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                    <div className="text-[11px] font-bold text-purple-900 uppercase">
                      ✓ Visual Grounding Facts (OCR)
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#737D90]">Brand:</span>
                        <span className="font-semibold text-[#20283A]">{getFieldValue(geminiFacts.brand || geminiFacts.brandName) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#737D90]">Offer:</span>
                        <span className="font-semibold text-[#20283A]">{getFieldValue(geminiFacts.offerTitle) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#737D90]">Discount:</span>
                        <span className="font-semibold text-emerald-600">{getFieldValue(geminiFacts.discount) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#737D90]">Coupon:</span>
                        <span className="font-mono font-bold text-[#5269D9]">{getFieldValue(geminiFacts.couponCode) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#737D90]">Valid Until:</span>
                        <span className="text-[#20283A]">{getFieldValue(geminiFacts.validUntil) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate 6 Regional Languages Button */}
                <div className="space-y-2 pt-2 border-t border-[#E8EAF0]">
                  <div className="text-xs font-bold text-[#20283A]">
                    Multilingual Generation (6 Languages)
                  </div>
                  <p className="text-[10px] text-[#737D90]">
                    Generates native script variants: Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi.
                  </p>

                  <button
                    onClick={handleGenerateRegionalLanguages}
                    disabled={isGeneratingLanguages}
                    className="w-full py-2 px-3 rounded-lg border border-[#5269D9] bg-white hover:bg-[#EEF2FF] text-[#5269D9] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Globe className={`w-3.5 h-3.5 ${isGeneratingLanguages ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingLanguages ? 'Generating Copy...' : 'Generate 6 Regional Languages'}</span>
                  </button>
                </div>

                {/* Generated Language Snippets List */}
                {Object.keys(languageVariants).length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-[#737D90] uppercase">
                      Generated Variants ({Object.keys(languageVariants).length})
                    </div>
                    {REGIONAL_LANGUAGES.map(lang => {
                      const text = languageVariants[lang.code];
                      if (!text) return null;
                      return (
                        <div key={lang.code} className="p-2.5 rounded-lg border border-[#E8EAF0] bg-white space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#20283A]">
                              {lang.name} ({lang.nativeName})
                            </span>
                            <button
                              onClick={() => handleInsertLanguageToCanvas(lang.code)}
                              className="text-[10px] text-[#5269D9] hover:underline font-bold"
                            >
                              + Insert to Canvas
                            </button>
                          </div>
                          <p className="text-[11px] text-[#737D90] line-clamp-2">{text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
                TAB 2: AUDIENCE (DYNAMIC RESOLUTION & LANGUAGE MAPPING)
            =================================================================== */}
            {activeRightTab === 'audience' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#5269D9]" />
                    Audience Resolution & Eligibility
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Dynamic segment resolution with automatic opt-out suppression.
                  </p>
                </div>

                {/* Segment Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#20283A]">Audience Segment</label>
                  <select
                    value={selectedSegment}
                    onChange={e => setSelectedSegment(e.target.value)}
                    className="w-full text-xs bg-white border border-[#E8EAF0] rounded-lg p-2 outline-none focus:border-[#5269D9] text-[#20283A]"
                  >
                    <option value="All">All Contacts (Audience Registry)</option>
                    <option value="VIP">High Value VIP Tier</option>
                    <option value="Festival">Festival Shoppers</option>
                    <option value="Inactive">Inactive &gt; 30 Days</option>
                  </select>
                </div>

                {/* Dynamic Audience Counter Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-[#E8EAF0] bg-[#FAFBFD]">
                    <span className="text-[10px] text-[#737D90]">Total Selected</span>
                    <div className="text-lg font-bold text-[#20283A]">{audienceSummary.totalSelected}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8EAF0] bg-[#FAFBFD]">
                    <span className="text-[10px] text-[#737D90]">SMS Deliverable</span>
                    <div className="text-lg font-bold text-[#5269D9]">{audienceSummary.smsEligible}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8EAF0] bg-[#FAFBFD]">
                    <span className="text-[10px] text-[#737D90]">WhatsApp Deliverable</span>
                    <div className="text-lg font-bold text-emerald-600">{audienceSummary.whatsappEligible}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8EAF0] bg-[#FAFBFD]">
                    <span className="text-[10px] text-[#737D90]">Suppressed / Opt-out</span>
                    <div className="text-lg font-bold text-rose-600">{audienceSummary.suppressed + audienceSummary.optedOut}</div>
                  </div>
                </div>

                {/* Recipient Language-to-Audience Mapping Table */}
                <div className="space-y-2 pt-2 border-t border-[#E8EAF0]">
                  <div className="text-xs font-bold text-[#20283A]">
                    Recipient Language Breakdown
                  </div>
                  <p className="text-[10px] text-[#737D90]">
                    Each recipient is automatically mapped to their registered language preference.
                  </p>

                  <div className="border border-[#E8EAF0] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFBFD] border-b border-[#E8EAF0] text-[10px] font-bold text-[#737D90] uppercase">
                        <tr>
                          <th className="p-2">Language</th>
                          <th className="p-2 text-right">Recipients</th>
                          <th className="p-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8EAF0]">
                        {REGIONAL_LANGUAGES.map(lang => {
                          const count = audienceSummary.languageBreakdown[lang.name.toLowerCase()] ||
                            audienceSummary.languageBreakdown[lang.code] || 0;
                          return (
                            <tr key={lang.code} className="hover:bg-slate-50">
                              <td className="p-2">
                                <span className="font-semibold text-[#20283A]">{lang.name}</span>{' '}
                                <span className="text-[10px] text-[#737D90]">({lang.nativeName})</span>
                              </td>
                              <td className="p-2 text-right font-mono font-semibold">{count}</td>
                              <td className="p-2 text-right">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                                  Mapped
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                TAB 3: LANGUAGE APPROVAL & ANTI-SUBSTITUTION
            =================================================================== */}
            {activeRightTab === 'language' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#5269D9]" />
                    Regional Language Approvals
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Enforces strict approval before any regional variant is broadcast.
                  </p>
                </div>

                {/* Default Language Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#20283A]">Default Campaign Language</label>
                  <select
                    value={defaultLanguage}
                    onChange={e => setDefaultLanguage(e.target.value)}
                    className="w-full text-xs bg-white border border-[#E8EAF0] rounded-lg p-2 outline-none focus:border-[#5269D9] text-[#20283A]"
                  >
                    {REGIONAL_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Strict Anti-Substitution Toggle */}
                <div className="p-3 rounded-lg border border-[#E8EAF0] bg-[#FAFBFD] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#20283A]">Strict Anti-Substitution Rule</span>
                    <input
                      type="checkbox"
                      checked={strictAntiSubstitution}
                      onChange={e => setStrictAntiSubstitution(e.target.checked)}
                      className="rounded text-[#5269D9] focus:ring-0"
                    />
                  </div>
                  <p className="text-[10px] text-[#737D90]">
                    Blocks unapproved regional language dispatches rather than falling back to English.
                  </p>
                </div>

                {/* Approval Toggles for 6 Languages */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#20283A]">
                    Approval Status (All 6 Required)
                  </div>
                  {REGIONAL_LANGUAGES.map(lang => {
                    const isApproved = languageApprovals[lang.code] === true;
                    return (
                      <div
                        key={lang.code}
                        className="p-2.5 rounded-lg border border-[#E8EAF0] bg-white flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#20283A]">
                            {lang.name} <span className="font-normal text-[#737D90]">({lang.nativeName})</span>
                          </div>
                          <span className={`text-[10px] font-semibold ${isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {isApproved ? '✓ APPROVED FOR BROADCAST' : '⚠ PENDING APPROVAL'}
                          </span>
                        </div>
                        <button
                          onClick={() => setLanguageApprovals(prev => ({ ...prev, [lang.code]: !isApproved }))}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {isApproved ? 'Approved' : 'Approve'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================================================================
                TAB 4: OFFERS CATALOG & CONFLICT CHECK
            =================================================================== */}
            {activeRightTab === 'offers' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#5269D9]" />
                    Offer & Promotional Codes
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Attach promotional discounts and verify terms against poster facts.
                  </p>
                </div>

                {/* Offer Selection List */}
                <div className="space-y-2">
                  {offers.map(off => (
                    <div
                      key={off.id}
                      onClick={() => setSelectedOffer(off)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedOffer?.id === off.id
                          ? 'border-[#5269D9] bg-[#F5F7FF] shadow-2xs'
                          : 'border-[#E8EAF0] bg-white hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#20283A] font-mono">{off.code}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {off.discount}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737D90]">{off.description || 'Special Discount'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================
                TAB 5: SCHEDULE & FOLLOW-UPS
            =================================================================== */}
            {activeRightTab === 'schedule' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5269D9]" />
                    Dispatch Schedule
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Set campaign broadcast timing and automated sequence rules.
                  </p>
                </div>

                {/* Dispatch Mode Radio */}
                <div className="space-y-2">
                  <label
                    onClick={() => setScheduleMode('NOW')}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      scheduleMode === 'NOW' ? 'border-[#5269D9] bg-[#F5F7FF]' : 'border-[#E8EAF0] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sched_mode"
                      checked={scheduleMode === 'NOW'}
                      onChange={() => setScheduleMode('NOW')}
                      className="mt-0.5 text-[#5269D9]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#20283A]">Launch Now (Immediate Dispatch)</div>
                      <div className="text-[10px] text-[#737D90]">Broadcast enqueues as soon as confirmed.</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setScheduleMode('SCHEDULED')}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      scheduleMode === 'SCHEDULED' ? 'border-[#5269D9] bg-[#F5F7FF]' : 'border-[#E8EAF0] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sched_mode"
                      checked={scheduleMode === 'SCHEDULED'}
                      onChange={() => setScheduleMode('SCHEDULED')}
                      className="mt-0.5 text-[#5269D9]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#20283A]">Schedule for Later Date & Time</div>
                      <div className="text-[10px] text-[#737D90]">Automated dispatch at scheduled timestamp.</div>
                    </div>
                  </label>
                </div>

                {scheduleMode === 'SCHEDULED' && (
                  <div className="space-y-2 p-3 rounded-lg bg-[#FAFBFD] border border-[#E8EAF0]">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#20283A]">Dispatch Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="w-full text-xs bg-white border border-[#E8EAF0] rounded-lg p-2 text-[#20283A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#20283A]">Dispatch Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="w-full text-xs bg-white border border-[#E8EAF0] rounded-lg p-2 text-[#20283A]"
                      />
                    </div>
                    <div className="text-[10px] text-[#737D90] font-mono">Timezone: {timezone}</div>
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
                TAB 6: DUAL DEVICE PREVIEW & TELECOM DIAGNOSTICS
            =================================================================== */}
            {activeRightTab === 'preview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#5269D9]" />
                    Dual Device Live Preview
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Mobile simulation with live token substitution and telecom encoding diagnostics.
                  </p>
                </div>

                {/* Device Selector */}
                <div className="flex rounded-lg bg-slate-100 p-0.5">
                  <button
                    onClick={() => setPreviewDevice('whatsapp')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      previewDevice === 'whatsapp' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-[#737D90]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => setPreviewDevice('sms')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      previewDevice === 'sms' ? 'bg-white text-[#5269D9] shadow-2xs font-bold' : 'text-[#737D90]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> SMS Message
                  </button>
                </div>

                {/* Simulated Smartphone Screen */}
                <div className="border border-slate-300 rounded-2xl bg-slate-900 p-2 shadow-md">
                  <div className="w-20 h-3 mx-auto bg-slate-700 rounded-full mb-2"></div>
                  
                  <div className={`rounded-xl p-3 text-xs min-h-[220px] ${
                    previewDevice === 'whatsapp' ? 'bg-[#ECE5DD] text-slate-800' : 'bg-white text-slate-800'
                  }`}>
                    {previewDevice === 'whatsapp' ? (
                      <div className="bg-white rounded-lg p-2.5 shadow-2xs space-y-2 border border-slate-200">
                        {selectedCreative && (
                          <div className="rounded overflow-hidden max-h-36 bg-slate-100">
                            <img
                              src={selectedCreative.url.startsWith('http') ? selectedCreative.url : `${API_BASE}${selectedCreative.url}`}
                              alt="Poster"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-[11px] leading-relaxed">{composedFullMessage}</p>
                        <div className="text-[9px] text-right text-slate-400 font-mono">11:00 AM ✓✓</div>
                      </div>
                    ) : (
                      <div className="bg-[#E9F0FE] text-slate-800 rounded-xl p-3 shadow-2xs space-y-1.5 max-w-[90%]">
                        <p className="whitespace-pre-wrap text-[11px] leading-relaxed">{composedFullMessage}</p>
                        {selectedCreative && (
                          <div className="text-[10px] text-[#5269D9] font-mono underline">
                            Media Link: https://deals.vip/m/{selectedCreative.id.slice(-6)}
                          </div>
                        )}
                        <div className="text-[9px] text-right text-slate-400 font-mono">SMS</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Telecom Diagnostics Card */}
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-[#E8EAF0] space-y-2">
                  <div className="text-[11px] font-bold text-[#20283A] uppercase">
                    Telecom Diagnostics
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Encoding Standard:</span>
                      <span className="font-semibold text-[#20283A]">{telecomDiagnostics.encoding}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Character Count:</span>
                      <span className="font-mono">{telecomDiagnostics.charCount} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">SMS Segments:</span>
                      <span className="font-bold text-[#5269D9]">{telecomDiagnostics.segments} segment(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Est. Total Credits:</span>
                      <span className="font-bold text-emerald-600">{telecomDiagnostics.totalCreditsNeeded} credits</span>
                    </div>
                  </div>
                </div>

                {/* Pre-Flight Checklist */}
                <div className="p-3 rounded-xl bg-white border border-[#E8EAF0] space-y-2">
                  <div className="text-[11px] font-bold text-[#20283A] uppercase">
                    Pre-Flight Readiness Checklist
                  </div>
                  <div className="space-y-1.5">
                    {preFlightChecklist.checks.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-[#737D90]">{item.label}</span>
                        {item.pass ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Needed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                TAB 7: LAUNCH & EXECUTION TRACKING
            =================================================================== */}
            {activeRightTab === 'launch' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#5269D9]" />
                    Bulk Campaign Launch
                  </h3>
                  <p className="text-[11px] text-[#737D90] mt-0.5">
                    Confirm target recipients and initiate bulk broadcast.
                  </p>
                </div>

                {/* Execution Summary Box */}
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-[#E8EAF0] space-y-2">
                  <div className="text-[11px] font-bold text-[#20283A] uppercase">
                    Dispatch Summary
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Campaign Name:</span>
                      <span className="font-semibold text-[#20283A] truncate max-w-[160px]">{campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Channel:</span>
                      <span className="font-bold uppercase text-[#5269D9]">{channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Audience Segment:</span>
                      <span className="font-semibold text-[#20283A]">{selectedSegment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Net Recipients:</span>
                      <span className="font-bold text-emerald-600">{audienceSummary.totalSelected} contacts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Languages:</span>
                      <span className="font-semibold text-[#20283A]">{selectedLanguages.join(', ').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737D90]">Schedule Mode:</span>
                      <span className="font-semibold text-[#20283A]">{scheduleMode}</span>
                    </div>
                  </div>
                </div>

                {/* Launch Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setIsLaunchModalOpen(true)}
                    disabled={!preFlightChecklist.isReady || isLaunching}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#5269D9] hover:bg-[#4357c5] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className={`w-4 h-4 ${isLaunching ? 'animate-spin' : ''}`} />
                    <span>{isLaunching ? 'Executing Launch...' : 'Confirm & Launch Bulk Campaign'}</span>
                  </button>

                  <button
                    onClick={handleExplicitSaveDraft}
                    disabled={isSaving}
                    className="w-full py-2 px-3 rounded-xl border border-[#E8EAF0] bg-white hover:bg-slate-50 text-[#20283A] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-[#737D90]" />
                    <span>Save as Draft</span>
                  </button>
                </div>

                {/* Execution Telemetry Result Card if launched */}
                {launchResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Bulk Broadcast Active (Job #{launchResult.campaignId})
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Dispatched {launchResult.stats?.totalDispatched || audienceSummary.totalSelected} messages across SMS & WhatsApp carriers.
                    </p>
                    <button
                      onClick={() => setActiveNav('console')}
                      className="w-full mt-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Live Dispatch in Campaign Console
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* =========================================================================
          MODALS & DRAWERS
      ========================================================================= */}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        selectedAssetId={selectedCreative?.id}
        allowedTypes={['image']}
        onSelect={asset => {
          setSelectedCreative(asset);
          setIsMediaModalOpen(false);
          toast.success(`Selected media: ${asset.originalName || asset.id}`);
        }}
      />

      {/* Drafts Drawer / Modal */}
      {isDraftsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E8EAF0] shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#E8EAF0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#20283A] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#5269D9]" />
                Saved Visual Campaign Drafts
              </h3>
              <button
                onClick={() => setIsDraftsModalOpen(false)}
                className="p-1 text-[#737D90] hover:text-[#20283A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {draftsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737D90]">
                  No saved drafts found. Click "Save" in the toolbar to persist a draft.
                </div>
              ) : (
                draftsList.map(draft => (
                  <div
                    key={draft.id}
                    onClick={() => handleLoadDraft(draft)}
                    className="p-3 rounded-xl border border-[#E8EAF0] hover:border-[#5269D9] bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#20283A]">{draft.name || 'Untitled Draft'}</div>
                      <div className="text-[10px] text-[#737D90] mt-0.5">
                        Updated {new Date(draft.updatedAt || draft.createdAt).toLocaleString()} · {draft.channel.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => handleDeleteDraft(draft.id, e)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-[#A0AEC0]" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Launch Confirmation Modal */}
      <ConfirmDialog
        isOpen={isLaunchModalOpen}
        title="Confirm Bulk Campaign Launch"
        description={`You are about to launch "${campaignName}" to ${audienceSummary.totalSelected} recipients across ${selectedLanguages.length} approved regional languages.`}
        confirmLabel="Confirm & Dispatch Now"
        cancelLabel="Review Settings"
        confirmVariant="primary"
        isLoading={isLaunching}
        onConfirm={handleExecuteLaunch}
        onCancel={() => setIsLaunchModalOpen(false)}
      />

      {/* Reset Canvas Confirm Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Canvas Layout"
        description="Are you sure you want to reset the composer canvas? Unsaved block changes will be restored to default."
        confirmLabel="Reset Canvas"
        confirmVariant="danger"
        onConfirm={handleResetCanvas}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
