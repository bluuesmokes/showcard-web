import React from 'react';

export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  field,
  suffix = "",
  setConfig
}) {
  const handleChange = (val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setConfig(prev => ({ ...prev, [field]: num }));
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-lg px-2 py-0.5 focus-within:border-[var(--md-sys-color-primary)] transition-all">
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-transparent text-[11px] font-mono text-[var(--md-sys-color-on-surface)] outline-none w-10 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold"
          />
          <span className="text-[10px] font-mono text-[var(--md-sys-color-outline)] font-bold">{suffix}</span>
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="m3-slider cursor-pointer"
        />
      </div>
    </div>
  );
}
