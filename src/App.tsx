import { useState, useEffect } from 'react';

// Types
interface Campaign {
  id: number;
  name: string;
  status: 'PENDING' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'PAUSED_LIMIT_REACHED';
  total: number;
  sent: number;
  platform?: 'both' | 'whatsapp' | 'sms';
  template?: string;
  scheduledFor?: string;
  validUntil?: string;
  customerCareNumber?: string;
  sendToCustomerCare?: boolean;
}

// -----------------------------------------------------------------------------
// Component: Message Preview
// -----------------------------------------------------------------------------
const MessagePreview = ({
  template,
  name = "Akash",
  offerDetails = "Summer Collection Special\nGet 25% OFF using ID: *SUMMER25*",
  validUntil = "15 Aug 2025",
  careNumber = "+919363341709",
  platform = "both"
}: {
  template: string;
  name?: string;
  offerDetails?: string;
  validUntil?: string;
  careNumber?: string;
  platform?: 'both' | 'whatsapp' | 'sms';
}) => {
  let previewText = template || "";
  previewText = previewText.split('{{1}}').join(name).split('{1}').join(name);
  previewText = previewText.split('{{2}}').join(offerDetails).split('{2}').join(offerDetails);
  previewText = previewText.split('{{3}}').join(validUntil).split('{3}').join(validUntil);
  previewText = previewText.split('{{care_number}}').join(careNumber).split('{care_number}').join(careNumber);

  return (
    <div className="bg-[#E5DDD5] p-6 rounded-none shadow-none border border-zinc-200 w-full max-w-xl mx-2 font-sans relative">
      <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-mono uppercase tracking-widest text-zinc-600">
        <span>Delivery Channel: {platform === 'both' ? '💬 WhatsApp + 📱 Cellular SMS' : platform === 'whatsapp' ? '💬 WhatsApp Only' : '📱 Cellular SMS Only'}</span>
        <span className="text-zinc-500">Live Campaign Copy</span>
      </div>
      <div className="bg-white p-4 rounded-lg rounded-tl-none shadow-sm relative">
        <div className="absolute top-0 -left-2 w-0 h-0 border-[8px] border-white border-l-transparent border-b-transparent drop-shadow-sm"></div>
        <p className="text-base text-zinc-800 leading-relaxed whitespace-pre-wrap">{previewText}</p>
        <div className="mt-2 text-xs text-zinc-400 text-right flex justify-end items-center gap-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="text-blue-500">✓✓</span>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Application
// -----------------------------------------------------------------------------
function App() {
  // State
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState({ customers: '', offers: '', templates: '' });

  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // Default Template
  const [template, setTemplate] = useState(`Hi {{1}} 👋\n\n✨ *Exclusive Offer Just for You!* ✨\n\n{{2}}\n\n⏰ *Offer Valid Until:* {{3}}\n\nVisit our store and grab your favorite styles before time runs out.\nCome and get it soon! 🛍️🔥\n\nReply *STOP* to opt out.`);

  const [scheduleDelay, setScheduleDelay] = useState(0);
  const [campaignName, setCampaignName] = useState('');
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateStats, setTemplateStats] = useState<{ category: string, count: number }[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  const [offers, setOffers] = useState<any[]>([]);
  const [targetAudience, setTargetAudience] = useState('All');

  // Dual Platform State: 'both' | 'whatsapp' | 'sms'
  const [platform, setPlatform] = useState<'both' | 'whatsapp' | 'sms'>('both');
  const [whatsappNumber, setWhatsappNumber] = useState('whatsapp:+17372508034');
  const [smsNumber, setSmsNumber] = useState('+17372508034');

  // Customer Care State
  const [customerCareNumber, setCustomerCareNumber] = useState('+919363341709');
  const [sendToCustomerCare, setSendToCustomerCare] = useState(true);

  // Single Message Test State
  const [singleRecipient, setSingleRecipient] = useState('+919363341709');
  const [singleStatus, setSingleStatus] = useState('');
  const [singleDetails, setSingleDetails] = useState<any>(null);

  // Initial Load & Polling
  useEffect(() => {
    fetch('/api/templates/stats').then(res => res.json()).then(data => setTemplateStats(data)).catch(console.error);
    fetch('/api/offers').then(res => res.json()).then(data => setOffers(data)).catch(console.error);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.customerCareNumber) {
          setCustomerCareNumber(data.customerCareNumber);
          setSingleRecipient(data.customerCareNumber);
        }
        if (data.sendToCustomerCare !== undefined) setSendToCustomerCare(data.sendToCustomerCare);
        if (data.platform) setPlatform(data.platform);
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
        if (data.smsNumber) setSmsNumber(data.smsNumber);
      })
      .catch(console.error);

    let interval: any;
    if (activeCampaign && (activeCampaign.status === 'PROCESSING' || activeCampaign.status === 'SCHEDULED')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/campaigns/${activeCampaign.id}`);
          if (res.ok) {
            const data = await res.json();
            setActiveCampaign(data);
            if (data.status === 'COMPLETED' || data.status === 'PAUSED_LIMIT_REACHED') clearInterval(interval);
          }
        } catch (e) { console.error(e); }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeCampaign]);

  const handleTemplateUpload = async () => {
    if (!templateFile) return;
    const formData = new FormData();
    formData.append('file', templateFile);
    setUploadStatus(prev => ({ ...prev, templates: 'UPLOADING...' }));
    try {
      await fetch(`/api/upload/templates`, { method: 'POST', body: formData });
      setUploadStatus(prev => ({ ...prev, templates: '✓ SYSTEM UPDATED' }));
      fetch('/api/templates/stats').then(r => r.json()).then(d => setTemplateStats(d));
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, templates: 'FAILED' }));
    }
  };

  const handleFileUpload = async (type: 'customers' | 'offers') => {
    const file = type === 'customers' ? customerFile : offerFile;
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus(prev => ({ ...prev, [type]: 'UPLOADING...' }));
    try {
      const res = await fetch(`/api/upload/${type}`, { method: 'POST', body: formData });
      const data = await res.json();
      setUploadStatus(prev => ({ ...prev, [type]: `✓ ${data.count} RECORDS SECURED` }));
      if (type === 'offers') {
        fetch('/api/offers').then(r => r.json()).then(d => setOffers(d));
      }
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, [type]: 'FAILED' }));
    }
  };

  const handleSaveCareSettings = async (careNum?: string, sendCare?: boolean, plat?: 'both' | 'whatsapp' | 'sms') => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerCareNumber: careNum !== undefined ? careNum : customerCareNumber,
          sendToCustomerCare: sendCare !== undefined ? sendCare : sendToCustomerCare,
          platform: plat !== undefined ? plat : platform
        })
      });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  // Sends a Single Message (1 message only, preserves quota)
  const handleSendSingleMessage = async () => {
    setSingleStatus('DISPATCHING SINGLE MESSAGE...');
    setSingleDetails(null);
    try {
      const res = await fetch('/api/sms/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: singleRecipient,
          platform: platform,
          template: template
        })
      });
      const data = await res.json();
      setSingleDetails(data.details);
      if (res.ok && data.success) {
        setSingleStatus(data.message || '✓ SINGLE MESSAGE DELIVERED');
      } else {
        setSingleStatus(`FAILED: ${data.message || data.error || 'Failed'}`);
      }
    } catch (err: any) {
      setSingleStatus(`FAILED: ${err.message}`);
    }
  };

  const startCampaign = async () => {
    try {
      const payload = {
        name: campaignName || 'PRIORITY ALERT ' + new Date().toLocaleDateString(),
        scheduleDelayHours: scheduleDelay,
        validUntil: validUntil,
        targetAudience: targetAudience,
        platform: platform,
        template: template,
        customerCareNumber: customerCareNumber,
        sendToCustomerCare: sendToCustomerCare
      };
      const res = await fetch('/api/campaigns/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const statusRes = await fetch(`/api/campaigns/${data.campaignId}`);
      setActiveCampaign(await statusRes.json());
    } catch (err) { alert('Failed to launch'); }
  };

  // Manual Offer Logic
  const [offerInputMode, setOfferInputMode] = useState<'upload' | 'manual'>('upload');
  const [manualOffer, setManualOffer] = useState({ code: '', discount: '', description: '' });

  const handleManualOfferAdd = async () => {
    if (!manualOffer.code || !manualOffer.discount) return;
    setUploadStatus(prev => ({ ...prev, offers: 'ADDING...' }));
    try {
      await fetch('/api/offers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualOffer)
      });
      setUploadStatus(prev => ({ ...prev, offers: '✓ OFFER ADDED' }));
      fetch('/api/offers').then(r => r.json()).then(d => setOffers(d));
      setManualOffer({ code: '', discount: '', description: '' });
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, offers: 'FAILED' }));
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white" style={{ zoom: '90%' } as any}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex flex-col group cursor-pointer">
            <h1 className="text-3xl font-serif tracking-widest uppercase text-black transition-all group-hover:tracking-[0.25em]">Maddy</h1>
            <span className="text-xs tracking-[0.3em] uppercase text-zinc-500">Men's Clothing</span>
          </div>

          {/* Active Channels Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-500 uppercase">WhatsApp Sender:</span>
              <span className="font-bold text-black">{whatsappNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-zinc-500 uppercase">Cellular SMS Sender:</span>
              <span className="font-bold text-black">{smsNumber}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto px-6 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Registries (25%) */}
          <div className="lg:col-span-3 space-y-8">

            {/* 1. Client Registry */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold bg-black text-white px-2 py-1 shadow-md">01</span>
                <h2 className="text-base font-bold tracking-widest uppercase">Client Registry</h2>
              </div>

              <div className="p-8 border border-zinc-200 bg-zinc-50 shadow-sm hover:shadow-lg transition-all duration-500 space-y-6 hover:border-zinc-300 rounded-sm">
                <p className="text-sm text-zinc-500 uppercase tracking-wide leading-relaxed">
                  Master database. Synchronization appends to existing records.
                </p>
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCustomerFile(e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-zinc-500 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-black cursor-pointer file:shadow-md file:transition-all"
                    />
                  </div>
                  <button onClick={() => handleFileUpload('customers')} disabled={!customerFile} className="w-full py-3 border border-black hover:bg-black hover:text-white text-black text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                    Synchronize Database
                  </button>
                  {uploadStatus.customers && <p className="text-xs text-zinc-600 font-mono text-center tracking-widest animate-pulse">{uploadStatus.customers}</p>}
                </div>
              </div>
            </section>

            {/* 2. Communication Protocol */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold bg-black text-white px-2 py-1 shadow-md">02</span>
                <h2 className="text-base font-bold tracking-widest uppercase">Template Registry</h2>
              </div>

              <div className="p-8 border border-zinc-200 bg-zinc-50 shadow-sm hover:shadow-lg transition-all duration-500 space-y-6 hover:border-zinc-300 rounded-sm">

                <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <button onClick={() => setActiveTab('upload')} className={`text-xs uppercase font-bold tracking-widest pb-1 ${activeTab === 'upload' ? 'border-b-2 border-black' : 'text-zinc-400'}`}>Upload</button>
                  <button onClick={() => setActiveTab('edit')} className={`text-xs uppercase font-bold tracking-widest pb-1 ${activeTab === 'edit' ? 'border-b-2 border-black' : 'text-zinc-400'}`}>Edit Message</button>
                  <button onClick={() => setActiveTab('stats')} className={`text-xs uppercase font-bold tracking-widest pb-1 ${activeTab === 'stats' ? 'border-b-2 border-black' : 'text-zinc-400'}`}>System Status</button>
                </div>

                {activeTab === 'upload' ? (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <p className="text-sm text-zinc-500 uppercase tracking-wide leading-relaxed">
                      Upload JSON or CSV.
                      <br /><span className="text-xs text-zinc-400 normal-case">(JSON: {"{ 'Category': ['Msg1'] }"} | CSV: Gender, Message)</span>
                    </p>
                    <div className="relative group">
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={(e) => setTemplateFile(e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-zinc-500 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-black cursor-pointer file:shadow-md file:transition-all"
                      />
                    </div>
                    <button
                      onClick={handleTemplateUpload}
                      disabled={!templateFile}
                      className="w-full py-3 border border-black hover:bg-black hover:text-white text-black text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                      Update Protocols
                    </button>
                    {uploadStatus.templates && <p className="text-xs text-zinc-600 font-mono text-center tracking-widest animate-pulse">{uploadStatus.templates}</p>}
                  </div>
                ) : activeTab === 'edit' ? (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <textarea
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full h-32 px-3 py-2 text-sm font-mono bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none resize-none"
                      placeholder="Type your message template here..."
                    />
                    <div className="bg-zinc-50 border border-zinc-200 p-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-zinc-200 pb-1">Variable Mapping</h4>
                      <table className="w-full text-xs text-left">
                        <tbody className="font-mono text-zinc-600">
                          <tr><td className="py-1 pr-2">{"{{1}}"}</td><td>Customer Name</td></tr>
                          <tr><td className="py-1 pr-2">{"{{2}}"}</td><td>Offer Details</td></tr>
                          <tr><td className="py-1 pr-2">{"{{3}}"}</td><td>Offer Valid Until</td></tr>
                          <tr><td className="py-1 pr-2">{"{{care_number}}"}</td><td>Customer Care Number</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in duration-500">
                    {templateStats.length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-4">NO PROTOCOLS LOADED</p>
                    ) : (
                      templateStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
                          <span className="text-sm font-bold uppercase tracking-wider">{stat.category}</span>
                          <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded-full">{stat.count} active</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* MIDDLE COLUMN: Offer System & Parameters (25%) */}
          <div className="lg:col-span-3 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold bg-black text-white px-2 py-1">03</span>
                <h2 className="text-base font-bold tracking-widest uppercase">Priority Offer Alert System</h2>
              </div>

              <div className="space-y-6">

                {/* 1. Upload Offers */}
                <div className="p-8 border border-zinc-200 bg-zinc-50 shadow-sm hover:shadow-lg transition-all duration-500 space-y-6 hover:border-zinc-300 rounded-sm">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                    <div className="flex gap-4">
                      <button onClick={() => setOfferInputMode('upload')} className={`text-xs uppercase font-bold tracking-widest pb-1 ${offerInputMode === 'upload' ? 'border-b-2 border-black' : 'text-zinc-400'}`}>Upload</button>
                      <button onClick={() => setOfferInputMode('manual')} className={`text-xs uppercase font-bold tracking-widest pb-1 ${offerInputMode === 'manual' ? 'border-b-2 border-black' : 'text-zinc-400'}`}>Manual Entry</button>
                    </div>
                    {offers.length > 0 && <span className="text-xs bg-zinc-200 px-2 py-1 rounded-full text-zinc-600 font-mono">{offers.length} ACTIVE</span>}
                  </div>

                  {offerInputMode === 'upload' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="relative group">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setOfferFile(e.target.files ? e.target.files[0] : null)}
                          className="block w-full text-sm text-zinc-500 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-black cursor-pointer file:shadow-md file:transition-all"
                        />
                      </div>
                      <button onClick={() => handleFileUpload('offers')} disabled={!offerFile} className="w-full py-3 border border-black hover:bg-black hover:text-white text-black text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        Upload Assets
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Offer Code (e.g. SUMMER25)"
                          value={manualOffer.code}
                          onChange={(e) => setManualOffer({ ...manualOffer, code: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-zinc-200 text-sm py-3 px-4 focus:border-black focus:outline-none uppercase placeholder:text-zinc-300 font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Discount (e.g. 25% OFF)"
                          value={manualOffer.discount}
                          onChange={(e) => setManualOffer({ ...manualOffer, discount: e.target.value })}
                          className="w-full bg-white border border-zinc-200 text-sm py-3 px-4 focus:border-black focus:outline-none placeholder:text-zinc-300"
                        />
                        <input
                          type="text"
                          placeholder="Description (Optional)"
                          value={manualOffer.description}
                          onChange={(e) => setManualOffer({ ...manualOffer, description: e.target.value })}
                          className="w-full bg-white border border-zinc-200 text-sm py-3 px-4 focus:border-black focus:outline-none placeholder:text-zinc-300"
                        />
                      </div>
                      <button onClick={handleManualOfferAdd} disabled={!manualOffer.code || !manualOffer.discount} className="w-full py-3 border border-black hover:bg-black hover:text-white text-black text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        Add Offer
                      </button>
                    </div>
                  )}

                  {uploadStatus.offers && <p className="text-xs text-zinc-600 font-mono text-center tracking-widest">{uploadStatus.offers}</p>}
                </div>

                {/* 2. Settings & Targeting */}
                <div className="p-8 border border-zinc-200 bg-zinc-50 shadow-sm hover:shadow-lg transition-all duration-500 space-y-6 hover:border-zinc-300 rounded-sm">
                  <h3 className="text-sm font-bold uppercase text-zinc-400">Parameters</h3>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="CAMPAIGN IDENTIFIER"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-200 text-sm py-2 focus:border-black focus:outline-none placeholder:text-zinc-300 uppercase font-bold"
                      />
                    </div>

                    {/* Delivery Platform Selector */}
                    <div>
                      <span className="text-xs uppercase text-zinc-500 font-bold block mb-1">Dispatch Platforms</span>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-200 p-1 rounded-sm text-center">
                        <button
                          type="button"
                          onClick={() => { setPlatform('both'); handleSaveCareSettings(undefined, undefined, 'both'); }}
                          className={`py-1.5 text-xs font-bold uppercase transition-all ${platform === 'both' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'}`}>
                          Both (SMS + WA)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPlatform('whatsapp'); handleSaveCareSettings(undefined, undefined, 'whatsapp'); }}
                          className={`py-1.5 text-xs font-bold uppercase transition-all ${platform === 'whatsapp' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'}`}>
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPlatform('sms'); handleSaveCareSettings(undefined, undefined, 'sms'); }}
                          className={`py-1.5 text-xs font-bold uppercase transition-all ${platform === 'sms' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'}`}>
                          Cellular SMS
                        </button>
                      </div>
                    </div>

                    <div>
                      <select
                        value={targetAudience}
                        onChange={e => setTargetAudience(e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-200 text-sm py-2 focus:border-black focus:outline-none uppercase font-bold cursor-pointer appearance-none text-zinc-800"
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
                      <span className="text-xs uppercase text-zinc-400 block mb-1">Expiration</span>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={e => setValidUntil(e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-200 text-sm py-2 focus:border-black focus:outline-none uppercase font-mono"
                      />
                    </div>

                    {/* Customer Care Section */}
                    <div className="pt-4 border-t border-zinc-200 space-y-3">
                      <div>
                        <span className="text-xs uppercase text-zinc-500 font-bold block mb-1">Customer Care Number (Receives Copy)</span>
                        <input
                          type="text"
                          placeholder="+919363341709"
                          value={customerCareNumber}
                          onChange={e => setCustomerCareNumber(e.target.value)}
                          onBlur={() => handleSaveCareSettings(customerCareNumber, sendToCustomerCare, platform)}
                          className="w-full bg-white border border-zinc-300 text-sm py-2 px-3 focus:border-black focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex items-start gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="careCheckbox"
                          checked={sendToCustomerCare}
                          onChange={e => {
                            setSendToCustomerCare(e.target.checked);
                            handleSaveCareSettings(customerCareNumber, e.target.checked, platform);
                          }}
                          className="mt-0.5 accent-black cursor-pointer"
                        />
                        <label htmlFor="careCheckbox" className="text-xs uppercase font-bold tracking-wide text-zinc-700 cursor-pointer">
                          Also send copy to Customer Care across {platform === 'both' ? 'both platforms' : platform}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Deployment & Single Message Test (50%) */}
          <div className="lg:col-span-6 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold bg-black text-white px-2 py-1">04</span>
                <h2 className="text-base font-bold tracking-widest uppercase">Live Deployment & Single Message Test</h2>
              </div>

              <div className="p-8 border border-zinc-900 bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 z-10 pointer-events-none">
                  <h1 className="text-8xl font-serif">M</h1>
                </div>

                <div className="space-y-8">
                  <MessagePreview
                    template={template}
                    offerDetails="Summer Collection Special\nGet 25% OFF using ID: *SUMMER25*"
                    validUntil={validUntil}
                    name="Akash"
                    careNumber={customerCareNumber}
                    platform={platform}
                  />

                  {/* SINGLE MESSAGE TEST BOX (Preserves Quota: 1 Message Only) */}
                  <div className="p-5 border-2 border-black bg-zinc-50 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-widest text-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                        Test With Single Message (1 Recipient)
                      </span>
                      <span className="text-[10px] uppercase font-mono bg-zinc-200 px-2 py-0.5 rounded text-zinc-700 font-bold">
                        Saves Quota
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={singleRecipient}
                        onChange={e => setSingleRecipient(e.target.value)}
                        placeholder="+919363341709"
                        className="flex-1 bg-white border border-zinc-300 text-xs py-2.5 px-3 focus:border-black focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSendSingleMessage}
                        disabled={!singleRecipient || singleStatus.includes('DISPATCHING')}
                        className="py-2.5 px-6 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2">
                        <span>{singleStatus.includes('DISPATCHING') ? 'Sending...' : 'Send Single Message'}</span>
                        <span>→</span>
                      </button>
                    </div>

                    {singleStatus && (
                      <div className="space-y-1.5 pt-1">
                        <p className={`text-xs font-mono tracking-wider ${singleStatus.startsWith('✅') || singleStatus.includes('Delivered') ? 'text-green-700 font-bold' : 'text-red-600'}`}>
                          {singleStatus}
                        </p>
                        {singleDetails && (
                          <div className="bg-white p-3 text-[11px] font-mono rounded space-y-1.5 text-zinc-700 border border-zinc-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">💬 WhatsApp:</span>
                              <span className={singleDetails.whatsapp?.sent ? 'text-green-600 font-bold' : 'text-red-500'}>
                                {singleDetails.whatsapp?.sent ? `✓ Delivered (${singleDetails.whatsapp.sid.substring(0, 10)}...)` : `Failed (${singleDetails.whatsapp?.error?.substring(0, 30)}...)`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">📱 Cellular SMS:</span>
                              <span className={singleDetails.sms?.sent ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>
                                {singleDetails.sms?.sent ? `✓ Delivered (${singleDetails.sms.sid.substring(0, 10)}...)` : `Trial Requirement: ${singleDetails.sms?.error?.substring(0, 35)}...`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FULL CAMPAIGN BROADCAST SECTION */}
                  <div className="pt-4 border-t border-zinc-200 flex flex-col gap-4">
                    <div className="text-right">
                      <span className="text-xs uppercase text-zinc-400 tracking-widest block mb-1">Time Delay</span>
                      <input type="range" min="0" max="24" step="1" className="w-full accent-black h-1 bg-zinc-200 appearance-none" value={scheduleDelay} onChange={e => setScheduleDelay(Number(e.target.value))} />
                      <span className="text-sm font-mono">{scheduleDelay} HOURS</span>
                    </div>

                    <button
                      onClick={startCampaign}
                      className="py-4 border-2 border-zinc-900 bg-white hover:bg-black hover:text-white text-zinc-900 text-sm font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 group">
                      <span>Broadcast Full Campaign ({platform === 'both' ? 'SMS + WhatsApp' : platform.toUpperCase()})</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>

                {/* Monitor Overlay */}
                {activeCampaign && (
                  <div className="mt-8 border-t border-zinc-100 pt-6">
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-sm font-bold uppercase tracking-widest">
                        System Status: <span className={activeCampaign.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}>{activeCampaign.status.replace('_', ' ')}</span>
                        <span className="ml-2 text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 font-mono">
                          {activeCampaign.platform === 'both' ? 'Dual: SMS + WhatsApp' : activeCampaign.platform?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-5xl font-serif">
                        {activeCampaign.total > 0 ? Math.round((activeCampaign.sent / activeCampaign.total) * 100) : 0}<span className="text-lg align-top text-zinc-400">%</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-100 h-1">
                      <div
                        className="bg-black h-1 transition-all duration-500"
                        style={{ width: `${activeCampaign.total > 0 ? (activeCampaign.sent / activeCampaign.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-zinc-400 uppercase tracking-widest">
                      <span>Dispatched: {activeCampaign.sent}</span>
                      <span>Target: {activeCampaign.total}</span>
                    </div>
                    {activeCampaign.sendToCustomerCare && (
                      <div className="mt-2 text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                        <span className="text-green-600">✓</span>
                        <span>Customer Care Copy: Dispatched to {activeCampaign.customerCareNumber || customerCareNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Designed for Maddy Men's Clothing</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
