import React, { useState, useEffect } from 'react';
import type { AutomationWorkflow } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import { PageHeader } from './ui/PageHeader';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import {
  Workflow,
  Plus,
  Play,
  Trash2
} from 'lucide-react';

export const AutomationEngine: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'CAMPAIGN_DISPATCHED' | 'DAYS_INACTIVE' | 'OFFER_VIEWED'>('CAMPAIGN_DISPATCHED');
  const [delayValue, setDelayValue] = useState(24);
  const [delayUnit, setDelayUnit] = useState<'HOURS' | 'DAYS'>('HOURS');
  const [actionType, setActionType] = useState<'SEND_WHATSAPP' | 'SEND_SMS' | 'NOTIFY_CARE'>('SEND_WHATSAPP');
  const [actionTemplate, setActionTemplate] = useState('Hi {{1}}, don’t miss out on your special voucher {{2}}!');

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const items = await api.getAutomations();
      setAutomations(items);
    } catch (err: any) {
      console.warn('Failed to fetch automations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleAutomation(id);
      toast.success(res.message);
      fetchAutomations();
    } catch (err: any) {
      toast.error('Toggle Failed', { description: err.message });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteAutomation(deleteTargetId);
      toast.info('Workflow Deleted', { description: 'Automation pipeline removed.' });
      setDeleteTargetId(null);
      fetchAutomations();
    } catch (err: any) {
      toast.error('Delete Failed', { description: err.message });
      setDeleteTargetId(null);
    }
  };

  const handleTriggerTest = async (id: string) => {
    try {
      const res = await api.testAutomation(id);
      if (res.success) {
        toast.success('Test Run Completed', {
          description: `${res.actionsProcessed.length} action(s) processed for test recipient.`
        });
        fetchAutomations();
      } else {
        toast.error('Test Failed', { description: res.message });
      }
    } catch (err: any) {
      toast.error('Test Run Failed', { description: err.message });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createAutomation({
        name,
        active: true,
        trigger: {
          type: triggerType,
          delayValue: Number(delayValue),
          delayUnit: delayUnit
        },
        conditions: [
          { field: 'gender', operator: 'EQUALS', value: 'All' }
        ],
        actions: [
          {
            type: actionType,
            channel: actionType === 'SEND_WHATSAPP' ? 'whatsapp' : 'sms',
            template: actionTemplate,
            offerCode: 'SUMMER25'
          }
        ]
      });
      toast.success('Automation Pipeline Created', { description: `Automation "${name}" is now active.` });
      setShowCreateModal(false);
      setName('');
      fetchAutomations();
    } catch (err: any) {
      toast.error('Failed to Create Automation', { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Standard Enterprise Page Header */}
      <PageHeader
        title="Follow-up Automations"
        subtitle="Configure event-driven and schedule-aware customer journey pipelines with interval delays and fallback actions."
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC]">
            <Workflow className="w-3 h-3" />
            Active Automation Engine
          </span>
        }
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Automation</span>
          </button>
        }
      />

      {/* Top Automations Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Active Pipelines</span>
            <Workflow className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">
            {automations.filter(a => a.active).length} of {automations.length} active
          </div>
          <span className="text-[10px] text-[#5269D9] font-medium">Auto-listening engine</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Trigger Executions</span>
            <Workflow className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">
            {automations.reduce((sum, a) => sum + (a.stats?.triggeredCount || 0), 0)} runs
          </div>
          <span className="text-[10px] text-[#16A36A] font-semibold">
            {automations.reduce((sum, a) => sum + (a.stats?.completedCount || 0), 0)} completed
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Success Ratio</span>
            <Workflow className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">
            {(() => {
              const trg = automations.reduce((sum, a) => sum + (a.stats?.triggeredCount || 0), 0);
              const cmp = automations.reduce((sum, a) => sum + (a.stats?.completedCount || 0), 0);
              return trg > 0 ? `${Math.round((cmp / trg) * 100)}%` : 'N/A';
            })()}
          </div>
          <span className="text-[10px] text-[#737D90]">Delivered without error</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Follow-up Conversions</span>
            <Workflow className="w-3.5 h-3.5 text-[#E5A23B]" />
          </div>
          <div className="text-lg font-bold text-[#E5A23B] mt-1">
            {automations.reduce((sum, a) => sum + (a.stats?.convertedCount || 0), 0)}
          </div>
          <span className="text-[10px] text-[#737D90]">Recipient engagements</span>
        </div>
      </div>

      {/* Header action card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E8EAF0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Workflow className="w-4 h-4 text-[#5269D9]" />
            <h2 className="text-base font-bold text-[#20283A]">Customer Re-engagement & Follow-up Automations</h2>
          </div>
          <p className="text-xs text-[#737D90]">
            Autonomous trigger-condition-action pipelines for abandoned promos, VIP alerts, and quiet hours governance.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Build Automation Workflow</span>
        </button>
      </div>

      {/* Workflow Cards */}
      {loading ? (
        <div className="text-center py-8 text-xs text-[#737D90]">Loading workflows...</div>
      ) : automations.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#737D90] bg-white rounded-xl border border-[#E8EAF0] space-y-1">
          <p className="font-semibold text-[#20283A]">No automation pipelines active</p>
          <p>Create a trigger → condition → action workflow above to automatically nudge customers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-4">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAF0] pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${w.active ? 'bg-[#16A36A] animate-pulse' : 'bg-slate-300'}`} />
                  <div>
                    <h3 className="text-sm font-bold text-[#20283A]">{w.name}</h3>
                    <span className="text-[10px] text-[#737D90]">Created {new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggle(w.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      w.active ? 'bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC]' : 'bg-[#F7F8FC] text-[#737D90] border border-[#E8EAF0]'
                    }`}
                  >
                    {w.active ? 'Active' : 'Paused'}
                  </button>

                  <button
                    onClick={() => handleTriggerTest(w.id)}
                    className="inline-flex items-center gap-1 bg-[#EEF1FC] hover:bg-[#D9E0F8] text-[#5269D9] px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3" /> Test Run
                  </button>

                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-[#D94D59] hover:underline text-xs font-semibold cursor-pointer px-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Workflow Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Trigger */}
                <div className="p-3.5 rounded-lg border border-[#E8EAF0] bg-[#F7F8FC]/60 space-y-1">
                  <span className="text-[10px] font-bold text-[#5269D9] uppercase tracking-wider block">
                    Step 1: Event Trigger
                  </span>
                  <div className="text-xs font-bold text-[#20283A]">{w.trigger.type.replace(/_/g, ' ')}</div>
                  <div className="text-[11px] text-[#737D90]">
                    Execution Delay: {w.trigger.delayValue} {w.trigger.delayUnit.toLowerCase()}
                  </div>
                </div>

                {/* 2. Condition */}
                <div className="p-3.5 rounded-lg border border-[#E8EAF0] bg-[#F7F8FC]/60 space-y-1">
                  <span className="text-[10px] font-bold text-[#5269D9] uppercase tracking-wider block">
                    Step 2: Safety & Rules
                  </span>
                  <div className="text-xs font-bold text-[#20283A]">Governance Rule Applied</div>
                  <div className="text-[11px] text-[#737D90]">
                    Anti-fatigue check & quiet hours filter
                  </div>
                </div>

                {/* 3. Action */}
                <div className="p-3.5 rounded-lg border border-[#E8EAF0] bg-[#F7F8FC]/60 space-y-1">
                  <span className="text-[10px] font-bold text-[#16A36A] uppercase tracking-wider block">
                    Step 3: Dual Action
                  </span>
                  <div className="text-xs font-bold text-[#20283A]">
                    {w.actions[0]?.type.replace(/_/g, ' ') || 'Send Nudge'}
                  </div>
                  <div className="text-[11px] text-[#737D90] truncate">
                    {w.actions[0]?.template || 'Automated customer copy'}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between text-xs text-[#737D90] pt-1">
                <span>Triggered: <strong className="text-[#20283A]">{w.stats?.triggeredCount || 0} times</strong></span>
                <span>Completed: <strong className="text-[#16A36A]">{w.stats?.completedCount || 0} delivered</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Build Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8EAF0] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#20283A]">Build Automation Workflow</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#737D90] hover:text-[#20283A] text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Workflow Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 24h Post-Broadcast Re-engagement"
                  required
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20283A] mb-1">Trigger Event</label>
                  <select
                    value={triggerType}
                    onChange={(e: any) => setTriggerType(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                  >
                    <option value="CAMPAIGN_DISPATCHED">Campaign Dispatched</option>
                    <option value="DAYS_INACTIVE">Days Inactive</option>
                    <option value="OFFER_VIEWED">Offer Viewed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#20283A] mb-1">Delay Window</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={delayValue}
                      onChange={(e) => setDelayValue(Number(e.target.value))}
                      min="1"
                      className="w-16 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-2 py-2 text-[#20283A]"
                    />
                    <select
                      value={delayUnit}
                      onChange={(e: any) => setDelayUnit(e.target.value)}
                      className="flex-1 bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-2 py-2 text-[#20283A]"
                    >
                      <option value="HOURS">Hours</option>
                      <option value="DAYS">Days</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Outbound Action</label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg px-3 py-2 text-[#20283A] focus:bg-white focus:border-[#5269D9]"
                >
                  <option value="SEND_WHATSAPP">Send WhatsApp Message</option>
                  <option value="SEND_SMS">Send Cellular SMS</option>
                  <option value="NOTIFY_CARE">Notify Customer Care Escalation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#20283A] mb-1">Nudge Message Template</label>
                <textarea
                  rows={3}
                  value={actionTemplate}
                  onChange={(e) => setActionTemplate(e.target.value)}
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
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standardized Delete Workflow Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Automation Workflow"
        description="Are you sure you want to delete this automation workflow? Inbound triggers will no longer execute follow-up messages for this pipeline."
        confirmLabel="Delete Workflow"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
