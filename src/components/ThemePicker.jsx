import React, { useState, useRef, useEffect } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

export default function ThemePicker({ theme, onThemeChange, onResetTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleHueChange = (e) => {
    const newHue = Number(e.target.value);
    onThemeChange({ isMonochrome: false, hue: newHue });
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-2.5 rounded-full transition-all cursor-pointer shadow-sm ${
          isOpen
            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] ring-2 ring-[var(--md-sys-color-primary)]'
            : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-95'
        }`}
        aria-label="Theme Settings"
        title="Customize Site Theme Color"
      >
        <Palette size={18} />
      </button>

      {/* Fuwari-style Theme Picker Popover Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#161311]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-[var(--md-sys-color-primary)] shrink-0" />
              <span className="text-sm font-bold text-white tracking-tight">Theme Color</span>
              <button
                onClick={() => {
                  onResetTheme();
                }}
                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 transition cursor-pointer ml-1"
                aria-label="Reset Theme to Black & White"
                title="Reset to Black & White Default"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-amber-400/90 text-xs font-mono font-bold tracking-wider border border-white/5">
              {theme.isMonochrome ? 'B&W' : theme.hue}
            </span>
          </div>

          {/* Hue Color Slider */}
          <div className="pt-1 pb-1">
            <input
              type="range"
              min="0"
              max="360"
              value={theme.isMonochrome ? 0 : theme.hue}
              onChange={handleHueChange}
              className="fuwari-hue-slider"
            />
          </div>

          {/* Quick theme mode toggles / indicator */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Default: Monochrome B&W</span>
            <button
              onClick={onResetTheme}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                theme.isMonochrome
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Black & White
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
