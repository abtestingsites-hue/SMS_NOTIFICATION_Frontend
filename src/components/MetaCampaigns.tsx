import React, { useState, useEffect } from 'react';
import type { MetaDataResponse, MetaCampaign } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';

export const MetaCampaigns: React.FC = () => {
  const [data, setData] = useState<MetaDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<MetaCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Campaign Form
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('CONVERSIONS');
  const [dailyBudget, setDailyBudget] = useState(100);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [callToAction, setCallToAction] = useState('SHOP_NOW');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getMetaCampaigns();
      setData(res);
    } catch (err: any) {
      console.warn('Meta campaigns fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleMetaCampaign(id);
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
      await api.createMetaCampaign({
        name,
        objective,
        dailyBudget,
        headline,
        body,
        callToAction
      });
      toast.success('Meta Campaign Created', { description: `Campaign "${name}" created and synced.` });
      setShowCreateModal(false);
      setName('');
      setHeadline('');
      setBody('');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to Create Meta Campaign', { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Selector & Connect Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E8EAF0] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-[#20283A]">Meta Marketing API Suite</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              data?.isLive ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {data?.isLive ? '● Live Meta Graph API' : '⚡ Local Sandbox Simulated'}
            </span>
          </div>
          <p className="text-xs text-[#737D90]">
            Sync Facebook & Instagram ads, Click-to-WhatsApp promotion attribution, and conversion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            defaultValue={data?.selectedAccountId}
            className="bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none cursor-pointer"
          >
            {data?.adAccounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.balance})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Launch Meta Ad
          </button>
        </div>
      </div>

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

      {/* Performance KPI Row */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Total Spend</span>
            <div className="text-lg font-bold text-[#20283A] mt-0.5">${data.summary.totalSpend}</div>
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
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Avg CTR</span>
            <div className="text-lg font-bold text-[#16A34A] mt-0.5">{data.summary.avgCtr}%</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Avg CPC</span>
            <div className="text-lg font-bold text-[#20283A] mt-0.5">${data.summary.avgCpc}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E8EAF0] shadow-2xs">
            <span className="text-[10px] font-semibold text-[#737D90] uppercase">Conversions</span>
            <div className="text-lg font-bold text-[#5269D9] mt-0.5">{data.summary.totalConversions}</div>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-2xs space-y-4">
        <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">Active Ad Campaigns</h3>
            <p className="text-[11px] text-[#737D90]">Performance breakdown by ad set and creative attribution</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-[#737D90]">Loading Meta campaigns...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EAF0] text-[#737D90] font-medium">
                  <th className="py-2.5 px-3">Campaign & Objective</th>
                  <th className="py-2.5 px-3">Daily Budget</th>
                  <th className="py-2.5 px-3">Spend</th>
                  <th className="py-2.5 px-3">Impressions / Clicks</th>
                  <th className="py-2.5 px-3">CTR / CPC</th>
                  <th className="py-2.5 px-3">ROAS</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Creative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0]">
                {data?.campaigns?.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F8FC]/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#20283A]">{c.name}</div>
                      <div className="text-[10px] text-[#5269D9] font-semibold uppercase">{c.objective}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-[#20283A]">
                      ${c.dailyBudget}/day
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#20283A]">
                      ${c.spend.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#20283A]">{c.impressions.toLocaleString()}</div>
                      <div className="text-[10px] text-[#737D90]">{c.clicks.toLocaleString()} clicks</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[#16A34A] font-semibold">{c.ctr}%</div>
                      <div className="text-[10px] text-[#737D90]">${c.cpc} cpc</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#5269D9] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {c.roas}x
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : 'bg-slate-100 text-[#737D90]'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedCreative(c)}
                        className="text-[#5269D9] hover:underline font-semibold cursor-pointer text-[11px]"
                      >
                        View Creative
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creative Preview Modal */}
      {selectedCreative && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#20283A]">Ad Creative Preview</h3>
                <span className="text-[10px] text-[#737D90]">{selectedCreative.name}</span>
              </div>
              <button onClick={() => setSelectedCreative(null)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div className="border border-[#E8EAF0] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-[#E8EAF0] flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#5269D9] text-white flex items-center justify-center font-bold text-[10px]">
                  fb
                </div>
                <div>
                  <div className="text-xs font-bold text-[#20283A]">SMS Campaign System</div>
                  <div className="text-[9px] text-[#737D90]">Sponsored • Instagram & Facebook</div>
                </div>
              </div>

              <div className="p-3 text-xs text-[#20283A]">
                {selectedCreative.creative.body || 'Exclusive seasonal collection preview.'}
              </div>

              <div className="h-44 bg-slate-100 flex items-center justify-center border-y border-[#E8EAF0]">
                <div className="text-center text-slate-400 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ad Creative Asset
                </div>
              </div>

              <div className="p-3 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="text-[10px] text-[#737D90] uppercase">Campaign Link</div>
                  <div className="text-xs font-bold text-[#20283A]">{selectedCreative.creative.headline}</div>
                </div>
                <span className="bg-[#5269D9] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  {selectedCreative.creative.callToAction.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCreative(null)}
                className="bg-slate-100 hover:bg-slate-200 text-[#20283A] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A]">Launch Meta Marketing Campaign</h3>
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
                  placeholder="e.g. Lookbook Retargeting - Custom Audience"
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#20283A] mb-1">Objective</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none cursor-pointer"
                  >
                    <option value="CONVERSIONS">Conversions & Sales</option>
                    <option value="MESSAGES">Click-to-WhatsApp</option>
                    <option value="TRAFFIC">Store Traffic</option>
                    <option value="BRAND_AWARENESS">Awareness & Reach</option>
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
                <label className="block text-xs font-semibold text-[#20283A] mb-1">Ad Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Exclusive Season Drop | 25% Off Code Inside"
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">Ad Primary Text</label>
                <textarea
                  rows={2}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe offer value or styling benefits..."
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg p-2 text-xs text-[#20283A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">Call To Action</label>
                <select
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A]"
                >
                  <option value="SHOP_NOW">Shop Now</option>
                  <option value="SEND_WHATSAPP_MESSAGE">Send WhatsApp Message</option>
                  <option value="LEARN_MORE">Learn More</option>
                  <option value="CLAIM_OFFER">Claim Offer</option>
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
                  Deploy Ad Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
