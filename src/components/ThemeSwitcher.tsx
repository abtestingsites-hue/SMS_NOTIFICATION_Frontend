import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light Mode', icon: Sun },
    { mode: 'dark', label: 'Dark Mode', icon: Moon },
    { mode: 'system', label: 'System Default', icon: Laptop }
  ];

  const currentIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const CurrentIcon = currentIcon;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme selector: currently ${themeMode} (${resolvedTheme} active)`}
        title={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors cursor-pointer text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        <span className="hidden sm:inline capitalize text-[11px] font-semibold text-[var(--color-text-primary)]">
          {themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Theme options"
          className="absolute right-0 mt-1.5 w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setThemeMode(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-text)] font-semibold'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
