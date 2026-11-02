import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  Bell,
  Send,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Palette,
  Layers
} from 'lucide-react';
import { toast } from '../services/toast';

interface ColorSwatch {
  role: string;
  hex: string;
  purpose: string;
  textColor: string;
  borderColor?: string;
}

// 1. Foundational Brand Colors (Preserved Documentation)
const LIGHT_BRAND_PALETTE: ColorSwatch[] = [
  {
    role: 'Primary',
    hex: '#0000FF',
    purpose: 'Foundational primary action and accent',
    textColor: '#FFFFFF'
  },
  {
    role: 'Secondary',
    hex: '#8FBC8B',
    purpose: 'Supporting accents and success status',
    textColor: '#000000'
  },
  {
    role: 'Highlight',
    hex: '#FF9D00',
    purpose: 'Important actions, emphasis and attention',
    textColor: '#000000'
  },
  {
    role: 'Danger',
    hex: '#ED2939',
    purpose: 'Errors, destructive actions and critical status',
    textColor: '#FFFFFF'
  },
  {
    role: 'Background',
    hex: '#FFFFFF',
    purpose: 'Foundational application canvas',
    textColor: '#000000',
    borderColor: '#E4E8E4'
  },
  {
    role: 'Text',
    hex: '#000000',
    purpose: 'Primary typography',
    textColor: '#FFFFFF'
  }
];

const DARK_BRAND_PALETTE: ColorSwatch[] = [
  {
    role: 'Primary',
    hex: '#0000FF',
    purpose: 'Foundational primary action and accent',
    textColor: '#FFFFFF'
  },
  {
    role: 'Secondary',
    hex: '#C0C0C0',
    purpose: 'Secondary text and neutral supporting elements',
    textColor: '#000000'
  },
  {
    role: 'Highlight',
    hex: '#FF5F1F',
    purpose: 'Important actions and neon orange emphasis',
    textColor: '#FFFFFF'
  },
  {
    role: 'Success',
    hex: '#17B169',
    purpose: 'Successful operations and verified delivery',
    textColor: '#FFFFFF'
  },
  {
    role: 'Danger',
    hex: '#FF0000',
    purpose: 'Errors and destructive actions',
    textColor: '#FFFFFF'
  },
  {
    role: 'Background',
    hex: '#000000',
    purpose: 'Foundational midnight canvas',
    textColor: '#FFFFFF',
    borderColor: '#303030'
  }
];

// 2. Refined Presentation Tokens (Phase 20.4 Live Rendered UI System)
const REFINED_LIGHT_TOKENS: ColorSwatch[] = [
  { role: 'Primary', hex: '#3448B8', purpose: 'Primary buttons, active nav, brand accents', textColor: '#FFFFFF' },
  { role: 'Primary Hover', hex: '#293A9C', purpose: 'Button hover, pressed interactive states', textColor: '#FFFFFF' },
  { role: 'Main Background', hex: '#F3F5F8', purpose: 'Global application canvas surface', textColor: '#202638', borderColor: '#E1E5EC' },
  { role: 'Secondary Background', hex: '#EDF0F5', purpose: 'Metric card insets, secondary surfaces', textColor: '#202638', borderColor: '#E1E5EC' },
  { role: 'Card Surface', hex: '#FFFFFF', purpose: 'Elevated card containers and panels', textColor: '#202638', borderColor: '#E1E5EC' },
  { role: 'Soft Primary Surface', hex: '#E9EDFF', purpose: 'Active navigation pill, icon badges', textColor: '#3448B8', borderColor: '#E1E5EC' },
  { role: 'Secondary Accent', hex: '#8FBC8B', purpose: 'Supporting secondary accents', textColor: '#000000' },
  { role: 'Success', hex: '#5D9664', purpose: 'Delivery confirmations and health badges', textColor: '#FFFFFF' },
  { role: 'Warning', hex: '#FF9D00', purpose: 'Attention alerts, queued jobs, retries', textColor: '#FFFFFF' },
  { role: 'Danger', hex: '#ED2939', purpose: 'Errors, failed messages, opt-out suppression', textColor: '#FFFFFF' },
  { role: 'Primary Text', hex: '#202638', purpose: 'High-contrast typography headers and values', textColor: '#FFFFFF' },
  { role: 'Secondary Text', hex: '#697386', purpose: 'Sub-headers, timestamps, label captions', textColor: '#FFFFFF' },
  { role: 'Border', hex: '#E1E5EC', purpose: 'Card borders, table dividers, input boundaries', textColor: '#202638', borderColor: '#C8CCD6' }
];

const REFINED_DARK_TOKENS: ColorSwatch[] = [
  { role: 'Primary', hex: '#6479F0', purpose: 'Primary buttons, links, active accents', textColor: '#FFFFFF' },
  { role: 'Primary Hover', hex: '#8292FF', purpose: 'Interactive hover & focus states', textColor: '#000000' },
  { role: 'Main Background', hex: '#111318', purpose: 'Deep nocturnal canvas backdrop', textColor: '#E6E9F0', borderColor: '#303744' },
  { role: 'Secondary Background', hex: '#171A21', purpose: 'Inset panels, secondary surfaces', textColor: '#E6E9F0', borderColor: '#303744' },
  { role: 'Card Surface', hex: '#1B1F27', purpose: 'Elevated card containers and widgets', textColor: '#E6E9F0', borderColor: '#303744' },
  { role: 'Elevated Surface', hex: '#242A35', purpose: 'Modal panels, row hovers, elevated cards', textColor: '#E6E9F0', borderColor: '#303744' },
  { role: 'Soft Primary Surface', hex: '#242B45', purpose: 'Active navigation, primary icon badges', textColor: '#8292FF', borderColor: '#303744' },
  { role: 'Secondary Accent', hex: '#C0C0C0', purpose: 'Silver Grey supporting accents & borders', textColor: '#000000' },
  { role: 'Success', hex: '#17B169', purpose: 'Delivery confirmations & connected health', textColor: '#FFFFFF' },
  { role: 'Warning', hex: '#FF5F1F', purpose: 'Neon Orange alerts, paused queues, retries', textColor: '#FFFFFF' },
  { role: 'Danger', hex: '#FF0000', purpose: 'Errors, destructive actions, failed dispatches', textColor: '#FFFFFF' },
  { role: 'Primary Text', hex: '#E6E9F0', purpose: 'High-contrast crisp white typography', textColor: '#111318' },
  { role: 'Secondary Text', hex: '#A5ADBA', purpose: 'Subdued labels, timestamps, metadata', textColor: '#111318' },
  { role: 'Border', hex: '#303744', purpose: 'Card dividers, input borders, structure', textColor: '#E6E9F0', borderColor: '#454E5F' }
];

export const AppearanceBranding: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const handleCopyHex = (hex: string, role: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`Copied ${hex}`, {
      description: `${role} token copied to clipboard.`
    });
    setTimeout(() => {
      setCopiedHex((curr) => (curr === hex ? null : curr));
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                ENTERPRISE BRAND & REFINED PRESENTATION SYSTEM
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-3xl leading-relaxed">
              SMS Campaign System v2.6 utilizes a two-tier color architecture: <strong>Foundational Brand Palettes</strong> define our authentic corporate color identity, while <strong>Refined Presentation Tokens</strong> are calibrated for the rendered UI to ensure optimal surface differentiation, WCAG AA accessibility, and enterprise SaaS elegance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            <span>Phase 20.4 Verified Architecture</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: REFINED PRESENTATION TOKENS (LIVE UI) */}
      <div className="space-y-6">
        <div className="border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shadow-2xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Refined Presentation Tokens (Rendered UI System)
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                These design shades are actively rendered across all 13 modules, ensuring distinct card elevation against backgrounds and accessible contrast.
              </p>
            </div>
          </div>
        </div>

        {/* Refined Light Theme */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Sun className="w-3.5 h-3.5 text-[#3448B8]" />
              <span>Refined Light Theme (13 Tokens)</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E9EDFF] text-[#3448B8]">
              Primary: #3448B8 · Canvas: #F3F5F8
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {REFINED_LIGHT_TOKENS.map((item) => {
              const isCopied = copiedHex === item.hex;
              return (
                <div
                  key={item.role}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className="w-full h-14 rounded-lg shadow-inner mb-2 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                      style={{
                        backgroundColor: item.hex,
                        border: item.borderColor ? `1px solid ${item.borderColor}` : undefined
                      }}
                    >
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs"
                        style={{
                          color: item.textColor,
                          backgroundColor: 'rgba(0,0,0,0.35)'
                        }}
                      >
                        {item.hex}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[var(--color-text-primary)] truncate">
                        {item.role}
                      </div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2 min-h-[28px]">
                        {item.purpose}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyHex(item.hex, `Refined Light ${item.role}`)}
                    className="mt-2 w-full py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-[#5D9664]" /> : <Copy className="w-3 h-3 text-[var(--color-text-secondary)]" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refined Dark Theme */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Moon className="w-3.5 h-3.5 text-[#6479F0]" />
              <span>Refined Dark Theme (14 Tokens)</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#242B45] text-[#8292FF]">
              Primary: #6479F0 · Canvas: #111318
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {REFINED_DARK_TOKENS.map((item) => {
              const isCopied = copiedHex === item.hex;
              return (
                <div
                  key={item.role}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className="w-full h-14 rounded-lg shadow-inner mb-2 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                      style={{
                        backgroundColor: item.hex,
                        border: item.borderColor ? `1px solid ${item.borderColor}` : undefined
                      }}
                    >
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs"
                        style={{
                          color: item.textColor,
                          backgroundColor: 'rgba(0,0,0,0.35)'
                        }}
                      >
                        {item.hex}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[var(--color-text-primary)] truncate">
                        {item.role}
                      </div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2 min-h-[28px]">
                        {item.purpose}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyHex(item.hex, `Refined Dark ${item.role}`)}
                    className="mt-2 w-full py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-[#17B169]" /> : <Copy className="w-3 h-3 text-[var(--color-text-secondary)]" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: FOUNDATIONAL BRAND PALETTES (DOCUMENTED PRESERVATION) */}
      <div className="space-y-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Foundational Brand Color Palettes (Preserved Documentation)
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                The authentic 6-token foundational brand systems established in Phase 20.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            Foundational Spec
          </span>
        </div>

        {/* Light Brand Spec */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-[#0000FF]" />
            <span>Foundational Light Brand Tokens (#FFFFFF, #8FBC8B, #0000FF, #ED2939, #FF9D00, #000000)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {LIGHT_BRAND_PALETTE.map((item) => (
              <div
                key={item.role}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-full h-12 rounded-lg shadow-inner mb-2 flex items-center justify-center"
                    style={{ backgroundColor: item.hex, border: item.borderColor ? `1px solid ${item.borderColor}` : undefined }}
                  >
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">
                      {item.hex}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">{item.role}</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">{item.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dark Brand Spec */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Foundational Dark Brand Tokens (#000000, #C0C0C0, #17B169, #0000FF, #FF0000, #FF5F1F)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DARK_BRAND_PALETTE.map((item) => (
              <div
                key={item.role}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-full h-12 rounded-lg shadow-inner mb-2 flex items-center justify-center"
                    style={{ backgroundColor: item.hex, border: item.borderColor ? `1px solid ${item.borderColor}` : undefined }}
                  >
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">
                      {item.hex}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">{item.role}</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">{item.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: LIVE THEME COMPONENT PREVIEW */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Interactive Component Preview (Live Presentation Tokens)
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Test actual UI elements rendered live using the refined presentation tokens of either theme.
            </p>
          </div>

          {/* Theme Preview Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setPreviewTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewTheme === 'light'
                  ? 'bg-white text-[#3448B8] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#3448B8]" />
              <span>Light Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewTheme === 'dark'
                  ? 'bg-[#1B1F27] text-[#8292FF] border border-[#303744] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[#8292FF]" />
              <span>Dark Preview</span>
            </button>
          </div>
        </div>

        {/* Dynamic Preview Container */}
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
            previewTheme === 'dark'
              ? 'bg-[#111318] border-[#303744] text-[#E6E9F0]'
              : 'bg-[#F3F5F8] border-[#E1E5EC] text-[#202638] shadow-sm'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Buttons & Actions */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC]'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                Buttons & Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Primary Button */}
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-xs cursor-pointer transition-transform active:scale-95"
                  style={{ backgroundColor: previewTheme === 'dark' ? '#6479F0' : '#3448B8' }}
                >
                  Primary Action
                </button>

                {/* Secondary Button */}
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-transform active:scale-95"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#C0C0C0' : '#8FBC8B',
                    color: '#000000'
                  }}
                >
                  Secondary Action
                </button>

                {/* Highlight Action */}
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-transform active:scale-95"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#FF5F1F' : '#FF9D00',
                    color: '#FFFFFF'
                  }}
                >
                  Highlight Action
                </button>
              </div>
            </div>

            {/* 2. Status Badges & Indicators */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC]'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                Status Badges & Pills
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Success Badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#0D261A' : '#EDF6EE',
                    color: previewTheme === 'dark' ? '#34D399' : '#28542E',
                    border: `1px solid ${previewTheme === 'dark' ? '#17B169' : '#5D9664'}`
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  E.164 Verified
                </span>

                {/* Danger Badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#330A0A' : '#FDF1F2',
                    color: previewTheme === 'dark' ? '#F87171' : '#ED2939',
                    border: `1px solid ${previewTheme === 'dark' ? '#FF0000' : '#ED2939'}`
                  }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Opt-Out Suppressed
                </span>

                {/* Attention Pill */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#331505' : '#FFF8EB',
                    color: previewTheme === 'dark' ? '#FB923C' : '#9A5A00',
                    border: `1px solid ${previewTheme === 'dark' ? '#FF5F1F' : '#FF9D00'}`
                  }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Queue Paused
                </span>
              </div>
            </div>

            {/* 3. KPI Metric Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-70">Total Deliveries</span>
                <span
                  className="p-1.5 rounded-lg"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#242B45' : '#E9EDFF',
                    color: previewTheme === 'dark' ? '#8292FF' : '#3448B8'
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono">98.4%</div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: previewTheme === 'dark' ? '#17B169' : '#5D9664' }}
                >
                  <span>▲ +3.2% vs last cycle</span>
                </div>
              </div>
              <div className="text-[10px] opacity-60">Verified across 1,240 dispatches</div>
            </div>

            {/* 4. Form Field & Input */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC]'
              }`}
            >
              <label className="text-xs font-bold block">
                Sender Line Header <span style={{ color: previewTheme === 'dark' ? '#8292FF' : '#3448B8' }}>*</span>
              </label>
              <input
                type="text"
                readOnly
                value="+1 (220) 240-4020"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none"
                style={{
                  backgroundColor: previewTheme === 'dark' ? '#15181F' : '#FFFFFF',
                  borderColor: previewTheme === 'dark' ? '#303744' : '#E1E5EC',
                  color: previewTheme === 'dark' ? '#E6E9F0' : '#202638'
                }}
              />
              <span className="text-[10px] opacity-60 block">E.164 normalized telephony route</span>
            </div>

            {/* 5. Navigation Active State */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC]'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                Navigation Active State
              </div>
              <div
                className="px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold shadow-2xs"
                style={{
                  backgroundColor: previewTheme === 'dark' ? '#242B45' : '#E9EDFF',
                  color: previewTheme === 'dark' ? '#8292FF' : '#3448B8',
                  border: previewTheme === 'dark' ? '1px solid #303744' : '1px solid #E1E5EC'
                }}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Campaign Console</span>
                </div>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-mono text-white"
                  style={{ backgroundColor: previewTheme === 'dark' ? '#6479F0' : '#3448B8' }}
                >
                  Active
                </span>
              </div>
            </div>

            {/* 6. In-App Notification Card */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" style={{ color: previewTheme === 'dark' ? '#8292FF' : '#3448B8' }} />
                  <span className="text-xs font-bold">Broadcast Dispatch Complete</span>
                </div>
                <span className="text-[10px] opacity-60">2m ago</span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Batch broadcast of 152 promotional SMS/WhatsApp messages enqueued and sent.
              </p>
              <div
                className="text-[10px] font-bold font-mono"
                style={{ color: previewTheme === 'dark' ? '#17B169' : '#5D9664' }}
              >
                STATUS: DISPATCH_SUCCESS ✓
              </div>
            </div>

            {/* 7. Chart Legend */}
            <div
              className={`p-4 rounded-xl border md:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-4 ${
                previewTheme === 'dark' ? 'bg-[#1B1F27] border-[#303744]' : 'bg-[#FFFFFF] border-[#E1E5EC]'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Telemetry Chart Legend</span>
                <span className="text-[10px] opacity-60">Visual categorical breakdown mapped to refined tokens</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: previewTheme === 'dark' ? '#6479F0' : '#3448B8' }} />
                  <span>Dispatched <strong className="font-mono">(1,240)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: previewTheme === 'dark' ? '#17B169' : '#5D9664' }}
                  />
                  <span>Delivered <strong className="font-mono">(1,198)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: previewTheme === 'dark' ? '#FF5F1F' : '#FF9D00' }}
                  />
                  <span>Pending <strong className="font-mono">(42)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: previewTheme === 'dark' ? '#FF0000' : '#ED2939' }}
                  />
                  <span>Failed / Suppressed <strong className="font-mono">(0)</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
