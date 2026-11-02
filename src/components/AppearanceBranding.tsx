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
  AlertCircle
} from 'lucide-react';
import { toast } from '../services/toast';

interface ColorSwatch {
  role: string;
  hex: string;
  purpose: string;
  textColor: string;
  borderColor?: string;
}

const LIGHT_PALETTE: ColorSwatch[] = [
  {
    role: 'Primary',
    hex: '#0000FF',
    purpose: 'Primary buttons, links, active navigation',
    textColor: '#FFFFFF'
  },
  {
    role: 'Secondary',
    hex: '#8FBC8B',
    purpose: 'Supporting accents and success-related elements',
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
    purpose: 'Main application background',
    textColor: '#000000',
    borderColor: '#E5E7EB'
  },
  {
    role: 'Text',
    hex: '#000000',
    purpose: 'Primary typography',
    textColor: '#FFFFFF'
  }
];

const DARK_PALETTE: ColorSwatch[] = [
  {
    role: 'Primary',
    hex: '#0000FF',
    purpose: 'Primary buttons, links, active navigation',
    textColor: '#FFFFFF'
  },
  {
    role: 'Secondary',
    hex: '#C0C0C0',
    purpose: 'Secondary text, supporting elements and borders',
    textColor: '#000000'
  },
  {
    role: 'Highlight',
    hex: '#FF5F1F',
    purpose: 'Important actions and visual emphasis',
    textColor: '#FFFFFF'
  },
  {
    role: 'Success',
    hex: '#17B169',
    purpose: 'Successful operations and confirmation',
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
    purpose: 'Main application background',
    textColor: '#FFFFFF',
    borderColor: '#2E323D'
  }
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
                BRAND COLOR PALETTE
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-2xl">
              Visual presentation of the enterprise design system. Each color token is mapped to semantic variables ensuring application-wide visual consistency, predictable UI hierarchy, and full WCAG AA contrast compliance across both Light and Dark themes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[#0000FF]" />
            <span>12 Brand Tokens Standardized</span>
          </div>
        </div>
      </div>

      {/* SECTION A: LIGHT THEME PALETTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EBF0FF] text-[#0000FF] flex items-center justify-center shadow-2xs">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Light Theme Palette
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                High-clarity daylight operations with pure white canvas and royal blue accents.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            6 Semantic Roles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {LIGHT_PALETTE.map((item) => {
            const isCopied = copiedHex === item.hex;
            return (
              <div
                key={item.role}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Swatch Display */}
                  <div
                    className="w-full h-20 rounded-lg shadow-inner mb-3 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: item.hex,
                      border: item.borderColor ? `1px solid ${item.borderColor}` : undefined
                    }}
                  >
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded shadow-2xs"
                      style={{
                        color: item.textColor,
                        backgroundColor: 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {item.hex}
                    </span>
                  </div>

                  {/* Semantic Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {item.role}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                        {item.hex}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed min-h-[34px]">
                      {item.purpose}
                    </p>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopyHex(item.hex, `Light ${item.role}`)}
                  className={`mt-3 w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                    isCopied
                      ? 'bg-[#E8F7F0] border-[#C8EEDC] text-[#16A36A]'
                      : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                      <span>Copy HEX</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: DARK THEME PALETTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0A1438] text-[#60A5FA] flex items-center justify-center shadow-2xs">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Dark Theme Palette
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Low-fatigue nocturnal environment with deep black base and high-contrast silver-grey surfaces.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            6 Semantic Roles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DARK_PALETTE.map((item) => {
            const isCopied = copiedHex === item.hex;
            return (
              <div
                key={item.role}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Swatch Display */}
                  <div
                    className="w-full h-20 rounded-lg shadow-inner mb-3 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: item.hex,
                      border: item.borderColor ? `1px solid ${item.borderColor}` : undefined
                    }}
                  >
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded shadow-2xs"
                      style={{
                        color: item.textColor,
                        backgroundColor: 'rgba(0,0,0,0.35)'
                      }}
                    >
                      {item.hex}
                    </span>
                  </div>

                  {/* Semantic Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {item.role}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                        {item.hex}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed min-h-[34px]">
                      {item.purpose}
                    </p>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopyHex(item.hex, `Dark ${item.role}`)}
                  className={`mt-3 w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                    isCopied
                      ? 'bg-[#092617] border-[#107C4A] text-[#17B169]'
                      : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                      <span>Copy HEX</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION C: LIVE THEME COMPONENT PREVIEW */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Interactive Component Preview
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Test actual UI elements rendered live using the semantic design tokens of either theme.
            </p>
          </div>

          {/* Theme Preview Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setPreviewTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewTheme === 'light'
                  ? 'bg-white text-[#0000FF] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#0000FF]" />
              <span>Light Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewTheme === 'dark'
                  ? 'bg-[#121316] text-[#60A5FA] border border-[#2E323D] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Dark Preview</span>
            </button>
          </div>
        </div>

        {/* Dynamic Preview Container */}
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
            previewTheme === 'dark'
              ? 'bg-[#000000] border-[#2E323D] text-[#FFFFFF]'
              : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#000000] shadow-sm'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Buttons & Actions */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#F8F9FA] border-[#E5E7EB]'
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
                  style={{ backgroundColor: '#0000FF' }}
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
                    color: previewTheme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                >
                  Highlight Action
                </button>
              </div>
            </div>

            {/* 2. Status Badges & Indicators */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#F8F9FA] border-[#E5E7EB]'
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
                    backgroundColor: previewTheme === 'dark' ? 'rgba(23,177,105,0.2)' : 'rgba(143,188,139,0.25)',
                    color: previewTheme === 'dark' ? '#17B169' : '#2D6A2E',
                    border: `1px solid ${previewTheme === 'dark' ? '#17B169' : '#8FBC8B'}`
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  E.164 Verified
                </span>

                {/* Danger Badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? 'rgba(255,0,0,0.18)' : 'rgba(237,41,57,0.18)',
                    color: previewTheme === 'dark' ? '#FF0000' : '#ED2939',
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
                    backgroundColor: previewTheme === 'dark' ? 'rgba(255,95,31,0.2)' : 'rgba(255,157,0,0.2)',
                    color: previewTheme === 'dark' ? '#FF5F1F' : '#B45309',
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
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold opacity-70">Carrier Delivery Rate</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#0A1438' : '#EBF0FF',
                    color: previewTheme === 'dark' ? '#60A5FA' : '#0000FF'
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono">98.4%</div>
                <div
                  className="text-[11px] font-bold flex items-center gap-1 mt-0.5"
                  style={{ color: previewTheme === 'dark' ? '#17B169' : '#2D6A2E' }}
                >
                  <span>▲ +3.2% vs last cycle</span>
                </div>
              </div>
              <div className="text-[10px] opacity-60">Verified across 1,240 dispatches</div>
            </div>

            {/* 4. Form Field & Input */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#F8F9FA] border-[#E5E7EB]'
              }`}
            >
              <label className="text-xs font-bold block">
                Sender Line Header <span style={{ color: '#0000FF' }}>*</span>
              </label>
              <input
                type="text"
                readOnly
                value="+1 (220) 240-4020"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none"
                style={{
                  backgroundColor: previewTheme === 'dark' ? '#0D0E12' : '#FFFFFF',
                  borderColor: previewTheme === 'dark' ? '#2E323D' : '#D1D5DB',
                  color: previewTheme === 'dark' ? '#FFFFFF' : '#000000'
                }}
              />
              <span className="text-[10px] opacity-60 block">E.164 normalized telephony route</span>
            </div>

            {/* 5. Navigation Active State */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#F8F9FA] border-[#E5E7EB]'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                Navigation Active State
              </div>
              <div
                className="px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold shadow-2xs"
                style={{
                  backgroundColor: previewTheme === 'dark' ? '#0A1438' : '#EBF0FF',
                  color: previewTheme === 'dark' ? '#60A5FA' : '#0000FF',
                  border: previewTheme === 'dark' ? '1px solid #1A38FF' : '1px solid #D9E0F8'
                }}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Campaign Console</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-[#0000FF] text-white">
                  Active
                </span>
              </div>
            </div>

            {/* 6. In-App Notification Card */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#0000FF]" />
                  <span className="text-xs font-bold">Broadcast Dispatch Complete</span>
                </div>
                <span className="text-[10px] opacity-60">2m ago</span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Batch broadcast of 152 promotional SMS/WhatsApp messages enqueued and sent.
              </p>
              <div
                className="text-[10px] font-bold font-mono"
                style={{ color: previewTheme === 'dark' ? '#17B169' : '#2D6A2E' }}
              >
                STATUS: DISPATCH_SUCCESS ✓
              </div>
            </div>

            {/* 7. Chart Legend */}
            <div
              className={`p-4 rounded-xl border md:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-4 ${
                previewTheme === 'dark' ? 'bg-[#121316] border-[#2E323D]' : 'bg-[#F8F9FA] border-[#E5E7EB]'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">Telemetry Chart Legend</span>
                <span className="text-[10px] opacity-60">Visual categorical breakdown mapped to brand tokens</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0000FF' }} />
                  <span>Dispatched <strong className="font-mono">(1,240)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: previewTheme === 'dark' ? '#17B169' : '#8FBC8B' }}
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
