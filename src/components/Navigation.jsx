import React from 'react';
import { Film, Music, Gamepad2 } from 'lucide-react';

const TABS = [
  { id: 'movie', label: 'Movies & TV', icon: Film },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'game', label: 'Games', icon: Gamepad2 }
];

export default function Navigation({ activeMode, setActiveMode }) {
  return (
    <nav className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-[var(--md-sys-color-surface-container-high)]/90 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 active:scale-95 ${
                active
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold shadow-md'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Icon size={18} className={active ? 'text-[var(--md-sys-color-primary)]' : ''} />
              <span className="text-xs tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
