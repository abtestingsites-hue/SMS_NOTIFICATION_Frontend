import React, { useState, useEffect } from 'react';
import type { SuppressionRecord, GovernanceRules } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

export const GovernanceSuppression: React.FC = () => {
  const [suppressed, setSuppressed] = useState<SuppressionRecord[]>([]);
  const [rules, setRules] = useState<GovernanceRules | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newReason, setNewReason] = useState('Manual Administrative Opt-Out');
  const [removeTargetPhone, setRemoveTargetPhone] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppList, govRules] = await Promise.all([
        api.getSuppressionList(),
        api.getGovernanceRules()
      ]);
      setSuppressed(suppList);
      setRules(govRules);
    } catch (err: any) {
      console.warn('Governance data fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;

    try {
      await api.addSuppression(newPhone, newReason);
      toast.success('Phone Suppressed', { description: `${newPhone} added to suppression list.` });
      setNewPhone('');
      fetchData();
    } catch (err: any) {
      toast.error('Add Suppression Failed', { description: err.message });
    }
  };

  const handleRemoveSuppression = (phone: string) => {
    setRemoveTargetPhone(phone);
  };

  const confirmRemoveSuppression = async () => {
    if (!removeTargetPhone) return;
    try {
      await api.removeSuppression(removeTargetPhone);
      toast.info('Suppression Removed', { description: `Removed ${removeTargetPhone} from suppression list.` });
      setRemoveTargetPhone(null);
      fetchData();
    } catch (err: any) {
      toast.error('Remove Suppression Failed', { description: err.message });
      setRemoveTargetPhone(null);
    }
  };

  const handleSaveRules = async () => {
    if (!rules) return;
    try {
      await api.saveGovernanceRules(rules);
      toast.success('Governance Rules Saved', {
        description: 'Quiet hours & frequency cap rules updated and enforced.'
      });
      fetchData();
    } catch (err: any) {
      toast.error('Save Rules Failed', { description: err.message });
    }
  };

  return (
    <div className="space-y-6">

      {/* Quiet Hours & Frequency Caps Config */}
      {rules && (
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-2xs space-y-4">
          <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                Quiet Hours & Fatigue Rules
              </h3>
              <p className="text-[11px] text-[#737D90]">
                Automated protections preventing night-time SMS/WhatsApp messages and campaign fatigue.
              </p>
            </div>
            <button
              onClick={handleSaveRules}
              className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Save Rule Policies
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quiet Hours Toggle */}
            <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E8EAF0] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#20283A]">Quiet Hours Guard</span>
                <span className="text-[10px] text-[#737D90] block">Block night transmissions</span>
              </div>
              <input
                type="checkbox"
                checked={rules.quietHoursEnabled}
                onChange={(e) => setRules({ ...rules, quietHoursEnabled: e.target.checked })}
                className="w-4 h-4 text-[#5269D9] rounded cursor-pointer"
              />
            </div>

            {/* Time Window */}
            <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E8EAF0]">
              <span className="text-xs font-bold text-[#20283A] block mb-1">Quiet Window</span>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="time"
                  value={rules.quietHoursStart}
                  onChange={(e) => setRules({ ...rules, quietHoursStart: e.target.value })}
                  className="bg-white border border-[#E8EAF0] rounded px-1.5 py-0.5 text-xs text-[#20283A]"
                />
                <span className="text-[#737D90]">to</span>
                <input
                  type="time"
                  value={rules.quietHoursEnd}
                  onChange={(e) => setRules({ ...rules, quietHoursEnd: e.target.value })}
                  className="bg-white border border-[#E8EAF0] rounded px-1.5 py-0.5 text-xs text-[#20283A]"
                />
              </div>
            </div>

            {/* Frequency Cap Toggle */}
            <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E8EAF0] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#20283A]">Frequency Capping</span>
                <span className="text-[10px] text-[#737D90] block">Max 3 msgs per week</span>
              </div>
              <input
                type="checkbox"
                checked={rules.frequencyCapEnabled}
                onChange={(e) => setRules({ ...rules, frequencyCapEnabled: e.target.checked })}
                className="w-4 h-4 text-[#5269D9] rounded cursor-pointer"
              />
            </div>

            {/* Opt-out Keywords */}
            <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E8EAF0]">
              <span className="text-xs font-bold text-[#20283A] block mb-1">Opt-Out Triggers</span>
              <div className="flex flex-wrap gap-1">
                {rules.optOutKeywords?.map((kw, i) => (
                  <span key={i} className="bg-red-50 text-red-700 text-[9px] font-mono font-bold px-1 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suppression List Management */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-2xs space-y-4">
        <div className="border-b border-[#E8EAF0] pb-3">
          <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
            Opt-Out Suppression Registry
          </h3>
          <p className="text-[11px] text-[#737D90]">
            Phone numbers that have texted STOP or have been administratively blacklisted. Any campaign dispatch targeting these numbers is automatically blocked.
          </p>
        </div>

        {/* Add phone input */}
        <form onSubmit={handleAddSuppression} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="flex-1 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none"
          />
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Opt-out reason"
            className="flex-1 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-1.5 text-xs text-[#20283A] focus:bg-white focus:border-[#5269D9] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            Suppress Phone
          </button>
        </form>

        {/* Table */}
        {loading ? (
          <div className="text-center py-6 text-xs text-[#737D90]">Loading suppression list...</div>
        ) : suppressed.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#737D90]">Suppression registry is currently empty.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EAF0] text-[#737D90] font-medium">
                  <th className="py-2.5 px-3">Suppressed Phone</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Added Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0]">
                {suppressed.map((s, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F8FC]/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#20283A]">{s.phone}</td>
                    <td className="py-3 px-3 text-[#DC2626] font-medium">{s.reason}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {s.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#737D90] text-[11px]">
                      {new Date(s.addedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRemoveSuppression(s.phone)}
                        className="text-[#5269D9] hover:underline font-semibold cursor-pointer text-[11px]"
                      >
                        Unsuppress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Unsuppressing Phone */}
      <ConfirmationDialog
        isOpen={Boolean(removeTargetPhone)}
        title="Remove From Suppression List"
        description={`Remove ${removeTargetPhone} from the suppression list? This contact will become eligible for future automated and broadcast dispatches.`}
        confirmLabel="Remove & Re-enable"
        confirmVariant="primary"
        onConfirm={confirmRemoveSuppression}
        onCancel={() => setRemoveTargetPhone(null)}
      />
    </div>
  );
};
