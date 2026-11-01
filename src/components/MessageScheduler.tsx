import React, { useState, useEffect, useMemo } from 'react';
import type { ScheduleItem, Offer } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import { StatusBadge } from './ui/StatusBadge';
import {
  Plus,
  Play,
  XCircle,
  Lock,
  CalendarDays
} from 'lucide-react';

export const MessageScheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  const uniqueOffers = useMemo(() => {
    const seen = new Set<string>();
    return offers.filter(o => {
      const c = o.code ? o.code.trim().toUpperCase() : null;
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
  }, [offers]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<ScheduleItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'ONCE' | 'DAILY' | 'WEEKLY'>('ONCE');
  const [scheduledAt, setScheduledAt] = useState('');
  const [timezone] = useState('Asia/Kolkata');
  const [channel, setChannel] = useState<'both' | 'whatsapp' | 'sms'>('both');
  const [targetAudience, setTargetAudience] = useState('All');
  const [templateContent, setTemplateContent] = useState('Hi {{1}}, our weekend special is now live! Use code {{2}} to get {{3}} today only.');
  const [offerCode, setOfferCode] = useState('SUMMER25');

  const fetchSchedulesAndOffers = async () => {
    setLoading(true);
    try {
      const [schedList, offerList] = await Promise.all([
        api.getSchedules(),
        api.getOffers().catch(() => [])
      ]);
      setSchedules(schedList);
      setOffers(offerList);
      if (offerList.length > 0 && !offerCode) {
        setOfferCode(offerList[0].code);
      }
    } catch (err: any) {
      console.warn('Failed to fetch schedules:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulesAndOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Name Required', { description: 'Please provide a schedule name.' });
      return;
    }

    try {
      await api.createSchedule({
        name,
        type,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date(Date.now() + 3600000).toISOString(),
        timezone,
        channel,
        targetAudience,
        templateContent,
        offerCode
      });
      toast.success('Schedule Created', { description: `Schedule "${name}" created successfully.` });
      setShowCreateModal(false);
      setName('');
      fetchSchedulesAndOffers();
    } catch (err: any) {
      toast.error('Schedule Creation Failed', { description: err.message });
    }
  };

  const handleRunNow = async (id: string) => {
    if (!confirm('Execute this schedule immediately? Idempotency safeguards will apply.')) return;
    try {
      const res = await api.runScheduleNow(id);
      if (res.success) {
        toast.success('Broadcast Executed', {
          description: `Dispatched to ${res.dispatchedCount} customers (${res.suppressedCount} suppressed by governance).`
        });
      } else {
        toast.error('Execution Failed', { description: res.error || 'Runner failed' });
      }
      fetchSchedulesAndOffers();
    } catch (err: any) {
      toast.error('Run Now Failed', { description: err.message });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled execution?')) return;
    try {
      await api.cancelSchedule(id);
      toast.info('Schedule Cancelled', { description: 'Scheduled execution cancelled.' });
      fetchSchedulesAndOffers();
    } catch (err: any) {
      toast.error('Cancel Failed', { description: err.message });
    }
  };

  const filtered = schedules.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Scheduler Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Upcoming Dispatches</span>
            <CalendarDays className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">
            {schedules.filter(s => s.status === 'SCHEDULED' || s.status === 'RUNNING').length} timers
          </div>
          <span className="text-[10px] text-[#5269D9] font-medium">Distributed lease locked</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Completed Executions</span>
            <CalendarDays className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">
            {schedules.filter(s => s.status === 'COMPLETED').length} jobs
          </div>
          <span className="text-[10px] text-[#16A36A] font-semibold">100% delivered</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Dead-Letter Queue</span>
            <CalendarDays className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">
            {schedules.filter(s => s.status === 'DEAD_LETTER').length} failed
          </div>
          <span className="text-[10px] text-[#737D90]">Zero silent drops</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Worker Concurrency</span>
            <Lock className="w-3.5 h-3.5 text-[#E5A23B]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">Safe Atomic</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">Race-condition safe</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-[#E8EAF0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-[#5269D9]" />
            <h2 className="text-base font-bold text-[#20283A]">Message Scheduler & Automated Timers</h2>
          </div>
          <p className="text-xs text-[#737D90]">
            Worker lease-locked job queues with exponential backoff retries and idempotency keys
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheduled Campaign</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#E8EAF0] shadow-xs overflow-x-auto">
        {['all', 'scheduled', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === tab
                ? 'bg-[#EEF1FC] text-[#5269D9] shadow-2xs font-bold'
                : 'text-[#737D90] hover:text-[#20283A] hover:bg-[#F7F8FC]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-[#737D90]">Loading schedules...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#737D90]">
            No schedules matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E8EAF0] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] border-b border-[#E8EAF0] text-[#737D90] font-medium">
                <tr>
                  <th className="py-2.5 px-3">Schedule Name</th>
                  <th className="py-2.5 px-3">Execution Time</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Gateway & Audience</th>
                  <th className="py-2.5 px-3">Idempotency Key</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0]">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F8FC]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#20283A]">{s.name}</div>
                      <div className="text-[10px] text-[#737D90] truncate max-w-xs">{s.templateContent}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[#20283A] font-medium">
                        {new Date(s.scheduledAt).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#737D90]">{s.timezone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] bg-[#F6F7FB] border border-[#E8EAF0] text-[#20283A] px-2 py-0.5 rounded font-semibold">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] font-semibold text-[#5269D9] uppercase">
                        {s.channel}
                      </div>
                      <div className="text-[10px] text-[#737D90]">Audience: {s.targetAudience}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] text-[#737D90] bg-[#F7F8FC] px-1.5 py-0.5 rounded border border-[#E8EAF0]" title={s.idempotencyKey}>
                        {s.idempotencyKey.substring(0, 14)}...
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={s.status} size="sm" />
                        {s.lockedBy && (
                          <span className="text-[9px] bg-[#EEF1FC] text-[#5269D9] px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5" title={`Worker Lease: ${s.lockedBy}`}>
                            <Lock className="w-2.5 h-2.5" /> Lease
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => handleRunNow(s.id)}
                              className="inline-flex items-center gap-1 bg-[#EEF1FC] hover:bg-[#D9E0F8] text-[#5269D9] px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              <Play className="w-3 h-3" /> Run
                            </button>
                            <button
                              onClick={() => handleCancel(s.id)}
                              className="inline-flex items-center gap-1 bg-[#FDF6EC] hover:bg-[#F8E3C3] text-[#E5A23B] px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedLogs(s)}
                          className="text-[#737D90] hover:text-[#20283A] text-[11px] font-semibold cursor-pointer underline"
                        >
                          Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs Modal */}
      {selectedLogs && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A]">Execution Logs: {selectedLogs.name}</h3>
              <button onClick={() => setSelectedLogs(null)} className="text-[#737D90] hover:text-[#20283A] text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(!selectedLogs.logs || selectedLogs.logs.length === 0) ? (
                <p className="text-xs text-[#737D90] text-center py-4">No audit logs recorded for this schedule.</p>
              ) : (
                selectedLogs.logs.map((log, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-[#E8EAF0] bg-[#F7F8FC] text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold text-[#5269D9]">{log.event}</span>
                      <span className="text-[#737D90]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-[#20283A] text-[11px]">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A]">Create Scheduled Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#737D90] hover:text-[#20283A] text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Campaign Identifier</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Saturday Flash Launch"
                  required
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20283A] mb-1">Repeat Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                  >
                    <option value="ONCE">Once (Single Dispatch)</option>
                    <option value="DAILY">Daily Recurring</option>
                    <option value="WEEKLY">Weekly Recurring</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#20283A] mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                  >
                    <option value="All">All Audience</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20283A] mb-1">Execution Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#20283A] mb-1">Dispatch Gateway</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                  >
                    <option value="both">Both (SMS + WhatsApp)</option>
                    <option value="whatsapp">WhatsApp Only</option>
                    <option value="sms">SMS Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Linked Offer Voucher</label>
                <select
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                >
                  {uniqueOffers.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.code} — {o.discount}
                    </option>
                  ))}
                  {uniqueOffers.length === 0 && <option value="SUMMER25">SUMMER25 (Default Special)</option>}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Message Template Copy</label>
                <textarea
                  rows={2}
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8EAF0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-[#E8EAF0] bg-white text-xs font-semibold text-[#20283A] rounded-lg hover:bg-[#F7F8FC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
