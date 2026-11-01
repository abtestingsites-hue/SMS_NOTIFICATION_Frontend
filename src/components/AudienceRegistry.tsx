import React, { useState, useEffect, useId, useMemo } from 'react';
import type { Customer } from '../types';
import { api } from '../services/api';
import { toast } from '../services/toast';
import { SearchInput } from './ui/SearchInput';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AudienceRegistryProps {
  audienceCount: number;
  onUploadCsv: (file: File) => Promise<{ count: number }>;
}

export const AudienceRegistry: React.FC<AudienceRegistryProps> = ({
  audienceCount: initialAudienceCount,
  onUploadCsv
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<'All' | 'Men' | 'Women' | 'Boys' | 'Girls'>('All');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppressedPhones, setSuppressedPhones] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const fileInputId = useId();

  const fetchAudience = async () => {
    setIsLoading(true);
    try {
      const [custList, suppList] = await Promise.all([
        api.getCustomers().catch(() => []),
        fetch('/api/governance/suppression').then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(custList) && custList.length > 0) {
        setCustomers(custList);
      } else {
        // Fallback demo records if empty
        setCustomers([
          { id: 1, phone: '+919363341709', name: 'Akash Sundar', gender: 'Men', age: 28 },
          { id: 2, phone: '+919876543210', name: 'Priya Sharma', gender: 'Women', age: 32 },
          { id: 3, phone: '+17372508034', name: 'David Miller', gender: 'Men', age: 41 },
          { id: 4, phone: '+919840123456', name: 'Ananya Rao', gender: 'Women', age: 24 }
        ]);
      }

      if (Array.isArray(suppList)) {
        const phoneSet = new Set<string>(suppList.map((s: any) => s.recipient || s.phone));
        setSuppressedPhones(phoneSet);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudience();
  }, []);

  const handleProcessUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await onUploadCsv(file);
      toast.success('Audience Ingested', {
        description: `Successfully ingested ${res.count} audience records into registry.`
      });
      setFile(null);
      await fetchAudience();
    } catch (err: any) {
      toast.error('Audience Ingestion Failed', { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  // Demographic Segmentation Analytics
  const segmentStats = useMemo(() => {
    let men = 0;
    let women = 0;
    let other = 0;
    let suppressedCount = 0;

    customers.forEach(c => {
      const g = (c.gender || '').toLowerCase();
      if (g === 'men' || g === 'male') men++;
      else if (g === 'women' || g === 'female') women++;
      else other++;

      if (suppressedPhones.has(c.phone)) suppressedCount++;
    });

    const total = customers.length || initialAudienceCount || 1;
    const activeReach = Math.max(0, total - suppressedCount);

    return {
      total,
      men,
      women,
      other,
      suppressedCount,
      activeReach,
      activeRate: Math.round((activeReach / total) * 100)
    };
  }, [customers, suppressedPhones, initialAudienceCount]);

  const filtered = customers.filter(c => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search);
    const g = (c.gender || '').toLowerCase();
    const matchesSegment =
      segment === 'All' ||
      (segment === 'Men' && (g === 'men' || g === 'male')) ||
      (segment === 'Women' && (g === 'women' || g === 'female')) ||
      g === segment.toLowerCase();
    return matchesSearch && matchesSegment;
  });

  const handleExportCsv = () => {
    const header = 'Phone,Name,Gender,Age\n';
    const rows = filtered.map(c => `"${c.phone}","${c.name}","${c.gender}","${c.age || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audience_export_${segment.toLowerCase()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Contextual Audience Analytics KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Total Registry Profiles</span>
            <Users className="w-3.5 h-3.5 text-[#5269D9]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">{segmentStats.total.toLocaleString()}</div>
          <span className="text-[10px] text-[#5269D9] font-medium">Verified Phone Numbers</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Active Deliverable Base</span>
            <Smartphone className="w-3.5 h-3.5 text-[#16A36A]" />
          </div>
          <div className="text-lg font-bold text-[#16A36A] mt-1">{segmentStats.activeReach.toLocaleString()}</div>
          <span className="text-[10px] text-[#16A36A] font-semibold">{segmentStats.activeRate}% reachable</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Audience Demographics</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#4388D8]" />
          </div>
          <div className="text-lg font-bold text-[#20283A] mt-1">{segmentStats.men}M · {segmentStats.women}W</div>
          <span className="text-[10px] text-[#737D90]">Segment breakdown</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAF0] p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#737D90]">Suppression / Opt-Outs</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#E5A23B]" />
          </div>
          <div className="text-lg font-bold text-[#E5A23B] mt-1">{segmentStats.suppressedCount}</div>
          <span className="text-[10px] text-[#737D90]">STOP / Anti-fatigue safe</span>
        </div>
      </div>

      {/* Ingestion & Schema Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CSV Dropzone (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#20283A]">Ingest Audience CSV</h3>
              <p className="text-xs text-[#737D90]">Import customer records with demographic attributes</p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-[#5269D9]" />
          </div>

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-[#E8EAF0] hover:border-[#5269D9] bg-[#F7F8FC] rounded-xl p-5 text-center transition-all cursor-pointer"
          >
            <input
              id={fileInputId}
              type="file"
              accept=".csv"
              onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor={fileInputId} className="cursor-pointer space-y-2 block">
              <div className="w-9 h-9 rounded-full bg-[#EEF1FC] text-[#5269D9] flex items-center justify-center mx-auto">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#20283A]">Click to upload or drag & drop</p>
                <p className="text-[11px] text-[#737D90]">Strict CSV formats: Phone, Name, Gender, Age</p>
              </div>
              {file && (
                <div className="inline-flex items-center gap-1.5 bg-white border border-[#E8EAF0] px-3 py-1 rounded-lg text-xs font-semibold text-[#5269D9]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>{file.name}</span>
                </div>
              )}
            </label>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#737D90]">Maximum batch: 50,000 rows</span>
            <button
              onClick={handleProcessUpload}
              disabled={!file || isUploading}
              className="bg-[#5269D9] hover:bg-[#4056C4] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
            >
              {isUploading ? 'Ingesting Batch...' : 'Process Ingestion'}
            </button>
          </div>
        </div>

        {/* Schema Guide (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-[#E8EAF0] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#20283A]">Standard Customer Schema</h3>
                <p className="text-xs text-[#737D90]">Headers must match one of the recognized key variations</p>
              </div>
              <button
                onClick={fetchAudience}
                disabled={isLoading}
                className="text-xs text-[#737D90] hover:text-[#5269D9] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8EAF0] text-[#737D90]">
                    <th className="py-2 px-2.5 font-semibold">Column</th>
                    <th className="py-2 px-2.5 font-semibold">Accepted Aliases</th>
                    <th className="py-2 px-2.5 font-semibold">Example Value</th>
                    <th className="py-2 px-2.5 font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EAF0] text-[#20283A]">
                  <tr>
                    <td className="py-2 px-2.5 font-mono font-semibold text-[#5269D9]">Phone</td>
                    <td className="py-2 px-2.5 text-[#737D90]">phone, Phone, mobile, Mobile</td>
                    <td className="py-2 px-2.5 font-mono text-[11px]">+17372508034</td>
                    <td className="py-2 px-2.5 font-bold text-[#16A36A]">YES</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-mono font-semibold text-[#5269D9]">Name</td>
                    <td className="py-2 px-2.5 text-[#737D90]">name, Name, customer_name</td>
                    <td className="py-2 px-2.5">Arjun Kumar</td>
                    <td className="py-2 px-2.5 text-[#737D90]">Optional</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-mono font-semibold text-[#5269D9]">Gender</td>
                    <td className="py-2 px-2.5 text-[#737D90]">gender, Gender, sex, category</td>
                    <td className="py-2 px-2.5">Men / Women</td>
                    <td className="py-2 px-2.5 text-[#737D90]">Optional</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-mono font-semibold text-[#5269D9]">Age</td>
                    <td className="py-2 px-2.5 text-[#737D90]">age, Age, customer_age</td>
                    <td className="py-2 px-2.5">28</td>
                    <td className="py-2 px-2.5 text-[#737D90]">Optional</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#EEF1FC] p-3 rounded-xl border border-[#D9E0F8] text-xs text-[#5269D9] mt-3 flex items-center justify-between">
            <span className="font-medium">Telephony numbers are normalized to E.164 country standards.</span>
            <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded shadow-2xs">E.164 Ready</span>
          </div>
        </div>
      </div>

      {/* Main Customer Registry Data Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EAF0] pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#20283A]">Audience Directory</h3>
            <p className="text-xs text-[#737D90]">Manage profile status, suppression compliance, and targeting tags</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Demographic Segmentation Filter */}
            <div className="inline-flex items-center bg-[#F7F8FC] p-0.5 rounded-lg border border-[#E8EAF0]">
              {(['All', 'Men', 'Women'] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setSegment(seg)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    segment === seg
                      ? 'bg-white text-[#5269D9] shadow-2xs'
                      : 'text-[#737D90] hover:text-[#20283A]'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name or number..."
              className="w-56"
            />

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EAF0] text-xs font-semibold text-[#20283A] hover:bg-[#F7F8FC] cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#737D90]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8EAF0] text-[#737D90] font-semibold text-[11px]">
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Phone Number</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Age</th>
                <th className="py-2.5 px-3">Delivery Status</th>
                <th className="py-2.5 px-3 text-right">Last Contacted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#737D90] text-xs">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isSuppressed = suppressedPhones.has(c.phone);
                  return (
                    <tr key={c.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#20283A]">{c.name}</td>
                      <td className="py-3 px-3 font-mono font-medium text-[#20283A]">{c.phone}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.gender?.toLowerCase() === 'women' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-[#5269D9]'
                        }`}>
                          {c.gender || 'Men'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#737D90]">{c.age || '—'}</td>
                      <td className="py-3 px-3">
                        {isSuppressed ? (
                          <span className="inline-flex items-center gap-1 bg-[#FDF0F1] text-[#D94D59] border border-[#F9CFD3] px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3" /> Suppressed (STOP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[#E8F7F0] text-[#16A36A] border border-[#C8EEDC] px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Reachable
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#737D90] text-[11px]">
                        {c.lastContacted ? new Date(c.lastContacted).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
