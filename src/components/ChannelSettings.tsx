import React, { useState } from 'react';
import { GovernanceSuppression } from './GovernanceSuppression';
import { toast } from '../services/toast';
import { PageHeader } from './ui';
import {
  ShieldCheck,
  PhoneForwarded,
  Save
} from 'lucide-react';

interface ChannelSettingsProps {
  whatsappNumber: string;
  smsNumber: string;
  customerCareNumber: string;
  setCustomerCareNumber: (num: string) => void;
  sendToCustomerCare: boolean;
  setSendToCustomerCare: (send: boolean) => void;
  platform: 'both' | 'whatsapp' | 'sms';
  onSaveCareSettings: (num?: string, send?: boolean, plat?: 'both' | 'whatsapp' | 'sms') => void;
}

export const ChannelSettings: React.FC<ChannelSettingsProps> = ({
  whatsappNumber,
  smsNumber,
  customerCareNumber,
  setCustomerCareNumber,
  sendToCustomerCare,
  setSendToCustomerCare,
  platform,
  onSaveCareSettings
}) => {
  const [activeTab, setActiveTab] = useState<'gateway' | 'governance'>('gateway');

  const handleSave = () => {
    onSaveCareSettings(customerCareNumber, sendToCustomerCare, platform);
    toast.success('Gateway Settings Saved', {
      description: 'Telephony gateway preferences updated successfully.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'System & Security' }, { label: 'Channel & Care Settings' }]}
        title="Channel & Care Settings"
        subtitle="Telephony gateway routing, outbound carrier dispatch numbers, and compliance opt-out governance."
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC]">
            ● Carrier Active
          </span>
        }
        actions={
          activeTab === 'gateway' ? (
            <button
              onClick={handleSave}
              className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs"
            >
              <Save className="w-4 h-4" />
              Save Gateway Settings
            </button>
          ) : undefined
        }
      />

      {/* Top Governance & Gateway Contextual Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">SMS Sender Line</span>
            <PhoneForwarded className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-sm font-bold font-mono text-[#20283A] mt-1 truncate">{smsNumber}</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">● Carrier Verified</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">WhatsApp Sender</span>
            <PhoneForwarded className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-sm font-bold font-mono text-[#20283A] mt-1 truncate">{whatsappNumber}</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">● Active Gateway</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Care Forwarding</span>
            <PhoneForwarded className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-sm font-bold font-mono text-[#20283A] mt-1 truncate">{customerCareNumber}</div>
          <span className="text-[10px] text-[#5269D9] font-medium">
            {sendToCustomerCare ? 'Audit Copy Active' : 'Forwarding Disabled'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Governance Engine</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#E5A23B]" />
          </div>
          <div className="text-sm font-bold text-[#20283A] mt-1">Quiet Hours Active</div>
          <span className="text-[10px] text-[#737D90]">Anti-Fatigue Guard</span>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E8EAF0] shadow-xs">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gateway'
              ? 'bg-[#EEF1FC] text-[#5269D9] shadow-2xs'
              : 'text-[#737D90] hover:text-[#20283A] hover:bg-[#F7F8FC]'
          }`}
        >
          <PhoneForwarded className="w-4 h-4" />
          <span>Telephony Gateway & Routing</span>
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'governance'
              ? 'bg-[#EEF1FC] text-[#5269D9] shadow-2xs'
              : 'text-[#737D90] hover:text-[#20283A] hover:bg-[#F7F8FC]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Customer Safety & Governance Registry</span>
        </button>
      </div>

      {activeTab === 'gateway' ? (
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E8EAF0] pb-4">
            <h3 className="text-base font-bold text-[#20283A]">Telephony Gateway & Routing Configuration</h3>
            <p className="text-xs text-[#737D90]">Configure verified sender endpoints, live forwarding copies, and carrier routes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Endpoints */}
            <div className="bg-[#F7F8FC] p-5 rounded-xl border border-[#E8EAF0] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
                <h4 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                  Outbound Sender Endpoints
                </h4>
                <span className="text-[10px] font-semibold text-[#16A36A] bg-[#E8F7F0] px-2 py-0.5 rounded-full border border-[#C8EEDC]">
                  Twilio Verified
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[#737D90] font-semibold block mb-1">WhatsApp Outbound Sender Number</span>
                  <div className="p-2.5 bg-white border border-[#E8EAF0] rounded-lg font-mono text-[#20283A] flex items-center justify-between shadow-2xs">
                    <span>{whatsappNumber}</span>
                    <span className="text-[10px] text-[#16A36A] font-bold">● Active Sandbox</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#737D90] font-semibold block mb-1">Cellular SMS Outbound Number</span>
                  <div className="p-2.5 bg-white border border-[#E8EAF0] rounded-lg font-mono text-[#20283A] flex items-center justify-between shadow-2xs">
                    <span>{smsNumber}</span>
                    <span className="text-[10px] text-[#16A36A] font-bold">● Active Route</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Care Escalation */}
            <div className="bg-[#F7F8FC] p-5 rounded-xl border border-[#E8EAF0] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
                <h4 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">
                  Customer Care Audit Settings
                </h4>
                <PhoneForwarded className="w-4 h-4 text-[#5269D9]" />
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#737D90] font-semibold mb-1">
                    Care Forwarding Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerCareNumber}
                    onChange={e => setCustomerCareNumber(e.target.value)}
                    placeholder="+916369825386"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="setCareCheck"
                    checked={sendToCustomerCare}
                    onChange={e => setSendToCustomerCare(e.target.checked)}
                    className="w-4 h-4 text-[#5269D9] rounded border-[#E8EAF0] focus:ring-[#5269D9] cursor-pointer"
                  />
                  <label htmlFor="setCareCheck" className="text-xs text-[#737D90] cursor-pointer">
                    Forward live verification copy across all broadcast campaigns
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Gateway Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <GovernanceSuppression />
      )}
    </div>
  );
};
