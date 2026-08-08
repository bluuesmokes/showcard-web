import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--md-sys-color-surface-container-high)] border border-white/10 p-6 sm:p-8 rounded-[28px] max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${isDanger ? 'bg-red-500/20 text-red-400' : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]'}`}>
          <AlertTriangle size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black tracking-tight text-[var(--md-sys-color-on-surface)]">
            {title}
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-xs hover:bg-white/10 transition active:scale-95 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-xs transition active:scale-95 cursor-pointer ${
              isDanger
                ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/30'
                : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ManualEntrySheet({ isOpen, onClose, onSubmit, posterData, setPosterData, onUpload }) {
  if (!isOpen) return null;

  const handleDone = () => {
    if (onSubmit) {
      onSubmit();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[var(--md-sys-color-surface-container-high)] border border-white/10 p-6 sm:p-8 rounded-[28px] max-w-xl w-full text-left space-y-6 shadow-2xl my-8 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-primary)]" />
            <h3 className="text-lg font-black tracking-tight text-[var(--md-sys-color-on-surface)] uppercase">
              Manual Card Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-white transition active:scale-95 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Interstellar"
              className="w-full bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-xl px-4 py-3 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-zinc-600 outline-none focus:border-[var(--md-sys-color-primary)] transition"
              value={posterData.title}
              onChange={e => setPosterData({ ...posterData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Subtitle / Artist
              </label>
              <input
                type="text"
                placeholder="e.g. Christopher Nolan / Hans Zimmer"
                className="w-full bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-xl px-4 py-3 text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-zinc-600 outline-none focus:border-[var(--md-sys-color-primary)] transition"
                value={posterData.subtitle}
                onChange={e => setPosterData({ ...posterData, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Media Category
              </label>
              <select
                className="w-full bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-xl px-4 py-3 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] transition cursor-pointer"
                value={posterData.typeLabel}
                onChange={e => setPosterData({ ...posterData, typeLabel: e.target.value })}
              >
                <option value="Movie">Movie</option>
                <option value="TV Show">TV Show</option>
                <option value="Song">Song</option>
                <option value="Album">Album</option>
                <option value="Game">Game</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Overview / Description
            </label>
            <textarea
              placeholder="Enter plot summary, track details, or notes..."
              className="w-full bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-xl px-4 py-3 h-28 resize-none text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-zinc-600 outline-none focus:border-[var(--md-sys-color-primary)] transition"
              value={posterData.overview}
              onChange={e => setPosterData({ ...posterData, overview: e.target.value })}
            />
          </div>

          <div className="relative w-full border-2 border-dashed border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] rounded-2xl py-8 text-center bg-[var(--md-sys-color-surface-container-lowest)] transition cursor-pointer group">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onUpload} accept="image/*" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition">
              {posterData.image ? "✓ Change Uploaded Poster Image" : "+ Upload Poster / Cover Image"}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={handleDone}
            className="px-6 py-3 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-xs hover:opacity-90 transition active:scale-95 cursor-pointer shadow-md"
          >
            Done & Preview Card
          </button>
        </div>
      </div>
    </div>
  );
}
