import React from 'react';

export default function SegmentedButton({ options, value, onChange, label }) {
  return (
    <div className="space-y-2 text-left w-full">
      {label && (
        <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block px-1">
          {label}
        </span>
      )}
      <div className="flex bg-[var(--md-sys-color-surface-container-high)] p-1 rounded-full border border-[var(--md-sys-color-outline-variant)]/30">
        {options.map((opt) => {
          const isActive = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex-1 py-2 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-sm'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-white'
              }`}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label || opt.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
