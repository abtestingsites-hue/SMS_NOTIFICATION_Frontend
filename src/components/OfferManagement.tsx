import React, { useState, useId } from 'react';
import type { Offer } from '../types';
import { toast } from '../services/toast';
import { SearchInput } from './ui/SearchInput';
import { StatusBadge } from './ui/StatusBadge';
import { Plus, Upload, Ticket } from 'lucide-react';

interface OfferManagementProps {
  offers: Offer[];
  onCreateOffer: (offer: { code: string; discount: string; description?: string }) => Promise<void>;
  onUploadOffersCsv: (file: File) => Promise<void>;
}

export const OfferManagement: React.FC<OfferManagementProps> = ({
  offers,
  onCreateOffer,
  onUploadOffersCsv
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputId = useId();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount) return;
    setIsSubmitting(true);
    try {
      await onCreateOffer({ code: code.toUpperCase(), discount, description });
      toast.success('Offer Created', {
        description: `Promo code "${code.toUpperCase()}" (${discount}) is now active.`
      });
      setCode('');
      setDiscount('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Offer Creation Failed', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      await onUploadOffersCsv(e.target.files[0]);
      toast.success('Offers Ingested', {
        description: 'Offers successfully uploaded and synchronized from CSV.'
      });
    } catch (err: any) {
      toast.error('CSV Import Failed', { description: err.message });
    }
  };

  const filtered = offers.filter(o =>
    (o.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Offer Analytics KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Active Voucher Codes</span>
            <Ticket className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">{offers.length} active</div>
          <span className="text-[10px] text-[#5269D9] font-medium">Auto-substituted via {"{{2}}"}</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Highest Discount</span>
            <Ticket className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">
            {offers[0]?.discount || '25% OFF'}
          </div>
          <span className="text-[10px] text-[#16A36A] font-semibold">{offers[0]?.code || 'SPRING25'}</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Campaign Association</span>
            <Ticket className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">Universal</div>
          <span className="text-[10px] text-[#737D90]">Attach to any broadcast</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Redemption Mode</span>
            <Ticket className="w-3.5 h-3.5 text-[#E5A23B]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">POS & In-Store</div>
          <span className="text-[10px] text-[#737D90]">Direct customer redemption</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top Header */}
      <div className="border-b border-[#E8EAF0] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#20283A]">Promotional Offers & Voucher Inventory</h3>
          <p className="text-xs text-[#737D90]">Manage discount codes, campaign vouchers, and redemption inventory</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>

          <input
            type="file"
            accept=".csv"
            id={fileInputId}
            onChange={handleCsv}
            className="hidden"
          />
          <label
            htmlFor={fileInputId}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E8EAF0] hover:border-[#5269D9] bg-[#F7F8FC] hover:bg-white text-xs font-semibold text-[#20283A] rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#737D90]" />
            <span>Import CSV</span>
          </label>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search promo codes or descriptions..."
          className="w-72"
        />
        <span className="text-xs text-[#737D90]">
          Total: <strong className="text-[#20283A]">{filtered.length}</strong> active offers
        </span>
      </div>

      {/* Offers Table */}
      <div className="overflow-x-auto border border-[#E8EAF0] rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FC] border-b border-[#E8EAF0] text-[#737D90] font-medium">
            <tr>
              <th className="py-2.5 px-3">Promo Code</th>
              <th className="py-2.5 px-3">Discount Value</th>
              <th className="py-2.5 px-3">Description / Tag</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAF0]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-[#737D90]">
                  No offers found matching your search. Click "Create Offer" to add one.
                </td>
              </tr>
            ) : (
              filtered.map((offer, idx) => (
                <tr key={offer.id || idx} className="hover:bg-[#F7F8FC]/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#5269D9]">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EEF1FC] border border-[#D9E0F8]">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{offer.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#20283A]">{offer.discount}</td>
                  <td className="py-3 px-3 text-[#737D90]">{offer.description || 'Special Promotional Offer'}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status="ACTIVE" size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#E8EAF0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A]">Create Promotional Offer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#737D90] hover:text-[#20283A] text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Promo Code (Unique)</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  required
                  className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg font-mono text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Discount Amount or %</label>
                <input
                  type="text"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="e.g. 25% OFF or $20 VOUCHER"
                  required
                  className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Campaign Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Mid-Season VIP Flash Discount"
                  className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8EAF0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#E8EAF0] bg-white text-xs font-semibold text-[#20283A] rounded-lg hover:bg-[#F7F8FC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
