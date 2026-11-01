import React, { useState, useEffect } from 'react';
import type { MediaAsset, MediaType } from '../../types';
import { api, API_BASE } from '../../services/api';
import { toast } from '../../services/toast';
import {
  X,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Check,
  HardDrive
} from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  selectedAssetId?: string | null;
  allowedTypes?: MediaType[];
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedAssetId,
  allowedTypes
}) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MediaType>('all');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadAssets();
  }, [isOpen]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getMedia();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to load media assets', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadMedia(file, 'Uploaded via template builder');
      toast.success('Media Uploaded', { description: `${file.name} ready for attachment.` });
      await loadAssets();
      if (res.asset) {
        onSelect(res.asset);
        onClose();
      }
    } catch (err: any) {
      toast.error('Upload Failed', { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = assets.filter(asset => {
    if (allowedTypes && !allowedTypes.includes(asset.mediaType)) return false;
    if (typeFilter !== 'all' && asset.mediaType !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (asset.originalName && asset.originalName.toLowerCase().includes(q)) ||
      (asset.caption && asset.caption.toLowerCase().includes(q)) ||
      (asset.tags && asset.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E8EAF0] shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#E8EAF0] flex items-center justify-between bg-[#F7F8FC]">
          <div>
            <h3 className="text-sm font-bold text-[#20283A] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#5269D9]" />
              Attach Media from Library
            </h3>
            <p className="text-[11px] text-[#737D90]">Select an asset for WhatsApp & SMS multi-channel campaigns</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737D90] hover:text-[#20283A] hover:bg-[#EEF1FC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-[#E8EAF0] flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737D90]" />
              <input
                type="text"
                placeholder="Search assets by name or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'image', 'video', 'document'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                    typeFilter === t
                      ? 'bg-[#EEF1FC] text-[#5269D9] border border-[#D9E0F8]'
                      : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/mp4,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[50vh]">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#737D90]">Loading media assets...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-[#737D90]/50 mx-auto" />
              <p className="text-xs font-semibold text-[#20283A]">No media assets found</p>
              <p className="text-[11px] text-[#737D90]">Upload a photo, video or PDF document above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(asset => {
                const isSelected = selectedAssetId === asset.id;
                const streamUrl = asset.assetStreamUrl?.startsWith('http')
                  ? asset.assetStreamUrl
                  : `${API_BASE}${asset.assetStreamUrl || `/api/media/asset/${asset.id}`}`;

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className={`group relative rounded-xl border p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs ${
                      isSelected
                        ? 'border-[#5269D9] bg-[#EEF1FC]/30 ring-2 ring-[#5269D9]/20'
                        : 'border-[#E8EAF0] bg-white hover:border-[#5269D9]/50'
                    }`}
                  >
                    {/* Thumbnail / Preview */}
                    <div className="w-full h-24 rounded-lg bg-[#F7F8FC] border border-[#E8EAF0] flex items-center justify-center overflow-hidden mb-2 relative">
                      {asset.mediaType === 'image' ? (
                        <img
                          src={streamUrl}
                          alt={asset.originalName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : asset.mediaType === 'video' ? (
                        <div className="flex flex-col items-center gap-1 text-[#4388D8]">
                          <Video className="w-6 h-6" />
                          <span className="text-[10px] font-mono">MP4</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-[#E5A23B]">
                          <FileText className="w-6 h-6" />
                          <span className="text-[10px] font-mono">PDF</span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-[#5269D9] text-white p-1 rounded-full shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#20283A] truncate" title={asset.originalName}>
                        {asset.originalName}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#737D90]">
                        <span className="uppercase font-mono font-medium">{asset.mediaType}</span>
                        <span>{formatSize(asset.size)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E8EAF0] bg-[#F7F8FC] flex items-center justify-between text-xs text-[#737D90]">
          <span>{filtered.length} asset(s) available</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-[#E8EAF0] hover:bg-[#F7F8FC] text-[#20283A] rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
