import React from 'react';
import { ChevronLeft, Image as ImageLucide, Smartphone, Send } from 'lucide-react';
import AppLogo from './AppLogo';

export default function TopBar({
  editorActive,
  activeMode,
  hasChanges,
  onExit,
  onReplace
}) {
  const getModeTitle = () => {
    switch (activeMode) {
      case 'music': return 'Music Sharer';
      case 'game': return 'Game Sharer';
      default: return 'Movie & TV Sharer';
    }
  };

  const getCategorySubtitle = () => {
    switch (activeMode) {
      case 'music': return 'Share your favorite tracks & albums';
      case 'game': return 'Showcase your gaming moments';
      default: return 'Share movies & TV shows you love';
    }
  };

  return (
    <header className="w-full h-16 shrink-0 px-4 md:px-8 flex items-center justify-between z-50 transition-colors m3-glass-surface border-b border-white/5">
      {editorActive ? (
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-95 transition-all cursor-pointer"
            aria-label="Back to Search"
          >
            <ChevronLeft size={20} />
            <span className="text-xs font-bold tracking-wide pr-1">Back</span>
          </button>

          <button
            onClick={onReplace}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90 active:scale-95 transition-all text-xs font-bold tracking-wide cursor-pointer shadow-sm"
          >
            <ImageLucide size={16} />
            <span>Replace</span>
          </button>
        </div>
      ) : (
        <div className="w-full flex items-center justify-between">
          {/* Left side: Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center p-2 overflow-hidden shadow-lg shadow-[var(--md-dynamic-accent-glow)] shrink-0">
              <AppLogo className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: "'Kanit', sans-serif", fontWeight: 900, fontStyle: 'italic' }}>
                SHOWCARD
              </h1>
              <p className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
                {getCategorySubtitle()}
              </p>
            </div>
          </div>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href="https://t.me/showcarrd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Join Telegram Channel"
              title="Join Telegram Channel"
            >
              <Send size={18} />
            </a>

            <a
              href="https://github.com/bluuesmokes/showcard-android/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Try Android App"
              title="Try Android App"
            >
              <Smartphone size={18} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
