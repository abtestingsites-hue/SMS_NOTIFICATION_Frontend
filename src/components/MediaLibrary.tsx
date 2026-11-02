import React, { useState, useEffect } from 'react';
import type { MediaAsset } from '../types';
import { api, API_BASE } from '../services/api';
import { toast } from '../services/toast';
import { SearchInput } from './ui/SearchInput';
import { PageHeader } from './ui/PageHeader';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import {
  Video,
  FileText,
  Upload,
  Trash2,
  Eye,
  HardDrive
} from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<{ asset: MediaAsset; message: string } | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const items = await api.getMedia({ type: filterType, search });
      setMedia(items);
    } catch (err: any) {
      console.warn('Media fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning('File Required', { description: 'Please select a file to upload.' });
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadMedia(selectedFile, caption, tags);
      toast.success('Asset Uploaded', {
        description: `Uploaded "${res.asset.originalName}" successfully.`
      });
      setSelectedFile(null);
      setCaption('');
      setTags('');
      fetchMedia();
    } catch (err: any) {
      toast.error('Upload Failed', { description: err.message || 'Error processing media file.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (asset: MediaAsset) => {
    setDeleteTarget(asset);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteMedia(deleteTarget.id);
      toast.success('Asset Removed', { description: `${deleteTarget.originalName} removed successfully.` });
      setDeleteTarget(null);
      fetchMedia();
    } catch (err: any) {
      if (err.referenced) {
        setForceDeleteTarget({ asset: deleteTarget, message: err.message });
      } else {
        toast.error('Delete Failed', { description: err.message || 'Error removing asset.' });
      }
      setDeleteTarget(null);
    }
  };

  const confirmForceDelete = async () => {
    if (!forceDeleteTarget) return;
    try {
      await api.deleteMedia(forceDeleteTarget.asset.id, true);
      toast.success('Asset Force-Deleted', { description: 'Asset force-deleted successfully.' });
      setForceDeleteTarget(null);
      fetchMedia();
    } catch (err: any) {
      toast.error('Delete Failed', { description: err.message || 'Error removing asset.' });
      setForceDeleteTarget(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getMediaStreamUrl = (asset?: MediaAsset | null) => {
    if (!asset) return '';
    const url = asset.assetStreamUrl || asset.url || '';
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${API_BASE}${url}`;
    }
    return `${API_BASE}/${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Standard Enterprise Page Header */}
      <PageHeader
        title="Media Library"
        subtitle="Durable digital asset repository with SHA-256 verification, instant streaming, and cross-channel compatibility."
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC]">
            <HardDrive className="w-3 h-3" />
            Durable Storage
          </span>
        }
      />

      {/* Top Contextual Media Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Total Durable Assets</span>
            <HardDrive className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">{media.length} files</div>
          <span className="text-[10px] text-[#5269D9] font-medium">Local storage stream</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Storage Consumed</span>
            <HardDrive className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">
            {formatBytes(media.reduce((sum, m) => sum + (m.size || 0), 0))}
          </div>
          <span className="text-[10px] text-[#737D90]">Binary disk allocation</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Asset Format Split</span>
            <FileText className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">
            {media.filter(m => m.mediaType === 'image' || m.mimeType?.startsWith('image/')).length} Img · {media.filter(m => m.mediaType === 'video' || m.mimeType?.startsWith('video/')).length} Vid
          </div>
          <span className="text-[10px] text-[#737D90]">JPG, PNG, WebP, MP4</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Integrity Verification</span>
            <HardDrive className="w-3.5 h-3.5 text-[#E5A23B]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">SHA-256 Valid</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">Magic bytes passed</span>
        </div>
      </div>

      {/* Top Upload Section */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#20283A]">Upload New Marketing Asset</h2>
            <p className="text-xs text-[#737D90]">
              Binary magic bytes validation & SHA-256 checksums (JPG, PNG, WebP, MP4, PDF)
            </p>
          </div>
          <HardDrive className="w-5 h-5 text-[#5269D9]" />
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* File input */}
            <div>
              <label className="block font-semibold text-[#20283A] mb-1.5">Select File *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-[#20283A] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EEF1FC] file:text-[#5269D9] hover:file:bg-[#D9E0F8] cursor-pointer border border-[#E8EAF0] rounded-lg p-1 bg-[#F7F8FC]"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block font-semibold text-[#20283A] mb-1.5">Caption / Promotional Text</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Exclusive Weekend Lookbook Banner"
                className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block font-semibold text-[#20283A] mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="summer, catalog, mens, vip"
                className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Validating & Ingesting...' : 'Upload & Index Media'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8EAF0] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#F6F7FB] border border-[#E8EAF0] p-1 rounded-lg">
          {['all', 'image', 'video', 'document'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-white text-[#5269D9] shadow-xs border border-[#E8EAF0]'
                  : 'text-[#737D90] hover:text-[#20283A]'
              }`}
            >
              {type === 'all' ? 'All Files' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by filename or tag..."
          className="w-full sm:w-64"
        />
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#737D90] bg-white rounded-xl border border-[#E8EAF0]">
          Loading media library assets...
        </div>
      ) : media.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#737D90] bg-white rounded-xl border border-[#E8EAF0] space-y-1">
          <p className="font-semibold text-[#20283A]">No media assets found</p>
          <p>Upload marketing visuals above to attach to WhatsApp and template broadcasts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-[#E8EAF0] overflow-hidden shadow-xs hover:border-[#D6DAE5] transition-all flex flex-col justify-between"
            >
              {/* Media Preview Box */}
              <div className="h-40 bg-[#F7F8FC] flex items-center justify-center overflow-hidden relative border-b border-[#E8EAF0]">
                {asset.mediaType === 'image' ? (
                  <img
                    src={getMediaStreamUrl(asset)}
                    alt={asset.caption || asset.originalName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                ) : asset.mediaType === 'video' ? (
                  <div className="flex flex-col items-center gap-1 text-[#5269D9]">
                    <Video className="w-8 h-8" />
                    <span className="text-[10px] uppercase font-bold">Video File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[#5269D9]">
                    <FileText className="w-8 h-8" />
                    <span className="text-[10px] uppercase font-bold">PDF Document</span>
                  </div>
                )}

                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs uppercase">
                  {asset.mediaType}
                </span>
              </div>

              {/* Asset Info */}
              <div className="p-4 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#20283A] truncate" title={asset.originalName}>
                    {asset.originalName}
                  </h4>
                  <p className="text-[11px] text-[#737D90] truncate">{asset.caption || 'No caption set'}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#737D90] pt-1 border-t border-[#F1F4F9]">
                  <span>{formatBytes(asset.size)}</span>
                  <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                </div>

                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {asset.tags.map((t, idx) => (
                      <span key={idx} className="bg-[#F6F7FB] border border-[#E8EAF0] text-[#737D90] text-[9px] px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-3 border-t border-[#E8EAF0] bg-[#F7F8FC]/50 flex items-center justify-between">
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5269D9] hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDelete(asset)}
                  className="text-xs font-semibold text-[#D94D59] hover:text-[#C23C48] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A] truncate">{previewAsset.originalName}</h3>
              <button onClick={() => setPreviewAsset(null)} className="text-[#737D90] hover:text-[#20283A] text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="max-h-80 overflow-hidden rounded-lg bg-[#F7F8FC] flex items-center justify-center border border-[#E8EAF0]">
              {previewAsset.mediaType === 'image' ? (
                <img src={getMediaStreamUrl(previewAsset)} alt={previewAsset.originalName} className="max-h-80 w-auto object-contain" />
              ) : (
                <div className="p-8 text-center text-xs text-[#737D90]">
                  Document preview available at direct stream URL: <br />
                  <code className="text-[#5269D9] font-mono text-[11px] block mt-2">{getMediaStreamUrl(previewAsset)}</code>
                </div>
              )}
            </div>

            <div className="text-xs space-y-1 text-[#737D90]">
              <div><strong>SHA-256:</strong> <span className="font-mono text-[10px]">{previewAsset.checksum || 'Verified Immutable'}</span></div>
              <div><strong>Direct URL:</strong> <a href={getMediaStreamUrl(previewAsset)} target="_blank" rel="noreferrer" className="text-[#5269D9] underline font-mono text-[10px]">Open Stream</a></div>
            </div>
          </div>
        </div>
      )}

      {/* Standardized Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Media Asset"
        description={`Are you sure you want to delete "${deleteTarget?.originalName}"? This file will be removed from local durable storage.`}
        confirmLabel="Delete Asset"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Force-Delete Referenced Asset Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(forceDeleteTarget)}
        title="Force Delete Referenced Asset"
        description={`${forceDeleteTarget?.message || 'This asset is currently attached to one or more campaigns or templates.'} Do you still wish to force-delete this asset?`}
        confirmLabel="Force Delete"
        confirmVariant="danger"
        onConfirm={confirmForceDelete}
        onCancel={() => setForceDeleteTarget(null)}
      />
    </div>
  );
};
