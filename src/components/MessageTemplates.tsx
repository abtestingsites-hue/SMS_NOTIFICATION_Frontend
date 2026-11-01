import React, { useState, useId } from 'react';
import { toast } from '../services/toast';
import {
  Upload,
  FileText,
  Layers,
  Smartphone,
  Save,
  CheckCircle2
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
  onSaveTemplate: (text: string) => Promise<void>;
  customerCareNumber: string;
}

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  template,
  setTemplate,
  templateStats,
  onUploadTemplates,
  onSaveTemplate,
  customerCareNumber
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'ingestion' | 'categories'>('editor');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputId = useId();

  const totalTemplates = templateStats.reduce((sum, s) => sum + s.count, 0) || 5;

  const insertToken = (token: string) => {
    setTemplate(template ? `${template} ${token}` : token);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTemplate(template);
      toast.success('Template Saved', {
        description: 'Template successfully saved to persistent storage.'
      });
    } catch (err: any) {
      toast.error('Save Failed', { description: err.message });
    } finally {
      setIsSaving(false);
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

  // Preview generation
  const renderPreview = () => {
    let text = template || '';
    text = text.split('{{1}}').join('Alexander Wright').split('{1}').join('Alexander Wright');
    text = text.split('{{2}}').join('Special 25% Off with Code: SPRING25').split('{2}').join('Special 25% Off with Code: SPRING25');
    text = text.split('{{3}}').join('15 Aug 2026').split('{3}').join('15 Aug 2026');
    text = text.split('{{care_number}}').join(customerCareNumber || '+916369825386');
    return text;
  };

  const preview = renderPreview();

  const categoryBarItems = templateStats.map((stat, i) => ({
    label: stat.category,
    value: stat.count,
    color: i === 0 ? '#5269D9' : i === 1 ? '#16A36A' : i === 2 ? '#E5A23B' : '#4388D8'
  }));

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
            <span className="text-[11px] font-medium text-[#737D90]">Categorized Profiles</span>
            <Layers className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">{templateStats.length || 3} segments</div>
          <span className="text-[10px] text-[#737D90]">Men, Women, General</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Supported Channels</span>
            <Smartphone className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">SMS & WhatsApp</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">GSM-7 + Unicode</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Merge Tokens Supported</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">4 Tokens</div>
          <span className="text-[10px] text-[#737D90] font-mono">{"{{1}}, {{2}}, {{3}}, {{care}}"}</span>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top Header & Tab Pill Controls */}
        <div className="border-b border-[#E8EAF0] pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#20283A]">Message Template Studio</h3>
            <p className="text-xs text-[#737D90]">Compose reusable multi-channel templates with dynamic merge tokens</p>
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
              Category Analytics ({templateStats.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Editor & Preview */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Input Area */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#20283A]">Template Body</label>
                  <span className="text-[11px] text-[#737D90]">{template.length} characters</span>
                </div>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={8}
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

              <div className="pt-2 flex justify-end">
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

            {/* Simulated Mobile Chat Bubble Preview */}
            <div className="lg:col-span-5 bg-[#F7F8FC] rounded-xl border border-[#E8EAF0] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-2">
                  <span className="text-xs font-bold text-[#20283A]">Live Device Rendering</span>
                  <span className="text-[10px] font-semibold text-[#16A36A] bg-[#E8F7F0] px-2 py-0.5 rounded-full">
                    WhatsApp / Rich SMS
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-[#E8EAF0] shadow-2xs space-y-2">
                  <p className="text-xs text-[#20283A] whitespace-pre-line leading-relaxed font-sans">
                    {preview}
                  </p>
                  <div className="pt-2 border-t border-[#F1F4F9] flex items-center justify-between text-[10px] text-[#737D90]">
                    <span>Recipient: Alexander Wright</span>
                    <span className="font-semibold text-[#5269D9]">Delivered ✓✓</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#737D90] pt-3">
                * Variable values are dynamically substituted from recipient database attributes at dispatch.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Batch File Ingestion */}
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

        {/* Tab 3: Category Stats & Distribution */}
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
    </div>
  );
};
