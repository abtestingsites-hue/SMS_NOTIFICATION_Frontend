import React, { useState, useMemo } from 'react';
import type { NavModule, Campaign, Offer } from '../types';
import { toast } from '../services/toast';
import { StatusBadge } from './ui/StatusBadge';
import { ConfirmDialog } from './ui/ConfirmDialog';
import {
  Send,
  MessageSquare,
  Smartphone,
  Layers,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface CampaignConsoleProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onLaunchCampaign: (params: {
    name: string;
    platform: 'both' | 'whatsapp' | 'sms';
    targetAudience: string;
    validUntil: string;
    delayHours: number;
    offerCode?: string;
  }) => Promise<void>;
  onSendSingleMessage: (recipient: string, platform: 'both' | 'whatsapp' | 'sms') => Promise<{ success: boolean; message: string; details?: any }>;
  customerCareNumber: string;
  setCustomerCareNumber: (num: string) => void;
  sendToCustomerCare: boolean;
  setSendToCustomerCare: (send: boolean) => void;
  platform: 'both' | 'whatsapp' | 'sms';
  setPlatform: (p: 'both' | 'whatsapp' | 'sms') => void;
  template: string;
  offers: Offer[];
  setActiveNav: (nav: NavModule) => void;
  onSaveCareSettings: (num?: string, send?: boolean, plat?: 'both' | 'whatsapp' | 'sms') => void;
}

export const CampaignConsole: React.FC<CampaignConsoleProps> = ({
  campaigns,
  activeCampaign,
  onLaunchCampaign,
  onSendSingleMessage,
  customerCareNumber,
  setCustomerCareNumber,
  sendToCustomerCare,
  setSendToCustomerCare,
  platform,
  setPlatform,
  template,
  offers,
  setActiveNav,
  onSaveCareSettings
}) => {
  const [campaignName, setCampaignName] = useState('Exclusive Spring Promotion');
  const [targetAudience, setTargetAudience] = useState('All');
  const [validUntil, setValidUntil] = useState('2026-08-15');
  const [scheduleDelay, setScheduleDelay] = useState(0);
  const uniqueOffers = useMemo(() => {
    const seen = new Set<string>();
    return offers.filter(o => {
      const c = o.code ? o.code.trim().toUpperCase() : null;
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
  }, [offers]);

  const [selectedOfferCode, setSelectedOfferCode] = useState(uniqueOffers[0]?.code || offers[0]?.code || 'SPRING25');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Performance calculations from real campaigns (consistent formulation)
  const totalSent = campaigns.reduce((sum, c) => {
    if (c.sent !== undefined && c.sent > 0) return sum + c.sent;
    if (c.status === 'COMPLETED') return sum + (c.total || 0);
    return sum + (c.sent || 0);
  }, 0);
  const rawDelivered = campaigns.filter(c => c.status === 'COMPLETED').reduce((sum, c) => {
    if ((c as any).delivered !== undefined) return sum + (c as any).delivered;
    if (c.sent !== undefined && c.sent > 0) return sum + c.sent;
    return sum + (c.total || 0);
  }, 0);
  const totalDelivered = Math.min(totalSent, rawDelivered);
  const deliveryRate = totalSent > 0 ? Math.min(100, Math.round((totalDelivered / totalSent) * 100)) : null;
  const totalFailed = campaigns.reduce((sum, c) => sum + ((c as any).failed !== undefined ? (c as any).failed : (c.status === 'FAILED' ? (c.sent || c.total || 0) : 0)), 0);

  // Single Pre-flight test state
  const [singleRecipient, setSingleRecipient] = useState(customerCareNumber || '+916369825386');
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const activeOffer = uniqueOffers.find(o => o.code === selectedOfferCode) || uniqueOffers[0] || offers[0] || {
    code: 'SPRING25',
    discount: '25% OFF',
    description: 'Special Privilege'
  };

  // Preview text with dynamic tokens
  const renderPreview = () => {
    let text = template || "Hi {{1}} 👋\n\n✨ *Exclusive Offer Just for You!* ✨\n\n{{2}}\n\n⏰ *Offer Valid Until:* {{3}}\n\nCome and get it soon! 🛍️🔥\n\nReply *STOP* to opt out.";
    const offerStr = `${activeOffer.description || 'Special Privilege'}\nCode: *${activeOffer.code}* (${activeOffer.discount})`;
    text = text.split('{{1}}').join('Alexander Wright').split('{1}').join('Alexander Wright');
    text = text.split('{{2}}').join(offerStr).split('{2}').join(offerStr);
    text = text.split('{{3}}').join(validUntil).split('{3}').join(validUntil);
    text = text.split('{{care_number}}').join(customerCareNumber || '+916369825386');
    return text;
  };

  const previewText = renderPreview();
  const charCount = previewText.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  const handleConfirmLaunch = async () => {
    setIsLaunching(true);
    try {
      await onLaunchCampaign({
        name: campaignName,
        platform,
        targetAudience,
        validUntil,
        delayHours: scheduleDelay,
        offerCode: selectedOfferCode
      });
      toast.success('Broadcast Campaign Dispatched', {
        description: `Campaign "${campaignName || 'Broadcast'}" launched on ${platform.toUpperCase()}.`
      });
      setIsConfirmOpen(false);
    } catch (e: any) {
      toast.error('Campaign Launch Failed', { description: e.message || 'Error launching broadcast' });
      console.error(e);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleTestDispatch = async () => {
    if (!singleRecipient) return;
    setIsSendingSingle(true);
    setSingleResult(null);
    try {
      const res = await onSendSingleMessage(singleRecipient, platform);
      setSingleResult(res);
      if (res.success) {
        toast.success('Test Message Dispatched', {
          description: `Dispatched to ${singleRecipient} via ${platform.toUpperCase()}.`
        });
      } else {
        toast.error('Test Dispatch Failed', {
          description: (res as any).error || res.message || 'Carrier rejected dispatch'
        });
      }
    } catch (err: any) {
      setSingleResult({ success: false, message: err.message || 'Dispatch failed' });
      toast.error('Test Dispatch Failed', { description: err.message });
    } finally {
      setIsSendingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Campaign Performance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Historical Campaigns</span>
          <div className="text-lg font-bold text-[#20283A] mt-0.5">{campaigns.length} total</div>
          <span className="text-[10px] text-[#5269D9] font-medium">{campaigns.filter(c => c.status === 'COMPLETED').length} completed</span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Outbound Dispatches</span>
          <div className="text-lg font-bold text-[#20283A] mt-0.5">{totalSent.toLocaleString()}</div>
          <span className="text-[10px] text-[#737D90]">SMS & WhatsApp</span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Confirmed Deliveries</span>
          <div className="text-lg font-bold text-[#16A36A] mt-0.5">{totalDelivered.toLocaleString()}</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">{deliveryRate !== null ? `${deliveryRate}% delivery rate` : 'N/A (No activity)'}</span>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-[#737D90] block">Carrier Errors / Bounces</span>
          <div className="text-lg font-bold text-[#E5A23B] mt-0.5">{totalFailed}</div>
          <span className="text-[10px] text-[#737D90]">Unverified / Rebuffed</span>
        </div>
      </div>

      {/* Active Campaign Status Monitor Card */}
      {activeCampaign && (
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-medium text-[#737D90]">Job #{activeCampaign.id}</span>
                <StatusBadge status={activeCampaign.status} pulse={activeCampaign.status === 'PROCESSING'} />
              </div>
              <h3 className="text-sm font-bold text-[#20283A]">{activeCampaign.name}</h3>
            </div>

            <div className="text-right">
              <span className="text-xl font-bold text-[#20283A]">
                {activeCampaign.total > 0 ? Math.round((activeCampaign.sent / activeCampaign.total) * 100) : 0}%
              </span>
              <span className="block text-xs text-[#737D90]">
                {activeCampaign.sent} of {activeCampaign.total} delivered
              </span>
            </div>
          </div>

          <div className="w-full bg-[#F6F7FB] h-2 rounded-full overflow-hidden border border-[#E8EAF0]">
            <div
              className="bg-[#5269D9] h-full rounded-full transition-all duration-500"
              style={{ width: `${activeCampaign.total > 0 ? (activeCampaign.sent / activeCampaign.total) * 100 : 0}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-[#737D90]">
            <span>Gateway: <strong className="text-[#20283A] uppercase">{activeCampaign.platform || platform}</strong></span>
            {activeCampaign.sendToCustomerCare && (
              <span className="text-[#16A36A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Care audit copy sent to {customerCareNumber}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campaign Configuration */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-[#E8EAF0] pb-3">
            <h3 className="text-sm font-bold text-[#20283A]">Campaign Configuration</h3>
            <p className="text-xs text-[#737D90]">Set campaign identifier, dispatch channels, audience, and offer</p>
          </div>

          <div className="space-y-4">
            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-semibold text-[#20283A] mb-1">
                Campaign Identifier
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. VIP Priority Offer - Q4"
                className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white transition-all shadow-xs"
              />
            </div>

            {/* Channels Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#20283A] mb-1.5">
                Dispatch Channels
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F6F7FB] border border-[#E8EAF0] rounded-lg text-center">
                <button
                  type="button"
                  onClick={() => { setPlatform('both'); onSaveCareSettings(undefined, undefined, 'both'); }}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'both' ? 'bg-white text-[#5269D9] font-bold shadow-xs border border-[#E8EAF0]' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Both (WA + SMS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPlatform('whatsapp'); onSaveCareSettings(undefined, undefined, 'whatsapp'); }}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'whatsapp' ? 'bg-white text-[#16A36A] font-bold shadow-xs border border-[#E8EAF0]' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPlatform('sms'); onSaveCareSettings(undefined, undefined, 'sms'); }}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'sms' ? 'bg-white text-[#5269D9] font-bold shadow-xs border border-[#E8EAF0]' : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Cellular SMS</span>
                </button>
              </div>
            </div>

            {/* Audience & Expiry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white cursor-pointer"
                >
                  <option value="All">Target: All Customers</option>
                  <option value="Men">Target: Men</option>
                  <option value="Women">Target: Women</option>
                  <option value="Boys">Target: Boys</option>
                  <option value="Girls">Target: Girls</option>
                  <option value="Children">Target: Children</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20283A] mb-1">
                  Offer Expiration
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
                />
              </div>
            </div>

            {/* Offer Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#20283A] mb-1">
                Linked Promo Offer
              </label>
              <select
                value={selectedOfferCode}
                onChange={e => setSelectedOfferCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white cursor-pointer"
              >
                {uniqueOffers.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} — {o.discount} ({o.description})
                  </option>
                ))}
              </select>
            </div>

            {/* Delay Slider */}
            <div className="pt-2 border-t border-[#E8EAF0]">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-[#20283A] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5269D9]" /> Schedule Delay
                </label>
                <span className="font-semibold text-[#5269D9] bg-[#EEF1FC] px-2 py-0.5 rounded text-[11px]">
                  {scheduleDelay === 0 ? 'Immediate Launch' : `+${scheduleDelay} Hours Delay`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={scheduleDelay}
                onChange={e => setScheduleDelay(Number(e.target.value))}
                className="w-full accent-[#5269D9] h-1.5 bg-[#E8EAF0] rounded-lg cursor-pointer"
              />
            </div>

            {/* Care Forwarding */}
            <div className="pt-2 border-t border-[#E8EAF0] space-y-2">
              <label className="block text-xs font-semibold text-[#20283A]">
                Customer Care Forwarding
              </label>
              <input
                type="text"
                value={customerCareNumber}
                onChange={e => setCustomerCareNumber(e.target.value)}
                onBlur={() => onSaveCareSettings(customerCareNumber, sendToCustomerCare, platform)}
                placeholder="+916369825386"
                className="w-full px-3 py-2 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
              />
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="careCheck"
                  checked={sendToCustomerCare}
                  onChange={e => {
                    setSendToCustomerCare(e.target.checked);
                    onSaveCareSettings(customerCareNumber, e.target.checked, platform);
                  }}
                  className="w-4 h-4 text-[#5269D9] rounded border-[#E8EAF0] focus:ring-[#5269D9] cursor-pointer"
                />
                <label htmlFor="careCheck" className="text-xs text-[#737D90] cursor-pointer">
                  Forward a live verification copy to Customer Care on broadcast launch
                </label>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="w-full py-2.5 px-4 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Launch Broadcast Campaign</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Message Preview & Pre-Flight Testing */}
        <div className="lg:col-span-6 space-y-5">
          {/* Live Mobile Device Preview */}
          <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#20283A]">Live Device Preview</h3>
                <p className="text-xs text-[#737D90]">Chat bubble simulation with dynamic tokens</p>
              </div>
              <button
                onClick={() => setActiveNav('templates')}
                className="text-xs text-[#5269D9] hover:underline font-semibold cursor-pointer"
              >
                Template Studio →
              </button>
            </div>

            {/* Simulated Phone Shell */}
            <div className="bg-[#F6F7FB] border border-[#E8EAF0] rounded-xl p-4">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8EAF0] text-xs">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF1FC] text-[#5269D9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5269D9]" />
                  {platform === 'both' ? 'Dual: WhatsApp + SMS' : platform === 'whatsapp' ? 'WhatsApp' : 'Cellular SMS'}
                </span>
                <span className="text-[11px] text-[#737D90]">
                  {charCount} chars · ~{smsSegments} SMS {smsSegments > 1 ? 'segments' : 'segment'}
                </span>
              </div>

              <div className="bg-[#EBF2F7] rounded-lg p-3.5 border border-[#E8EAF0]">
                <div className="max-w-sm mx-auto space-y-2">
                  <div className="text-center">
                    <span className="text-[10px] font-medium text-[#737D90] bg-white/90 px-2 py-0.5 rounded-full shadow-2xs">
                      Today · Live Broadcast
                    </span>
                  </div>

                  <div className="bg-white text-[#20283A] rounded-xl rounded-tl-xs p-3.5 shadow-2xs border border-[#E8EAF0]">
                    <p className="text-xs text-[#20283A] leading-relaxed whitespace-pre-wrap font-sans">
                      {previewText}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#737D90]">
                      <span>To: Alexander Wright</span>
                      <div className="flex items-center gap-1">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#5269D9] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merge Tokens Guide */}
            <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
              <span className="bg-[#F7F8FC] border border-[#E8EAF0] px-2 py-0.5 rounded text-[#737D90]">
                <code>{"{{1}}"}</code> Customer Name
              </span>
              <span className="bg-[#F7F8FC] border border-[#E8EAF0] px-2 py-0.5 rounded text-[#737D90]">
                <code>{"{{2}}"}</code> Offer Details
              </span>
              <span className="bg-[#F7F8FC] border border-[#E8EAF0] px-2 py-0.5 rounded text-[#737D90]">
                <code>{"{{3}}"}</code> Expiration Date
              </span>
            </div>
          </div>

          {/* Pre-Flight Test Widget */}
          <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                <h4 className="text-xs font-bold text-[#20283A]">Pre-Flight Test (Single Recipient)</h4>
              </div>
              <span className="text-[10px] font-semibold text-[#5269D9] bg-[#EEF1FC] px-2 py-0.5 rounded">
                Saves Quota
              </span>
            </div>

            <p className="text-xs text-[#737D90]">
              Dispatch one message to verify carrier delivery before launching to the whole database.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={singleRecipient}
                onChange={e => setSingleRecipient(e.target.value)}
                placeholder="+916369825386"
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#F7F8FC] border border-[#E8EAF0] rounded-lg text-[#20283A] focus:outline-none focus:border-[#5269D9] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleTestDispatch}
                disabled={!singleRecipient || isSendingSingle}
                className="px-4 py-1.5 bg-[#5269D9] hover:bg-[#4056C4] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSendingSingle ? 'Dispatching...' : 'Send Test'}
              </button>
            </div>

            {singleResult && (
              <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                singleResult.success ? 'bg-[#E8F7F0] border-[#C8EEDC] text-[#16A36A]' : 'bg-[#FDF0F1] border-[#F9CFD3] text-[#D94D59]'
              }`}>
                <div className="font-semibold">{singleResult.message}</div>
                {singleResult.details && (
                  <div className="text-[11px] font-mono text-[#737D90] pt-1">
                    SMS: {singleResult.details.sms?.sent ? '✓ Delivered' : (singleResult.details.sms?.error || 'N/A')} | WhatsApp: {singleResult.details.whatsapp?.sent ? '✓ Delivered' : (singleResult.details.whatsapp?.error || 'N/A')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Activity History Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8EAF0] pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#20283A] uppercase tracking-wider">Campaign Activity History</h3>
            <p className="text-[11px] text-[#737D90]">Audit log of broadcast jobs, delivery statuses, and recipient volumes</p>
          </div>
          <span className="text-[11px] font-mono text-[#737D90]">{campaigns.length} campaigns recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8EAF0] text-[#737D90] font-semibold text-[11px]">
                <th className="py-2.5 px-3">Campaign Name</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Gateway</th>
                <th className="py-2.5 px-3">Dispatched</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF0]">
              {campaigns.slice(0, 8).map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#20283A]">{c.name}</td>
                  <td className="py-2.5 px-3 text-[#737D90]">{c.targetAudience || 'All'}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] bg-[#EEF1FC] text-[#5269D9] px-2 py-0.5 rounded font-semibold uppercase">
                      {c.platform || 'both'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#20283A]">
                    {c.sent || (c.status === 'COMPLETED' ? c.total : 0)} / {c.total}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#737D90] text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Outbound Campaign Launch"
        description={`Are you sure you want to broadcast "${campaignName}" to ${targetAudience} via ${platform.toUpperCase()}? Messages will immediately enqueue.`}
        confirmLabel="Confirm & Broadcast"
        cancelLabel="Review Settings"
        onConfirm={handleConfirmLaunch}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isLaunching}
      />
    </div>
  );
};
