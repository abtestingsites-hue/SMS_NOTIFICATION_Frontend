import React, { useState, useId, useEffect } from 'react';
import type { MediaAsset, SavedTemplate } from '../types';
import { api, API_BASE } from '../services/api';
import { toast } from '../services/toast';
import { MediaPickerModal } from './ui/MediaPickerModal';
import {
  Upload,
  FileText,
  Smartphone,
  Save,
  CheckCircle2,
  Paperclip,
  Trash2,
  FolderOpen,
  Plus
} from 'lucide-react';
import { HorizontalBarChart } from './ui/HorizontalBarChart';

interface TemplateStat {
  category: string;
  count: number;
}

interface MessageTemplatesProps {
  template: string;
  setTemplate: (tpl: string) => void;
  templateStats: TemplateStat[];
  onUploadTemplates: (file: File) => Promise<void>;
  onSaveTemplate: (text: string, mediaAsset?: MediaAsset | null, channel?: 'both' | 'whatsapp' | 'sms') => Promise<void>;
  customerCareNumber: string;
  attachedMedia?: MediaAsset | null;
  setAttachedMedia?: (asset: MediaAsset | null) => void;
  selectedChannel?: 'both' | 'whatsapp' | 'sms';
  setSelectedChannel?: (channel: 'both' | 'whatsapp' | 'sms') => void;
}

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  template,
  setTemplate,
  templateStats,
  onUploadTemplates,
  onSaveTemplate,
  customerCareNumber,
  attachedMedia: propAttachedMedia,
  setAttachedMedia: propSetAttachedMedia,
  selectedChannel: propSelectedChannel,
  setSelectedChannel: propSetSelectedChannel
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'ingestion' | 'categories'>('editor');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputId = useId();

  // Local state fallbacks if props are not passed
  const [internalMedia, setInternalMedia] = useState<MediaAsset | null>(null);
  const attachedMedia = propAttachedMedia !== undefined ? propAttachedMedia : internalMedia;
  const setAttachedMedia = propSetAttachedMedia || setInternalMedia;

  const [internalChannel, setInternalChannel] = useState<'both' | 'whatsapp' | 'sms'>('both');
  const channel = propSelectedChannel !== undefined ? propSelectedChannel : internalChannel;
  const setChannel = propSetSelectedChannel || setInternalChannel;

  // Preview channel switcher (WhatsApp vs SMS)
  const [previewChannel, setPreviewChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Saved templates from library
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const list = await api.getSavedTemplates();
      setSavedTemplates(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.warn('Could not load saved templates:', err.message);
    }
  };

  const totalTemplates = templateStats.reduce((sum, s) => sum + s.count, 0) || 5;

  const insertToken = (token: string) => {
    setTemplate(template ? `${template} ${token}` : token);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTemplate(template, attachedMedia, channel);
      toast.success('Template Saved', {
        description: `Template copy, channel (${channel.toUpperCase()}), and media attachments persisted.`
      });
    } catch (err: any) {
      toast.error('Save Failed', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!saveTemplateName.trim()) {
      toast.error('Template Name Required', { description: 'Please provide a descriptive name for this template.' });
      return;
    }
    setIsSavingToLibrary(true);
    try {
      await api.saveSavedTemplate({
        name: saveTemplateName.trim(),
        body: template,
        channel: channel,
        mediaId: attachedMedia?.id || null,
        mediaAsset: attachedMedia,
        category: 'Promotional'
      });
      toast.success('Template Stored in Library', {
        description: `"${saveTemplateName}" is now available across Campaign Console and Automations.`
      });
      setShowSaveDialog(false);
      setSaveTemplateName('');
      await loadSavedTemplates();
    } catch (err: any) {
      toast.error('Save to Library Failed', { description: err.message });
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const handleLoadTemplate = (saved: SavedTemplate) => {
    setTemplate(saved.body);
    if (saved.channel) setChannel(saved.channel);
    if (saved.mediaAsset) {
      setAttachedMedia(saved.mediaAsset);
    } else {
      setAttachedMedia(null);
    }
    setActiveTab('editor');
    toast.info('Template Loaded', {
      description: `Loaded "${saved.name}" with attached media and channel settings.`
    });
  };

  const handleDeleteSavedTemplate = async (id: string, name: string) => {
    try {
      await api.deleteSavedTemplate(id);
      toast.success('Template Deleted', { description: `Removed "${name}" from library.` });
      await loadSavedTemplates();
    } catch (err: any) {
      toast.error('Delete Failed', { description: err.message });
    }
  };

  const handleUpload = async () => {
    if (!templateFile) return;
    setIsUploading(true);
    try {
      await onUploadTemplates(templateFile);
      toast.success('Templates Uploaded', {
        description: 'Category-segmented templates uploaded and synced.'
      });
      setTemplateFile(null);
    } catch (err: any) {
      toast.error('Upload Failed', { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  // Preview text generation
  const renderPreview = () => {
    let text = template || '';
    text = text.split('{{1}}').join('Alexander Wright').split('{1}').join('Alexander Wright');
    text = text.split('{{2}}').join('Special 25% Off with Code: SPRING25').split('{2}').join('Special 25% Off with Code: SPRING25');
    text = text.split('{{3}}').join('15 Aug 2026').split('{3}').join('15 Aug 2026');
    text = text.split('{{care_number}}').join(customerCareNumber || '+916369825386');
    return text;
  };

  const preview = renderPreview();

  // Shortlink for SMS preview
  const shortlinkPreview = attachedMedia
    ? `\n\nMedia: https://campaigns.reach/m/${attachedMedia.id.slice(-6)}`
    : '';

  const smsPreviewFull = `${preview}${shortlinkPreview}`;
  const charCount = previewChannel === 'sms' ? smsPreviewFull.length : preview.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  const categoryBarItems = templateStats.map((stat, i) => ({
    label: stat.category,
    value: stat.count,
    color: i === 0 ? '#5269D9' : i === 1 ? '#16A36A' : i === 2 ? '#E5A23B' : '#4388D8'
  }));

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Contextual Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Total Active Templates</span>
            <FileText className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">{totalTemplates} variants</div>
          <span className="text-[10px] text-[#5269D9] font-medium">Ready for dispatch</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Attached Media</span>
            <Paperclip className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">
            {attachedMedia ? '1 Asset' : 'None'}
          </div>
          <span className="text-[10px] text-[#737D90]">
            {attachedMedia ? attachedMedia.mediaType.toUpperCase() : 'Plain Text Mode'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Active Channel</span>
            <Smartphone className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1 capitalize">{channel}</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">
            {channel === 'whatsapp' ? 'Twilio Native Media' : channel === 'sms' ? 'Tracked Shortlink' : 'Dual Dispatch'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Reusable Saved Templates</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">{savedTemplates.length} Saved</div>
          <span className="text-[10px] text-[#737D90]">Shared Library</span>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top Header & Tab Pill Controls */}
        <div className="border-b border-[#E8EAF0] pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#20283A]">Message Template Studio</h3>
            <p className="text-xs text-[#737D90]">Compose rich multi-channel templates with media attachments and dynamic tokens</p>
          </div>

          <div className="flex items-center gap-1 bg-[#F7F8FC] border border-[#E8EAF0] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white text-[#5269D9] shadow-xs border border-[#E8EAF0]'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              Template Editor
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white text-[#5269D9] shadow-xs border border-[#E8EAF0]'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              Saved Library ({savedTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('ingestion')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'ingestion'
                  ? 'bg-white text-[#5269D9] shadow-xs border border-[#E8EAF0]'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              Batch File Ingestion
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white text-[#5269D9] shadow-xs border border-[#E8EAF0]'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              Category Analytics
            </button>
          </div>
        </div>

        {/* Tab 1: Editor & Preview */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Input Area */}
            <div className="lg:col-span-7 space-y-4">
              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#20283A] block">Target Delivery Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('both')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      channel === 'both'
                        ? 'bg-[#EEF1FC] border-[#5269D9] ring-1 ring-[#5269D9]'
                        : 'bg-[#F7F8FC] border-[#E8EAF0] hover:border-[#5269D9]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#20283A]">Both Channels</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5269D9] text-white font-medium">Hybrid</span>
                    </div>
                    <p className="text-[10px] text-[#737D90] mt-0.5">Native WA + SMS Shortlink</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      channel === 'whatsapp'
                        ? 'bg-[#E8F7F0] border-[#16A36A] ring-1 ring-[#16A36A]'
                        : 'bg-[#F7F8FC] border-[#E8EAF0] hover:border-[#16A36A]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#20283A]">WhatsApp</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16A36A] text-white font-medium">Native</span>
                    </div>
                    <p className="text-[10px] text-[#737D90] mt-0.5">Direct Media Cards</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      channel === 'sms'
                        ? 'bg-[#EAF3FA] border-[#4388D8] ring-1 ring-[#4388D8]'
                        : 'bg-[#F7F8FC] border-[#E8EAF0] hover:border-[#4388D8]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#20283A]">Cellular SMS</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4388D8] text-white font-medium">GSM-7</span>
                    </div>
                    <p className="text-[10px] text-[#737D90] mt-0.5">Tracked Redirect Link</p>
                  </button>
                </div>
              </div>

              {/* Template Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#20283A]">Template Body</label>
                  <span className="text-[11px] text-[#737D90]">{template.length} characters</span>
                </div>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={6}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-xl p-3.5 text-xs text-[#20283A] font-sans leading-relaxed focus:bg-white focus:outline-none focus:border-[#5269D9] transition-all resize-none shadow-2xs"
                  placeholder="Enter template copy..."
                />
              </div>

              {/* Merge Tokens Shortcut Bar */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#737D90] block">Insert Dynamic Merge Variables:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => insertToken('{{1}}')}
                    className="px-2.5 py-1 bg-[#EEF1FC] hover:bg-[#D9E0F8] text-[#5269D9] rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    + {"{{1}}"} (Customer Name)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('{{2}}')}
                    className="px-2.5 py-1 bg-[#EEF1FC] hover:bg-[#D9E0F8] text-[#5269D9] rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    + {"{{2}}"} (Offer Copy)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('{{3}}')}
                    className="px-2.5 py-1 bg-[#EEF1FC] hover:bg-[#D9E0F8] text-[#5269D9] rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    + {"{{3}}"} (Valid Until)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('{{care_number}}')}
                    className="px-2.5 py-1 bg-[#FDF6EC] hover:bg-[#F8E3C3] text-[#E5A23B] rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    + {"{{care_number}}"}
                  </button>
                </div>
              </div>

              {/* Media Attachment Control & Card */}
              <div className="border border-[#E8EAF0] rounded-xl p-3 bg-[#F7F8FC] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#5269D9]" />
                    <span className="text-xs font-bold text-[#20283A]">Media Attachment</span>
                    <span className="text-[10px] text-[#737D90]">(Images, Videos, PDFs)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8EAF0] hover:border-[#5269D9] text-[#5269D9] rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{attachedMedia ? 'Change Asset' : 'Attach Media'}</span>
                  </button>
                </div>

                {attachedMedia ? (
                  <div className="bg-white border border-[#D9E0F8] rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Media Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-[#F7F8FC] border border-[#E8EAF0] flex items-center justify-center shrink-0 overflow-hidden">
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
                        <p className="text-xs font-bold text-[#20283A] truncate" title={attachedMedia.originalName}>
                          {attachedMedia.originalName}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#737D90] mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#EEF1FC] text-[#5269D9] font-mono font-semibold uppercase">
                            {attachedMedia.mediaType}
                          </span>
                          <span>{formatSize(attachedMedia.size)}</span>
                          <span className="font-mono text-[#737D90]">{attachedMedia.id}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAttachedMedia(null)}
                      title="Remove attachment"
                      className="p-1.5 text-[#DC2626] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#D9E0F8] rounded-lg p-3 text-center bg-white/60">
                    <p className="text-[11px] text-[#737D90]">
                      No media attached. Plain text campaign will be dispatched.
                    </p>
                  </div>
                )}

                {/* Channel-Specific Dispatch Constraints Note */}
                {attachedMedia && (
                  <div className="text-[11px] text-[#737D90] bg-[#EEF1FC]/50 border border-[#D9E0F8] rounded-lg p-2 leading-relaxed">
                    <strong className="text-[#5269D9] font-semibold">Delivery Rules: </strong>
                    {channel === 'whatsapp' ? (
                      'Delivered natively inside WhatsApp as an interactive media card.'
                    ) : channel === 'sms' ? (
                      'Cellular carriers do not support binary MMS. Delivered as an SMS text with hosted tracked redirect link.'
                    ) : (
                      'Dual delivery: WhatsApp recipients receive native media; Cellular SMS recipients receive tracked link.'
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(true)}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#E8EAF0] hover:bg-[#F7F8FC] text-[#20283A] px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#5269D9]" />
                  <span>Save to Reusable Library</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving Template...' : 'Save Template'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Mobile Device Preview */}
            <div className="lg:col-span-5 bg-[#F7F8FC] rounded-xl border border-[#E8EAF0] p-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Preview Switcher */}
                <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-2">
                  <span className="text-xs font-bold text-[#20283A]">Live Device Rendering</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E8EAF0]">
                    <button
                      type="button"
                      onClick={() => setPreviewChannel('whatsapp')}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                        previewChannel === 'whatsapp'
                          ? 'bg-[#16A36A] text-white'
                          : 'text-[#737D90] hover:text-[#20283A]'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewChannel('sms')}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                        previewChannel === 'sms'
                          ? 'bg-[#4388D8] text-white'
                          : 'text-[#737D90] hover:text-[#20283A]'
                      }`}
                    >
                      Cellular SMS
                    </button>
                  </div>
                </div>

                {/* Device Rendering Box */}
                {previewChannel === 'whatsapp' ? (
                  /* WhatsApp Bubble */
                  <div className="bg-[#DCF8C6]/20 border border-[#C8EEDC] rounded-2xl p-3 shadow-2xs space-y-2">
                    {/* Media Card Preview */}
                    {attachedMedia && (
                      <div className="rounded-xl overflow-hidden border border-[#A7E2BE] bg-white shadow-2xs">
                        {attachedMedia.mediaType === 'image' ? (
                          <img
                            src={
                              attachedMedia.assetStreamUrl?.startsWith('http')
                                ? attachedMedia.assetStreamUrl
                                : `${API_BASE}${attachedMedia.assetStreamUrl || `/api/media/asset/${attachedMedia.id}`}`
                            }
                            alt="Attached Preview"
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : attachedMedia.mediaType === 'video' ? (
                          <div className="w-full h-36 bg-[#20283A] flex flex-col items-center justify-center text-white gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">▶ Video Preview</span>
                            <span className="text-[10px] text-white/70">{attachedMedia.originalName}</span>
                          </div>
                        ) : (
                          <div className="p-3 bg-[#F7F8FC] flex items-center gap-3">
                            <FileText className="w-8 h-8 text-[#E5A23B]" />
                            <div>
                              <p className="text-xs font-bold text-[#20283A]">{attachedMedia.originalName}</p>
                              <p className="text-[10px] text-[#737D90]">PDF Document • {formatSize(attachedMedia.size)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#20283A] whitespace-pre-line leading-relaxed font-sans pt-1">
                      {preview}
                    </p>

                    <div className="pt-2 border-t border-[#A7E2BE]/40 flex items-center justify-between text-[10px] text-[#737D90]">
                      <span>Alexander Wright (+9198401...)</span>
                      <span className="font-semibold text-[#16A36A]">Delivered ✓✓</span>
                    </div>
                  </div>
                ) : (
                  /* SMS Cellular Bubble */
                  <div className="bg-white border border-[#E8EAF0] rounded-2xl p-3 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#737D90] pb-1 border-b border-[#F1F4F9]">
                      <span>Sender: TR-BRAND</span>
                      <span className="font-mono">{charCount} chars • {smsSegments} segment(s)</span>
                    </div>

                    <p className="text-xs text-[#20283A] whitespace-pre-line leading-relaxed font-sans">
                      {preview}
                      {attachedMedia && (
                        <span className="block mt-2 text-[#4388D8] font-mono text-[11px] underline">
                          {shortlinkPreview.trim()}
                        </span>
                      )}
                    </p>

                    <div className="pt-2 border-t border-[#F1F4F9] flex items-center justify-between text-[10px] text-[#737D90]">
                      <span>Recipient: Alexander Wright</span>
                      <span className="font-semibold text-[#4388D8]">Sent via Cellular</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-[#737D90] pt-3">
                * Variable values are dynamically substituted from recipient database attributes at dispatch.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Templates Library */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#20283A]">Reusable Templates Library</h4>
                <p className="text-[11px] text-[#737D90]">Templates configured with persistent media attachments and channels</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="px-3 py-1.5 bg-[#5269D9] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer hover:bg-[#4056C4] transition-colors"
              >
                + Create New Template
              </button>
            </div>

            {savedTemplates.length === 0 ? (
              <div className="border border-dashed border-[#E8EAF0] rounded-xl p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-[#737D90]/50 mx-auto" />
                <p className="text-xs font-semibold text-[#20283A]">No templates saved in library yet</p>
                <p className="text-[11px] text-[#737D90]">Compose a template and click "Save to Reusable Library" to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedTemplates.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#E8EAF0] hover:border-[#5269D9]/50 rounded-xl p-3.5 bg-white shadow-2xs flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#20283A] truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#EEF1FC] text-[#5269D9]">
                          {item.channel}
                        </span>
                      </div>

                      <p className="text-xs text-[#737D90] line-clamp-3 font-sans leading-relaxed">
                        {item.body}
                      </p>

                      {item.mediaAsset && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#16A36A] bg-[#E8F7F0] p-1.5 rounded-lg">
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate">{item.mediaAsset.originalName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F1F4F9]">
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate(item)}
                        className="text-xs font-semibold text-[#5269D9] hover:underline cursor-pointer"
                      >
                        Load into Editor →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedTemplate(item.id, item.name)}
                        className="text-[11px] text-[#DC2626] hover:bg-[#FDF2F2] p-1 rounded cursor-pointer transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Batch File Ingestion */}
        {activeTab === 'ingestion' && (
          <div className="max-w-md space-y-4">
            <div className="border-2 border-dashed border-[#E8EAF0] hover:border-[#5269D9] bg-[#F7F8FC] rounded-xl p-6 text-center transition-all cursor-pointer">
              <input
                type="file"
                accept=".json,.csv"
                id={fileInputId}
                onChange={e => setTemplateFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <label htmlFor={fileInputId} className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 rounded-xl bg-[#EEF1FC] text-[#5269D9] flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#20283A]">
                  {templateFile ? templateFile.name : 'Upload Category Template CSV/JSON'}
                </p>
                <p className="text-[11px] text-[#737D90]">Segmented templates file per demographic</p>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!templateFile || isUploading}
              className="w-full py-2 px-3 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload & Update Templates'}
            </button>
          </div>
        )}

        {/* Tab 4: Category Stats & Distribution */}
        {activeTab === 'categories' && (
          <div className="space-y-5">
            <div className="bg-[#F7F8FC] p-4 rounded-xl border border-[#E8EAF0] max-w-lg">
              <h4 className="text-xs font-bold text-[#20283A] mb-3">Template Distribution by Audience Segment</h4>
              <HorizontalBarChart items={categoryBarItems} showPercent />
            </div>

            <div className="overflow-x-auto border border-[#E8EAF0] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] border-b border-[#E8EAF0] text-[#737D90] font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Demographic Category</th>
                    <th className="py-2.5 px-3">Template Variants</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EAF0]">
                  {templateStats.map((stat, i) => (
                    <tr key={i} className="hover:bg-[#F7F8FC]/50">
                      <td className="py-2.5 px-3 font-semibold text-[#20283A]">{stat.category}</td>
                      <td className="py-2.5 px-3 text-[#737D90]">{stat.count} active flows</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC]">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        selectedAssetId={attachedMedia?.id}
        onSelect={(asset) => {
          setAttachedMedia(asset);
          toast.success('Media Attached to Template', {
            description: `Attached "${asset.originalName}". Channel payload updated.`
          });
        }}
      />

      {/* Save to Library Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8EAF0] shadow-xl p-5 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#20283A]">Save to Reusable Templates</h3>
              <p className="text-xs text-[#737D90]">Make this template available for bulk broadcasts and automations.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#20283A]">Template Name</label>
              <input
                type="text"
                placeholder="e.g. Summer Flash Sale Announcement"
                value={saveTemplateName}
                onChange={e => setSaveTemplateName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 text-xs text-[#737D90] hover:text-[#20283A] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToLibrary}
                disabled={isSavingToLibrary}
                className="px-4 py-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSavingToLibrary ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
