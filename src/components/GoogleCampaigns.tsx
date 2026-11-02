import React, { useState, useEffect } from 'react';
import type { GoogleDataResponse } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import { PageHeader } from './ui';
import { Plus } from 'lucide-react';

export const GoogleCampaigns: React.FC = () => {
  const [data, setData] = useState<GoogleDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Google Campaign Form
  const [name, setName] = useState('');
  const [type, setType] = useState<'SEARCH' | 'DISPLAY' | 'PERFORMANCE_MAX' | 'VIDEO'>('SEARCH');
  const [biddingStrategy, setBiddingStrategy] = useState('MAXIMIZE_CONVERSIONS');
  const [dailyBudget, setDailyBudget] = useState(150);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getGoogleCampaigns();
      setData(res);
    } catch (err: any) {
      console.warn('Google campaigns fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleGoogleCampaign(id);
      toast.success('Campaign Status Updated');
      fetchData();
    } catch (err: any) {
      toast.error('Toggle Failed', { description: err.message });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createGoogleCampaign({
        name,
        type,
        biddingStrategy,
        dailyBudget
      });
      toast.success('Google Ads Campaign Created', { description: `Campaign "${name}" created and synced.` });
      setShowCreateModal(false);
      setName('');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to Create Google Campaign', { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Ad Networks' }, { label: 'Google Campaigns' }]}
        title="Google Campaigns & Performance Max"
        subtitle="High-intent Google Search, Performance Max, Display, and YouTube Video promotional advertising."
        badge={
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            data?.isLive ? 'bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC]' : 'bg-[#F5F6FA] text-[#718096] border border-[#E5E9F0]'
          }`}>
            {data?.isLive ? '● Live Google Ads API' : '⚡ Local Sandbox Simulated'}
          </span>
        }
        actions={
          <div className="flex items-center gap-3">
            {data?.customerId && (
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#20283A]">{data?.customerName || 'Enterprise Growth'}</div>
                <div className="text-[10px] font-mono text-[#737D90]">ID: {data?.customerId}</div>
              </div>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Google Campaign
            </button>
          </div>
        }
      />

      {/* Data Source Transparency Banner */}
      {data?.dataSourceNotice && (
        <div className={`px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between ${
          data.isLive ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{data.isLive ? 'Verified Live Connection:' : 'Environment Transparency:'}</span>
            <span>{data.dataSourceNotice}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">
            {data.dataSource || 'SANDBOX_SIMULATED'}
          </span>
        </div>
      )}

      {/* KPI Metrics */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Total Cost</span>
            <div className="text-lg font-bold text-[#20283A] mt-0.5">${data.summary.totalCost}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Impressions</span>
            <div className="text-lg font-bold text-[#20283A] mt-0.5">{data.summary.totalImpressions.toLocaleString()}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Clicks</span>
            <div className="text-lg font-bold text-[#20283A] mt-0.5">{data.summary.totalClicks.toLocaleString()}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Avg CPC</span>
            <div className="text-lg font-bold text-[#5269D9] mt-0.5">${data.summary.avgCpc}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Conversions</span>
            <div className="text-lg font-bold text-[#16A34A] mt-0.5">{data.summary.totalConversions}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Cost / Conv</span>
            <div className="text-lg font-bold text-[#20283A] mt-0.5">${data.summary.avgCostPerConv}</div>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-2xs space-y-4">
        <div className="border-b border-[#E8EAF0] pb-3">
          <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">Search & Video Campaigns</h3>
          <p className="text-[11px] text-[#737D90]">Bidding strategies, keywords count, and conversion tracking</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-[#737D90]">Loading Google Ads campaigns...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EAF0] text-[#737D90] font-medium">
                  <th className="py-2.5 px-3">Campaign Name & Type</th>
                  <th className="py-2.5 px-3">Bidding Strategy</th>
                  <th className="py-2.5 px-3">Daily Budget</th>
                  <th className="py-2.5 px-3">Cost to Date</th>
                  <th className="py-2.5 px-3">Impressions / Clicks</th>
                  <th className="py-2.5 px-3">Avg CPC</th>
                  <th className="py-2.5 px-3">Conversions</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0]">
                {data?.campaigns?.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F8FC]/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#20283A]">{c.name}</div>
                      <div className="text-[10px] text-[#5269D9] font-semibold uppercase">{c.type}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                      {c.biddingStrategy}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#20283A]">
                      ${c.dailyBudget}/day
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#20283A]">
                      ${c.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#20283A]">{c.impressions.toLocaleString()}</div>
                      <div className="text-[10px] text-[#737D90]">{c.clicks.toLocaleString()} clicks</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#20283A]">
                      ${c.avgCpc}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[#16A34A] font-bold">{c.conversions}</div>
                      <div className="text-[10px] text-[#737D90]">${c.costPerConversion} /conv</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                          c.status === 'ENABLED'
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : 'bg-slate-100 text-[#737D90]'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A]">Create Google Ads Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Search - Mens Formalwear Keywords"
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#20283A] mb-1">Campaign Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none cursor-pointer"
                  >
                    <option value="SEARCH">Google Search Network</option>
                    <option value="PERFORMANCE_MAX">Performance Max</option>
                    <option value="DISPLAY">Display Network</option>
                    <option value="VIDEO">YouTube In-Stream Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#20283A] mb-1">Daily Budget ($)</label>
                  <input
                    type="number"
                    min={10}
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">Bidding Strategy</label>
                <select
                  value={biddingStrategy}
                  onChange={(e) => setBiddingStrategy(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none cursor-pointer"
                >
                  <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
                  <option value="TARGET_ROAS (350%)">Target ROAS (350%)</option>
                  <option value="TARGET_CPA ($8.00)">Target CPA ($8.00)</option>
                  <option value="TARGET_CPM">Target CPM (Video/Display)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8EAF0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 rounded-lg border border-[#E8EAF0] text-xs font-semibold text-[#737D90] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
