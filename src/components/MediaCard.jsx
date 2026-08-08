import React, { useState } from 'react';
import { Film, Music, Gamepad2 } from 'lucide-react';

export default function MediaCard({ item, activeMode, onSelect }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = item.image || (item.poster_path ? `https://image.tmdb.org/t/p/w400${item.poster_path}` : '');
  const isMusic = activeMode === 'music' || item.typeLabel === 'Song' || item.typeLabel === 'Album';
  const title = item.title || item.name || item.collectionName || 'Untitled';
  const subtitle = item.subtitle || (item.release_date || item.first_air_date || '').split('-')[0] || '';
  const typeLabel = item.typeLabel || (activeMode === 'movie' ? 'Movie' : activeMode === 'music' ? 'Music' : 'Game');

  const getBadgeIcon = () => {
    switch (activeMode) {
      case 'music': return <Music size={10} />;
      case 'game': return <Gamepad2 size={10} />;
      default: return <Film size={10} />;
    }
  };

  const getCategoryPlaceholderIcon = () => {
    switch (activeMode) {
      case 'music': return <Music size={32} className="text-[var(--md-sys-color-primary)]" />;
      case 'game': return <Gamepad2 size={32} className="text-[var(--md-sys-color-primary)]" />;
      default: return <Film size={32} className="text-[var(--md-sys-color-primary)]" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative m3-card-elevated overflow-hidden border border-white/5 cursor-pointer flex flex-col transition-all duration-300"
    >
      <div className={`relative ${isMusic ? 'aspect-square' : 'aspect-[2/3]'} w-full overflow-hidden bg-[var(--md-sys-color-surface-container-highest)]`}>
        {/* Placeholder / Skeleton while loading or if error/no image */}
        {(!imgLoaded || imgError || !imgSrc) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)]">
            <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary-container)]/40 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {getCategoryPlaceholderIcon()}
            </div>
          </div>
        )}

        {imgSrc && !imgError && (
          <img
            src={imgSrc}
            alt={title}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-[var(--md-sys-color-primary)] flex items-center gap-1 uppercase tracking-wider">
          {getBadgeIcon()}
          <span>{typeLabel}</span>
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between flex-1 bg-[var(--md-sys-color-surface-container-low)]">
        <div>
          <h3 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate group-hover:text-[var(--md-sys-color-primary)] transition-colors">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
