import React, { useState, useId, useMemo } from 'react';
import type {
  MediaAsset,
  AIContentGeneration,
  CampaignFollowUpContent,
  ExtractedOfferData,
  TemplateTone
} from '../types';
import { api, API_BASE } from '../services/api';
import { toast } from '../services/toast';
import { MediaPickerModal } from './ui/MediaPickerModal';
import {
  Sparkles,
  Upload,
  Clock,
  Save,
  Send,
  Trash2,
  RefreshCw,
  Check,
  Globe,
  Search,
  Star,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface RequiredRegionalLanguage {
  code: 'tamil' | 'telugu' | 'kannada' | 'malayalam' | 'hindi' | 'marathi';
  langCode: 'ta' | 'te' | 'kn' | 'ml' | 'hi' | 'mr';
  label: string;
  native: string;
  script: string;
}

// Exactly 6 Regional Languages for Initial Release
const REQUIRED_SIX_LANGUAGES: RequiredRegionalLanguage[] = [
  { code: 'tamil', langCode: 'ta', label: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
  { code: 'telugu', langCode: 'te', label: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
  { code: 'kannada', langCode: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'malayalam', langCode: 'ml', label: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
  { code: 'hindi', langCode: 'hi', label: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
  { code: 'marathi', langCode: 'mr', label: 'Marathi', native: 'मराठी', script: 'Devanagari' }
];

const TONES: Array<{ code: TemplateTone; label: string; desc: string }> = [
  { code: 'promotional', label: 'Promotional', desc: 'Direct, offer-focused' },
  { code: 'friendly', label: 'Friendly', desc: 'Warm customer engagement' },
  { code: 'festive', label: 'Festive', desc: 'Diwali & festive greetings' },
  { code: 'urgent', label: 'Urgent', desc: 'Expiring offer alert' },
  { code: 'professional', label: 'Professional', desc: 'Clean corporate voice' },
  { code: 'premium', label: 'Premium', desc: 'VIP privilege exclusive' }
];

interface AITemplateGeneratorProps {
  onApplyTemplate?: (text: string, media?: MediaAsset | null, channel?: 'both' | 'whatsapp' | 'sms') => void;
  customerCareNumber: string;
}

export const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({
  onApplyTemplate,
  customerCareNumber
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [attachedMediaAsset, setAttachedMediaAsset] = useState<MediaAsset | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputId = useId();

  // Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedOfferData>({
    businessName: 'Trends Lifestyle',
    productName: 'Apparel & Lifestyle',
    offerTitle: '50% Festive Grand Savings',
    discount: '50% OFF',
    couponCode: 'DIWALI50',
    validUntil: '30 Nov 2026',
    terms: 'Valid on select merchandise while stock lasts. T&C apply.',
    contactNumber: customerCareNumber || '+916369825386',
    websiteUrl: 'https://trendsfashion.in',
    callToAction: 'Shop Now & Save',
    campaignContext: 'Diwali Festive Mega Sale',
    needsConfirmation: ['terms', 'validUntil']
  });

  // Settings (Initial Release: Exactly 6 Regional Languages)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['tamil', 'telugu', 'kannada']);
  const [defaultCampaignLanguage, setDefaultCampaignLanguage] = useState<string>('tamil');
  const [languageSearch, setLanguageSearch] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<TemplateTone>('promotional');
  const [channel, setChannel] = useState<'both' | 'whatsapp' | 'sms'>('both');

  // Generated Content State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<AIContentGeneration | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string>('tamil');
  const [activeVariantType, setActiveVariantType] = useState<string>('primary');
  const [centerSubTab, setCenterSubTab] = useState<'variations' | 'followups'>('variations');

  // Searchable language filter
  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) return REQUIRED_SIX_LANGUAGES;
    const q = languageSearch.toLowerCase().trim();
    return REQUIRED_SIX_LANGUAGES.filter(
      l => l.label.toLowerCase().includes(q) || l.native.includes(q) || l.langCode.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [languageSearch]);

  // Follow-Up Sequence State
  const [followUps, setFollowUps] = useState<CampaignFollowUpContent[]>([]);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);

  // Preview Mode
  const [previewChannel, setPreviewChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Carrier Test Modal
  const [testRecipient, setTestRecipient] = useState(customerCareNumber || '+916369825386');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Handle Image Upload & Auto-Extraction
  const handleImageFileChange = async (file: File) => {
    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
    setAttachedMediaAsset(null);

    // Auto extract
    setIsExtracting(true);
    try {
      const res = await api.analyzeOfferImage({ file });
      if (res.extractedOfferData) {
        setExtractedData(res.extractedOfferData);
        if (res.sourceMediaAsset) setAttachedMediaAsset(res.sourceMediaAsset);
        toast.success('Offer Details Extracted', {
          description: `Extracted code: ${res.extractedOfferData.couponCode} (${res.extractedOfferData.discount})`
        });
      }
    } catch (err: any) {
      toast.error('Extraction Notice', { description: 'Using default offer schema: ' + err.message });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSelectFromLibrary = async (asset: MediaAsset) => {
    setAttachedMediaAsset(asset);
    setSelectedImage(null);
    setImagePreviewUrl(
      asset.assetStreamUrl?.startsWith('http')
        ? asset.assetStreamUrl
        : `${API_BASE}${asset.assetStreamUrl || `/api/media/asset/${asset.id}`}`
    );

    setIsExtracting(true);
    try {
      const res = await api.analyzeOfferImage({ mediaId: asset.id });
      if (res.extractedOfferData) {
        setExtractedData(res.extractedOfferData);
        toast.success('Asset Analyzed', {
          description: `Extracted "${res.extractedOfferData.offerTitle}" from media library asset.`
        });
      }
    } catch (err: any) {
      toast.error('Analysis Notice', { description: err.message });
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleLanguage = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      if (selectedLanguages.length === 1) {
        toast.warning('At least one language must be selected.');
        return;
      }
      setSelectedLanguages(prev => prev.filter(l => l !== langCode));
      if (defaultCampaignLanguage === langCode) {
        const remaining = selectedLanguages.filter(l => l !== langCode);
        if (remaining.length > 0) setDefaultCampaignLanguage(remaining[0]);
      }
    } else {
      setSelectedLanguages(prev => [...prev, langCode]);
    }
  };

  const handleSetDefaultLanguage = (langCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedLanguages.includes(langCode)) {
      setSelectedLanguages(prev => [...prev, langCode]);
    }
    setDefaultCampaignLanguage(langCode);
    const langObj = REQUIRED_SIX_LANGUAGES.find(l => l.code === langCode);
    toast.success('Default Language Selected', {
      description: `${langObj?.label || langCode} (${langObj?.native}) set as campaign default.`
    });
  };

  // Generate Multilingual Templates & Follow-Ups
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const gen = await api.generateAITemplates({
        sourceMediaId: attachedMediaAsset?.id || null,
        sourceMediaAsset: attachedMediaAsset || null,
        extractedOfferData: extractedData,
        languages: selectedLanguages,
        channel,
        tone: selectedTone
      });

      setCurrentGeneration(gen);
      setActiveLanguage(selectedLanguages[0] || 'tamil');
      setActiveVariantType('primary');

      toast.success('Multilingual Content Generated', {
        description: `Generated ${gen.variants.length} variations across ${selectedLanguages.length} regional language(s).`
      });

      // Automatically generate 4-stage sequence follow-ups
      generateFollowUpSequence(gen.id);
    } catch (err: any) {
      toast.error('Generation Failed', { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFollowUpSequence = async (genId?: string) => {
    const id = genId || currentGeneration?.id;
    if (!id) return;
    setIsGeneratingFollowUps(true);
    try {
      const res = await api.generateAIFollowUps({
        generationId: id,
        languages: selectedLanguages,
        channel,
        tone: selectedTone,
        extractedOfferData: extractedData,
        schedule: [
          { sequenceNumber: 1, interval: '0h (Immediate)', stage: 'INITIAL' },
          { sequenceNumber: 2, interval: 'Day 3 — 11:00 AM', stage: 'REMINDER' },
          { sequenceNumber: 3, interval: 'Day 5 — 5:00 PM', stage: 'REINFORCEMENT' },
          { sequenceNumber: 4, interval: 'Day 7 — 12:00 PM', stage: 'EXPIRY' }
        ]
      });
      if (res.followUps) {
        setFollowUps(res.followUps);
      }
    } catch (e: any) {
      console.warn('Follow-up generation warning:', e.message);
    } finally {
      setIsGeneratingFollowUps(false);
    }
  };

  // Get active variant
  const activeVariants = currentGeneration?.variants.filter(
    v => v.language.toLowerCase() === activeLanguage.toLowerCase()
  ) || [];

  const activeVariant = activeVariants.find(v => v.variantType === activeVariantType) || activeVariants[0];

  const handleUpdateActiveVariantText = async (newText: string) => {
    if (!currentGeneration || !activeVariant) return;
    try {
      const res = await api.updateAITemplateVariant(currentGeneration.id, activeVariant.id, newText);
      if (res.variant) {
        setCurrentGeneration(prev => {
          if (!prev) return null;
          return {
            ...prev,
            variants: prev.variants.map(v => (v.id === activeVariant.id ? res.variant : v))
          };
        });
      }
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
    }
  };

  const handleApproveVariant = async () => {
    if (!currentGeneration || !activeVariant) return;
    try {
      const res = await api.approveAITemplateVariant(currentGeneration.id, activeVariant.id);
      if (res.success) {
        setCurrentGeneration(prev => {
          if (!prev) return null;
          return {
            ...prev,
            variants: prev.variants.map(v => (v.id === activeVariant.id ? { ...v, approvalStatus: 'APPROVED' } : v))
          };
        });
        toast.success('Variant Approved', {
          description: `Approved ${activeVariant.language.toUpperCase()} (${activeVariant.variantType}) for broadcast.`
        });
      }
    } catch (err: any) {
      toast.error('Approval Failed', { description: err.message });
    }
  };

  const handleApproveLanguage = async (languageToApprove: string) => {
    if (!currentGeneration) return;
    try {
      const variantsForLang = currentGeneration.variants.filter(
        v => v.language.toLowerCase() === languageToApprove.toLowerCase()
      );
      for (const v of variantsForLang) {
        await api.approveAITemplateVariant(currentGeneration.id, v.id);
      }
      setCurrentGeneration(prev => {
        if (!prev) return null;
        return {
          ...prev,
          variants: prev.variants.map(v =>
            v.language.toLowerCase() === languageToApprove.toLowerCase()
              ? { ...v, approvalStatus: 'APPROVED', approved: true }
              : v
          )
        };
      });
      const langObj = REQUIRED_SIX_LANGUAGES.find(l => l.code === languageToApprove);
      toast.success('Language Version Approved', {
        description: `All variants for ${langObj?.label || languageToApprove} (${langObj?.native || ''}) approved for bulk broadcast.`
      });
    } catch (err: any) {
      toast.error('Approval Failed', { description: err.message });
    }
  };

  const handleSaveToLibrary = async () => {
    if (!currentGeneration || !activeVariant) return;
    try {
      const name = `${extractedData.businessName} - ${activeVariant.language.toUpperCase()} (${activeVariant.variantType})`;
      await api.saveAITemplateToLibrary(currentGeneration.id, {
        variantId: activeVariant.id,
        templateName: name,
        category: 'AI_Campaigns'
      });
      toast.success('Template Saved to Shared Library', {
        description: `"${name}" stored for bulk broadcast and automation workflows.`
      });
    } catch (err: any) {
      toast.error('Save Failed', { description: err.message });
    }
  };

  const handleSendTestMessage = async () => {
    if (!currentGeneration || !activeVariant || !testRecipient) return;
    setIsSendingTest(true);
    try {
      const res = await api.testAITemplateVariant(currentGeneration.id, {
        variantId: activeVariant.id,
        recipient: testRecipient
      });
      if (res.success) {
        toast.success('Carrier Test Dispatched', {
          description: `Delivered test in ${activeVariant.language.toUpperCase()} to ${testRecipient}`
        });
      } else {
        toast.error('Carrier Rejected Test', { description: res.details?.error || res.message });
      }
    } catch (err: any) {
      toast.error('Test Failed', { description: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleUseInCampaign = async () => {
    if (!currentGeneration || !activeVariant) return;
    try {
      const res = await api.useAITemplateInCampaign(currentGeneration.id, {
        variantId: activeVariant.id,
        campaignName: `${extractedData.businessName} ${activeVariant.language.toUpperCase()} Campaign`,
        validUntil: extractedData.validUntil
      });
      if (res.success) {
        toast.success('Campaign Enqueued', {
          description: `Created campaign #${res.campaignId} with ${activeVariant.language.toUpperCase()} content.`
        });
        if (onApplyTemplate) {
          onApplyTemplate(activeVariant.messageBody, attachedMediaAsset, channel);
        }
      }
    } catch (err: any) {
      toast.error('Campaign Creation Failed', { description: err.message });
    }
  };

  // Preview formatting
  const previewText = (activeVariant?.messageBody || '')
    .replace(/\{\{customer_name\}\}/g, 'Alexander Wright')
    .replace(/\{\{1\}\}/g, 'Alexander Wright')
    .replace(/\{\{business_name\}\}/g, extractedData.businessName)
    .replace(/\{\{offer_name\}\}/g, extractedData.offerTitle)
    .replace(/\{\{offer_code\}\}/g, extractedData.couponCode)
    .replace(/\{\{valid_until\}\}/g, extractedData.validUntil)
    .replace(/\{\{care_number\}\}/g, extractedData.contactNumber);

  const shortlink = attachedMediaAsset
    ? `\n\nMedia: https://campaigns.reach/m/${attachedMediaAsset.id.slice(-6)}`
    : '';

  const smsFullText = `${previewText}${shortlink}`;
  const charCount = previewChannel === 'sms' ? smsFullText.length : previewText.length;
  const isUnicode = activeVariant?.encoding === 'Unicode' || Array.from(previewText).some(c => c.charCodeAt(0) > 127);
  const estimatedSegments = isUnicode ? Math.ceil(charCount / 70) || 1 : Math.ceil(charCount / 160) || 1;

  return (
    <div className="space-y-6">
      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* =========================================================================
            LEFT COLUMN: Offer Creative & Multilingual Controls (4 cols)
           ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E8EAF0] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5269D9]" />
              <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">AI Offer Ingestion</h3>
            </div>
            <span className="text-[10px] font-semibold text-[#5269D9] bg-[#EEF1FC] px-2 py-0.5 rounded">
              OCR + Multimodal
            </span>
          </div>

          {/* Step 1: Upload Creative */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#20283A]">Step 1: Promotional Creative</label>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="text-[11px] font-semibold text-[#5269D9] hover:underline cursor-pointer"
              >
                Media Library →
              </button>
            </div>

            {imagePreviewUrl ? (
              <div className="relative rounded-xl border border-[#E8EAF0] overflow-hidden bg-[#F7F8FC] group">
                <img
                  src={imagePreviewUrl}
                  alt="Uploaded Poster"
                  className="w-full h-36 object-contain bg-white"
                />
                <div className="p-2 border-t border-[#E8EAF0] bg-white flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#20283A] truncate max-w-[180px]">
                    {selectedImage?.name || attachedMediaAsset?.originalName || 'Promotional Poster'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreviewUrl(null);
                      setAttachedMediaAsset(null);
                    }}
                    className="text-[#DC2626] hover:bg-[#FDF2F2] p-1 rounded transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#D9E0F8] hover:border-[#5269D9] bg-[#F7F8FC] rounded-xl p-4 text-center transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  id={fileInputId}
                  onChange={e => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor={fileInputId} className="cursor-pointer space-y-1.5 block">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF1FC] text-[#5269D9] flex items-center justify-center mx-auto">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-[#20283A]">Upload Promotional Poster</p>
                  <p className="text-[10px] text-[#737D90]">JPG, PNG, WebP banner or festival creative</p>
                </label>
              </div>
            )}
          </div>

          {/* Step 2: Extracted Offer Form */}
          <div className="space-y-2.5 pt-2 border-t border-[#E8EAF0]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#20283A]">Step 2: Extracted Offer Fields</label>
              {isExtracting && (
                <span className="text-[10px] text-[#5269D9] font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Analyzing image...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#737D90] font-medium block">Business / Brand</span>
                <input
                  type="text"
                  value={extractedData.businessName}
                  onChange={e => setExtractedData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-2.5 py-1 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A]"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#737D90] font-medium block">Offer Discount</span>
                <input
                  type="text"
                  value={extractedData.discount}
                  onChange={e => setExtractedData(prev => ({ ...prev, discount: e.target.value }))}
                  className="w-full px-2.5 py-1 text-xs font-bold text-[#16A36A] bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#737D90] font-medium block">Coupon Code</span>
                <input
                  type="text"
                  value={extractedData.couponCode}
                  onChange={e => setExtractedData(prev => ({ ...prev, couponCode: e.target.value }))}
                  className="w-full px-2.5 py-1 text-xs font-mono font-bold text-[#5269D9] bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#737D90] font-medium block">Valid Until</span>
                <input
                  type="text"
                  value={extractedData.validUntil}
                  onChange={e => setExtractedData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-2.5 py-1 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A]"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#737D90] font-medium block">Offer Title / Campaign Context</span>
              <input
                type="text"
                value={extractedData.offerTitle}
                onChange={e => setExtractedData(prev => ({ ...prev, offerTitle: e.target.value }))}
                className="w-full px-2.5 py-1 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A]"
              />
            </div>
          </div>

          {/* Step 3: Regional Language Selector (Searchable Selection Cards) */}
          <div className="space-y-2 pt-2 border-t border-[#E8EAF0]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#20283A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#5269D9]" /> Step 3: Regional Languages (6 Required)
              </label>
              <span className="text-[10px] font-semibold text-[#5269D9] bg-[#EEF1FC] px-1.5 py-0.5 rounded">
                {selectedLanguages.length} Active
              </span>
            </div>

            {/* Searchable Language Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#737D90] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={languageSearch}
                onChange={e => setLanguageSearch(e.target.value)}
                placeholder="Search languages (e.g. தமிழ், te, Hindi)..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] placeholder-[#737D90] focus:bg-white focus:outline-none focus:border-[#5269D9] transition-all"
              />
            </div>

            {/* Searchable Selection Cards Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {filteredLanguages.map(lang => {
                const isSelected = selectedLanguages.includes(lang.code);
                const isDefault = defaultCampaignLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#EEF1FC] border-[#5269D9] shadow-2xs'
                        : 'bg-[#F7F8FC] border-[#E8EAF0] hover:border-[#D9E0F8] opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#20283A]">{lang.label}</span>
                          <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-white border border-[#E8EAF0] text-[#5269D9]">
                            {lang.langCode}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#5269D9] mt-0.5">{lang.native}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 accent-[#5269D9] cursor-pointer"
                      />
                    </div>

                    <div className="mt-2 pt-1 border-t border-[#E8EAF0]/60 flex items-center justify-between">
                      <span className="text-[9px] text-[#737D90]">{lang.script} Script</span>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => handleSetDefaultLanguage(lang.code, e)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                            isDefault
                              ? 'bg-[#5269D9] text-white shadow-2xs font-bold'
                              : 'bg-white hover:bg-[#EEF1FC] text-[#5269D9] border border-[#D9E0F8]'
                          }`}
                          title="Set as Default Campaign Language"
                        >
                          {isDefault ? '★ Default' : 'Set Default'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Default Campaign Language Badge */}
            <div className="flex items-center justify-between text-[11px] bg-[#F7F8FC] px-2.5 py-1.5 rounded-lg border border-[#E8EAF0]">
              <span className="text-[#737D90]">Campaign Default Language:</span>
              <span className="font-bold text-[#5269D9] flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#5269D9]" />
                {REQUIRED_SIX_LANGUAGES.find(l => l.code === defaultCampaignLanguage)?.label || defaultCampaignLanguage}
                {' '}({REQUIRED_SIX_LANGUAGES.find(l => l.code === defaultCampaignLanguage)?.native})
              </span>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1 pt-2 border-t border-[#E8EAF0]">
            <label className="text-xs font-bold text-[#20283A]">Language Tone</label>
            <div className="grid grid-cols-3 gap-1.5">
              {TONES.map(t => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setSelectedTone(t.code)}
                  className={`py-1 px-1.5 rounded-lg border text-center text-[10px] font-semibold transition-all cursor-pointer ${
                    selectedTone === t.code
                      ? 'bg-[#16A36A] text-white border-[#16A36A] shadow-2xs'
                      : 'bg-[#F7F8FC] border-[#E8EAF0] text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selector */}
          <div className="space-y-1 pt-2 border-t border-[#E8EAF0]">
            <label className="text-xs font-bold text-[#20283A]">Delivery Channel</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setChannel('both')}
                className={`py-1 px-1.5 rounded-lg border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                  channel === 'both' ? 'bg-[#5269D9] text-white border-[#5269D9] font-bold shadow-2xs' : 'bg-[#F7F8FC] border-[#E8EAF0] text-[#737D90]'
                }`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-1 px-1.5 rounded-lg border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                  channel === 'whatsapp' ? 'bg-[#16A36A] text-white border-[#16A36A] font-bold shadow-2xs' : 'bg-[#F7F8FC] border-[#E8EAF0] text-[#737D90]'
                }`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`py-1 px-1.5 rounded-lg border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                  channel === 'sms' ? 'bg-[#4388D8] text-white border-[#4388D8] font-bold shadow-2xs' : 'bg-[#F7F8FC] border-[#E8EAF0] text-[#737D90]'
                }`}
              >
                SMS
              </button>
            </div>
          </div>

          {/* Primary Generation Button */}
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={isGenerating || isExtracting}
            className="w-full py-2.5 px-3 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Native Scripts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Multilingual Variations</span>
              </>
            )}
          </button>
        </div>

        {/* =========================================================================
            CENTER COLUMN: Generated Variations & Sequence Follow-ups (5 cols)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E8EAF0] p-4 sm:p-5 shadow-xs space-y-4">
          {/* Header & Sub-Tab Switcher */}
          <div className="border-b border-[#E8EAF0] pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">Generated Content Studio</h3>
              <p className="text-[11px] text-[#737D90]">Audited native-script templates and automated follow-ups</p>
            </div>

            <div className="flex items-center gap-1 bg-[#F7F8FC] p-0.5 rounded-lg border border-[#E8EAF0]">
              <button
                type="button"
                onClick={() => setCenterSubTab('variations')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  centerSubTab === 'variations' ? 'bg-white text-[#5269D9] shadow-2xs' : 'text-[#737D90]'
                }`}
              >
                Variations
              </button>
              <button
                type="button"
                onClick={() => setCenterSubTab('followups')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  centerSubTab === 'followups' ? 'bg-white text-[#5269D9] shadow-2xs' : 'text-[#737D90]'
                }`}
              >
                Follow-Up Sequence ({followUps.length || 3})
              </button>
            </div>
          </div>

          {/* SubTab 1: Variations */}
          {centerSubTab === 'variations' && (
            <div className="space-y-3.5">
              {/* Language Switcher Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#F1F4F9]">
                {selectedLanguages.map(lang => {
                  const langDef = REQUIRED_SIX_LANGUAGES.find(l => l.code === lang);
                  const isCurrent = activeLanguage.toLowerCase() === lang.toLowerCase();
                  const isLangApproved = currentGeneration?.variants
                    ?.filter(v => v.language.toLowerCase() === lang.toLowerCase())
                    .every(v => v.approvalStatus === 'APPROVED' || v.approved);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLanguage(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#5269D9] text-white shadow-2xs'
                          : 'bg-[#F7F8FC] text-[#737D90] hover:text-[#20283A] border border-[#E8EAF0]'
                      }`}
                    >
                      <span>{langDef?.label || lang}</span>
                      <span className="text-[10px] opacity-80">({langDef?.native})</span>
                      {isLangApproved ? (
                        <span className="text-[10px] text-[#16A36A] font-bold">✓</span>
                      ) : (
                        <span className="text-[10px] text-[#E5A23B] font-bold">●</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Language Approval Strip & Strict Substitution Compliance Notice */}
              {(() => {
                const activeLangDef = REQUIRED_SIX_LANGUAGES.find(l => l.code === activeLanguage);
                const isCurrentLangApproved = currentGeneration?.variants
                  ?.filter(v => v.language.toLowerCase() === activeLanguage.toLowerCase())
                  .every(v => v.approvalStatus === 'APPROVED' || v.approved);
                return (
                  <div className="bg-[#EEF1FC]/60 border border-[#D9E0F8] rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {isCurrentLangApproved ? (
                        <span className="inline-flex items-center gap-1 text-[#16A36A] font-bold text-[11px] bg-white border border-[#C8EEDC] px-2 py-0.5 rounded-full shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5" /> {activeLangDef?.label || activeLanguage} Approved for Broadcast
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#E5A23B] font-bold text-[11px] bg-white border border-[#FBE3B5] px-2 py-0.5 rounded-full shadow-2xs">
                          <ShieldAlert className="w-3.5 h-3.5" /> {activeLangDef?.label || activeLanguage} Review Required
                        </span>
                      )}
                      <span className="text-[10px] text-[#737D90]">Strict Policy: No automatic language substitution.</span>
                    </div>

                    {!isCurrentLangApproved && currentGeneration && (
                      <button
                        type="button"
                        onClick={() => handleApproveLanguage(activeLanguage)}
                        className="px-2.5 py-1 bg-[#16A36A] hover:bg-[#138656] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve {activeLangDef?.label || activeLanguage} Version
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Variant Type Switcher */}
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { id: 'primary', label: 'Primary' },
                  { id: 'short', label: 'Short' },
                  { id: 'friendly', label: 'Friendly' },
                  { id: 'urgency', label: 'Urgency' },
                  { id: 'whatsapp', label: 'WhatsApp' }
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveVariantType(v.id)}
                    className={`py-1.5 px-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer truncate ${
                      activeVariantType === v.id
                        ? 'bg-[#EEF1FC] text-[#5269D9] border border-[#D9E0F8] font-bold'
                        : 'bg-[#F7F8FC] text-[#737D90] hover:text-[#20283A]'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Editable Textarea for Active Variant */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#20283A]">
                    {activeVariant?.label || 'Template Copy'} ({activeLanguage.toUpperCase()})
                  </span>
                  <span className="text-[11px] text-[#737D90]">
                    {activeVariant?.characterCount || 0} chars • {activeVariant?.encoding || 'Unicode'}
                  </span>
                </div>

                <textarea
                  value={activeVariant?.messageBody || ''}
                  onChange={e => handleUpdateActiveVariantText(e.target.value)}
                  rows={7}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-xl p-3 text-xs text-[#20283A] font-sans leading-relaxed focus:bg-white focus:outline-none focus:border-[#5269D9] transition-all resize-none shadow-2xs"
                  placeholder="Generated message copy will appear here..."
                />
              </div>

              {/* Merge Token Shortcuts */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleUpdateActiveVariantText((activeVariant?.messageBody || '') + ' {{customer_name}}')}
                  className="px-2 py-0.5 bg-[#EEF1FC] text-[#5269D9] rounded font-mono font-semibold cursor-pointer"
                >
                  + {"{{customer_name}}"}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateActiveVariantText((activeVariant?.messageBody || '') + ' {{offer_code}}')}
                  className="px-2 py-0.5 bg-[#EEF1FC] text-[#5269D9] rounded font-mono font-semibold cursor-pointer"
                >
                  + {"{{offer_code}}"}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateActiveVariantText((activeVariant?.messageBody || '') + ' {{valid_until}}')}
                  className="px-2 py-0.5 bg-[#EEF1FC] text-[#5269D9] rounded font-mono font-semibold cursor-pointer"
                >
                  + {"{{valid_until}}"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8EAF0]">
                <button
                  type="button"
                  onClick={handleApproveVariant}
                  className="py-1.5 px-3 bg-[#E8F7F0] hover:bg-[#C8EEDC] text-[#16A36A] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-[#C8EEDC]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{activeVariant?.approvalStatus === 'APPROVED' ? 'Approved ✓' : 'Approve Variant'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className="py-1.5 px-3 bg-white hover:bg-[#F7F8FC] text-[#20283A] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-[#E8EAF0] shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#5269D9]" />
                  <span>Save to Library</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="py-1.5 px-3 bg-[#EEF1FC] hover:bg-[#D9E0F8] text-[#5269D9] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-[#D9E0F8] disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Testing...' : 'Carrier Test'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseInCampaign}
                  className="py-1.5 px-3 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Use in Campaign 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* SubTab 2: Follow-Up Sequence Schedule */}
          {centerSubTab === 'followups' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#737D90]">Schedule-Aware Sequences ({activeLanguage.toUpperCase()})</span>
                <button
                  type="button"
                  onClick={() => generateFollowUpSequence()}
                  disabled={isGeneratingFollowUps}
                  className="text-[11px] text-[#5269D9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingFollowUps ? 'animate-spin' : ''}`} />
                  Regenerate Sequence
                </button>
              </div>

              {followUps.filter(f => f.language.toLowerCase() === activeLanguage.toLowerCase()).length === 0 ? (
                <div className="border border-dashed border-[#E8EAF0] rounded-xl p-6 text-center space-y-2">
                  <Clock className="w-6 h-6 text-[#737D90]/50 mx-auto" />
                  <p className="text-xs font-semibold text-[#20283A]">No Follow-up Sequence Generated</p>
                  <button
                    type="button"
                    onClick={() => generateFollowUpSequence()}
                    className="px-3 py-1.5 bg-[#5269D9] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Generate Follow-Ups for {activeLanguage.toUpperCase()}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {followUps
                    .filter(f => f.language.toLowerCase() === activeLanguage.toLowerCase())
                    .map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-[#F7F8FC] border border-[#E8EAF0] rounded-xl p-3 space-y-1.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#5269D9] text-[11px] flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {item.stage === 'INITIAL'
                              ? '1. Initial Promotional Broadcast'
                              : item.stage === 'REMINDER'
                              ? '2. Follow-Up 1 (Reminder)'
                              : item.stage === 'REINFORCEMENT'
                              ? '3. Follow-Up 2 (Reinforce Offer)'
                              : '4. Final Follow-Up (Offer Closing)'}
                          </span>
                          <span className="text-[10px] bg-white border border-[#E8EAF0] px-1.5 py-0.5 rounded font-mono text-[#737D90]">
                            {item.scheduledInterval}
                          </span>
                        </div>

                        <p className="text-[#20283A] leading-relaxed font-sans">{item.messageBody}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-[#E8EAF0] text-[10px] text-[#737D90]">
                          <span>Rule: <strong>{item.eligibilityRule}</strong></span>
                          <span className="text-[#16A36A] font-semibold">Eligibility Verified ✓</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Live Mobile Preview & Telecom Telemetry (3 cols)
           ========================================================================= */}
        <div className="lg:col-span-3 bg-[#F7F8FC] rounded-xl border border-[#E8EAF0] p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Preview Channel Toggle */}
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-2">
              <span className="text-xs font-bold text-[#20283A]">Live Device Rendering</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E8EAF0]">
                <button
                  type="button"
                  onClick={() => setPreviewChannel('whatsapp')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                    previewChannel === 'whatsapp' ? 'bg-[#16A36A] text-white' : 'text-[#737D90]'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewChannel('sms')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                    previewChannel === 'sms' ? 'bg-[#4388D8] text-white' : 'text-[#737D90]'
                  }`}
                >
                  SMS
                </button>
              </div>
            </div>

            {/* Bubble rendering */}
            {previewChannel === 'whatsapp' ? (
              <div className="bg-[#DCF8C6]/25 border border-[#C8EEDC] rounded-2xl p-3 shadow-2xs space-y-2">
                {/* Media banner if present */}
                {imagePreviewUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#A7E2BE] bg-white">
                    <img
                      src={imagePreviewUrl}
                      alt="Banner Preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                <p className="text-xs text-[#20283A] whitespace-pre-line leading-relaxed font-sans">
                  {previewText}
                </p>
                <div className="pt-2 border-t border-[#A7E2BE]/40 flex items-center justify-between text-[10px] text-[#737D90]">
                  <span>Alexander Wright</span>
                  <span className="text-[#16A36A] font-bold">✓✓</span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E8EAF0] rounded-2xl p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#737D90] pb-1 border-b border-[#F1F4F9]">
                  <span>TR-TRENDS</span>
                  <span className="font-mono">{charCount} chars • {estimatedSegments} segment(s)</span>
                </div>
                <p className="text-xs text-[#20283A] whitespace-pre-line leading-relaxed font-sans">
                  {previewText}
                  {attachedMediaAsset && (
                    <span className="block mt-2 text-[#4388D8] underline font-mono text-[10px]">
                      {shortlink.trim()}
                    </span>
                  )}
                </p>
                <div className="pt-2 border-t border-[#F1F4F9] flex items-center justify-between text-[10px] text-[#737D90]">
                  <span>To: Alexander Wright</span>
                  <span className="text-[#4388D8] font-semibold">Cellular</span>
                </div>
              </div>
            )}

            {/* Telecom Diagnostics */}
            <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#737D90]">Encoding Standard:</span>
                <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                  isUnicode ? 'bg-[#FDF6EC] text-[#E5A23B]' : 'bg-[#E8F7F0] text-[#16A36A]'
                }`}>
                  {isUnicode ? 'Unicode (UCS-2)' : 'GSM-7 (Standard)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737D90]">SMS Segments:</span>
                <span className="font-mono font-bold text-[#20283A]">{estimatedSegments} Segment(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737D90]">Approval Status:</span>
                <span className={`font-bold text-[10px] px-1.5 py-0.2 rounded ${
                  activeVariant?.approvalStatus === 'APPROVED'
                    ? 'bg-[#E8F7F0] text-[#16A36A]'
                    : 'bg-[#EEF1FC] text-[#5269D9]'
                }`}>
                  {activeVariant?.approvalStatus || 'PENDING'}
                </span>
              </div>
            </div>

            {/* Pre-Flight Carrier Test Box */}
            <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#20283A]">
                <span>Carrier Test Dispatch</span>
                <span className="text-[10px] font-medium text-[#5269D9]">Single Recipient</span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={testRecipient}
                  onChange={e => setTestRecipient(e.target.value)}
                  placeholder="+916369825386"
                  className="flex-1 px-2.5 py-1 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9]"
                />
                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest || !activeVariant}
                  className="px-3 py-1 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSendingTest ? 'Sending...' : 'Test'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#737D90] leading-relaxed">
            * Regional translations use natural regional expressions rather than word-for-word literal translations.
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        selectedAssetId={attachedMediaAsset?.id}
        onSelect={handleSelectFromLibrary}
      />
    </div>
  );
};
