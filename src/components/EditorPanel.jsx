import React, { useRef } from 'react';
import { AlignLeft, Maximize2, Palette, Type, Layout, FileText, Download, Loader2, AlignCenter, AlignRight, Eye, EyeOff, ImagePlus, Upload } from 'lucide-react';
import Slider from './Slider';
import SegmentedButton from './SegmentedButton';
import { FONT_FAMILIES } from '../constants';

export default function EditorPanel({
  config,
  setConfig,
  posterData,
  setPosterData,
  isDownloading,
  onDownload,
  safeImageUrl
}) {
  const imageInputRef = useRef(null);
  const fontInputRef = useRef(null);

  const ASPECT_RATIOS = [
    { ratio: '9:16', w: 380, h: 675, label: 'Story' },
    { ratio: '1:1', w: 600, h: 600, label: 'Square' },
    { ratio: '4:5', w: 480, h: 600, label: 'Portrait' },
    { ratio: '3:4', w: 450, h: 600, label: 'Vertical' },
    { ratio: '2:3', w: 400, h: 600, label: 'Classic' },
    { ratio: '1:2', w: 300, h: 600, label: 'Compact' }
  ];

  const QUICK_CATEGORIES = ['MOVIE', 'TV SHOW', 'SONG', 'ALBUM', 'GAME'];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPosterData(p => ({ ...p, image: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFontUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = `CustomFont_${Date.now()}`;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newStyle = document.createElement('style');
          newStyle.appendChild(document.createTextNode(`
            @font-face {
              font-family: "${fontName}";
              src: url("${event.target.result}");
            }
          `));
          document.head.appendChild(newStyle);
          setConfig(p => ({ ...p, customFont: `"${fontName}", sans-serif`, fontFamily: fontName }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-full md:w-[460px] h-[60vh] md:h-full overflow-y-auto bg-[var(--md-sys-color-surface-container-low)] border-t md:border-t-0 md:border-l border-white/10 p-4 sm:p-6 md:p-8 z-30 shadow-2xl shrink-0">
      <div className="space-y-8 pb-36 text-left">
        
        {/* --- 1. CONTENT INFO --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
              <AlignLeft size={14} />
            </div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--md-sys-color-on-surface)]">
              Card Content & Description
            </h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">Title</label>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="text-[10px] font-bold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer bg-[var(--md-sys-color-primary-container)]/40 px-2 py-0.5 rounded-lg border border-[var(--md-sys-color-primary)]/30"
                >
                  <ImagePlus size={12} />
                  <span>IMAGE</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Card Title"
                className="w-full px-3.5 py-2.5 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-xl text-xs outline-none text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] transition"
                value={posterData.title}
                onChange={e => setPosterData({ ...posterData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">Subtitle</label>
                <input
                  type="text"
                  placeholder="Subtitle / Year"
                  className="w-full px-3.5 py-2.5 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-xl text-xs outline-none text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] transition"
                  value={posterData.subtitle}
                  onChange={e => setPosterData({ ...posterData, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">Genres</label>
                <input
                  type="text"
                  placeholder="e.g. Sci-Fi, Drama"
                  className="w-full px-3.5 py-2.5 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-xl text-xs outline-none text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] transition"
                  value={posterData.genres}
                  onChange={e => setPosterData({ ...posterData, genres: e.target.value })}
                />
              </div>
            </div>

            {/* Quick Category Chips */}
            <div className="space-y-1 pt-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                Quick Category
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_CATEGORIES.map(cat => {
                  const isSelected = (posterData.typeLabel || '').toUpperCase() === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPosterData(p => ({ ...p, typeLabel: cat === 'TV SHOW' ? 'TV Show' : cat.charAt(0) + cat.slice(1).toLowerCase() }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap border ${
                        isSelected
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-sm'
                          : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]/30 hover:border-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Description Textarea */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                  Description Text (Edit / Shorten)
                </label>
                <button
                  onClick={() => setConfig(p => ({ ...p, showDesc: !p.showDesc }))}
                  className="text-[10px] font-bold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {config.showDesc ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{config.showDesc ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
              <textarea
                placeholder="Type or shorten plot description..."
                className="w-full px-3.5 py-2.5 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-xl text-xs outline-none text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] transition h-20 resize-y"
                value={posterData.overview || ''}
                onChange={e => setPosterData({ ...posterData, overview: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* --- 2. ASPECT RATIO --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
              <Maximize2 size={14} />
            </div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--md-sys-color-on-surface)]">
              Aspect Ratio & Frame Size
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {ASPECT_RATIOS.map((aspect) => {
              const isActive = config.canvasW === aspect.w && config.canvasH === aspect.h;
              return (
                <button
                  key={aspect.ratio}
                  onClick={() => setConfig(p => ({ ...p, canvasW: aspect.w, canvasH: aspect.h, customCanvas: true }))}
                  className={`p-3 rounded-2xl border transition-all duration-200 text-left active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] shadow-md'
                      : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]/30 hover:border-white/20'
                  }`}
                >
                  <div className="text-sm font-black tracking-tight">{aspect.ratio}</div>
                  <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{aspect.label}</div>
                  <div className="text-[9px] font-mono opacity-50 mt-0.5">{aspect.w}×{aspect.h}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* --- 3. APPEARANCE & COLORS --- */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
              <Palette size={14} />
            </div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--md-sys-color-on-surface)]">
              Colors & Text Formatting
            </h4>
          </div>

          <SegmentedButton
            label="Title Format"
            options={[
              { id: 'solid', label: 'Solid Color' },
              { id: 'gradient', label: 'Gradient' }
            ]}
            value={config.useGradientText ? 'gradient' : 'solid'}
            onChange={(val) => setConfig(p => ({ ...p, useGradientText: val === 'gradient' }))}
          />

          {!config.useGradientText ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">
                Title Solid Color
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.titleColor}
                  onChange={e => setConfig(p => ({ ...p, titleColor: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-[var(--md-sys-color-surface-container-highest)] rounded-xl border border-[var(--md-sys-color-outline-variant)]/30 text-xs font-mono text-white outline-none focus:border-[var(--md-sys-color-primary)]"
                />
                <div className="relative">
                  <input
                    type="color"
                    value={config.titleColor}
                    onChange={e => setConfig(p => ({ ...p, titleColor: e.target.value }))}
                    className="absolute inset-0 w-9 h-9 opacity-0 cursor-pointer"
                  />
                  <div className="w-9 h-9 rounded-xl border border-white/20 shadow-md cursor-pointer" style={{ backgroundColor: config.titleColor }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">Start Color</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={config.gradientStart}
                    onChange={e => setConfig(p => ({ ...p, gradientStart: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg border border-[var(--md-sys-color-outline-variant)]/30 text-[11px] font-mono text-white outline-none"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={config.gradientStart}
                      onChange={e => setConfig(p => ({ ...p, gradientStart: e.target.value }))}
                      className="absolute inset-0 w-7 h-7 opacity-0 cursor-pointer"
                    />
                    <div className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer" style={{ backgroundColor: config.gradientStart }} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">End Color</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={config.gradientEnd}
                    onChange={e => setConfig(p => ({ ...p, gradientEnd: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg border border-[var(--md-sys-color-outline-variant)]/30 text-[11px] font-mono text-white outline-none"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={config.gradientEnd}
                      onChange={e => setConfig(p => ({ ...p, gradientEnd: e.target.value }))}
                      className="absolute inset-0 w-7 h-7 opacity-0 cursor-pointer"
                    />
                    <div className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer" style={{ backgroundColor: config.gradientEnd }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alignments: Title, Category, and Genres */}
          <SegmentedButton
            label="Title Alignment"
            options={[
              { id: 'left', icon: <AlignLeft size={14} /> },
              { id: 'center', icon: <AlignCenter size={14} /> },
              { id: 'right', icon: <AlignRight size={14} /> }
            ]}
            value={config.textAlign}
            onChange={(id) => setConfig(p => ({ ...p, textAlign: id }))}
          />

          <SegmentedButton
            label="Category Alignment"
            options={[
              { id: 'left', icon: <AlignLeft size={14} /> },
              { id: 'center', icon: <AlignCenter size={14} /> },
              { id: 'right', icon: <AlignRight size={14} /> }
            ]}
            value={config.categoryAlign}
            onChange={(id) => setConfig(p => ({ ...p, categoryAlign: id }))}
          />

          <SegmentedButton
            label="Genres Alignment"
            options={[
              { id: 'left', icon: <AlignLeft size={14} /> },
              { id: 'center', icon: <AlignCenter size={14} /> },
              { id: 'right', icon: <AlignRight size={14} /> }
            ]}
            value={config.genresAlign || 'left'}
            onChange={(id) => setConfig(p => ({ ...p, genresAlign: id }))}
          />

          {/* Category Line Toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Category Divider Line
            </span>
            <button
              type="button"
              onClick={() => setConfig(p => ({ ...p, showCategoryLine: !(p.showCategoryLine ?? true) }))}
              className={`px-3 py-1 rounded-xl border text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                (config.showCategoryLine ?? true)
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                  : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]/30'
              }`}
            >
              {(config.showCategoryLine ?? true) ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {/* Background Style */}
          <div className="space-y-3">
            <SegmentedButton
              label="Background Style"
              options={[
                { id: 'blur', label: 'Blur Image' },
                { id: 'solid', label: 'Solid Color' },
                { id: 'gradient', label: 'Gradient' },
                { id: 'transparent', label: 'Transparent' }
              ]}
              value={config.bgType}
              onChange={(id) => setConfig(p => ({ ...p, bgType: id }))}
            />

            {config.bgType === 'blur' && safeImageUrl && (
              <div className="space-y-3 pt-2">
                <Slider label="Blur Intensity" value={config.bgBlur} min={0} max={200} field="bgBlur" suffix="px" setConfig={setConfig} />
                <Slider label="Blur Opacity" value={config.bgOpacity} min={0} max={1} step={0.01} field="bgOpacity" suffix="" setConfig={setConfig} />
                <Slider label="BG Zoom" value={config.bgZoom || 1.5} min={1} max={3} step={0.1} field="bgZoom" suffix="x" setConfig={setConfig} />
              </div>
            )}

            {config.bgType === 'solid' && (
              <div className="space-y-3 pt-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={config.solidBgColor}
                    onChange={e => setConfig(p => ({ ...p, solidBgColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-[var(--md-sys-color-surface-container-highest)] rounded-xl border border-[var(--md-sys-color-outline-variant)]/30 text-xs font-mono text-white outline-none"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={config.solidBgColor}
                      onChange={e => setConfig(p => ({ ...p, solidBgColor: e.target.value }))}
                      className="absolute inset-0 w-9 h-9 opacity-0 cursor-pointer"
                    />
                    <div className="w-9 h-9 rounded-xl border border-white/20 cursor-pointer shadow-md" style={{ backgroundColor: config.solidBgColor }} />
                  </div>
                </div>
                <Slider label="Solid Opacity" value={config.bgOpacity} min={0} max={1} step={0.01} field="bgOpacity" suffix="" setConfig={setConfig} />
              </div>
            )}

            {config.bgType === 'gradient' && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">Start Color</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={config.bgGradientStart || '#000000'}
                        onChange={e => setConfig(p => ({ ...p, bgGradientStart: e.target.value }))}
                        className="flex-1 px-2.5 py-1.5 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg border border-[var(--md-sys-color-outline-variant)]/30 text-[11px] font-mono text-white outline-none"
                      />
                      <div className="relative">
                        <input
                          type="color"
                          value={config.bgGradientStart || '#000000'}
                          onChange={e => setConfig(p => ({ ...p, bgGradientStart: e.target.value }))}
                          className="absolute inset-0 w-7 h-7 opacity-0 cursor-pointer"
                        />
                        <div className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer" style={{ backgroundColor: config.bgGradientStart || '#000000' }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">End Color</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={config.bgGradientEnd || '#2c2c2c'}
                        onChange={e => setConfig(p => ({ ...p, bgGradientEnd: e.target.value }))}
                        className="flex-1 px-2.5 py-1.5 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg border border-[var(--md-sys-color-outline-variant)]/30 text-[11px] font-mono text-white outline-none"
                      />
                      <div className="relative">
                        <input
                          type="color"
                          value={config.bgGradientEnd || '#2c2c2c'}
                          onChange={e => setConfig(p => ({ ...p, bgGradientEnd: e.target.value }))}
                          className="absolute inset-0 w-7 h-7 opacity-0 cursor-pointer"
                        />
                        <div className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer" style={{ backgroundColor: config.bgGradientEnd || '#2c2c2c' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <Slider label="Gradient Opacity" value={config.bgOpacity} min={0} max={1} step={0.01} field="bgOpacity" suffix="" setConfig={setConfig} />
              </div>
            )}
          </div>
        </section>

        {/* --- 4. TYPOGRAPHY & SPACING --- */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
              <Type size={14} />
            </div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--md-sys-color-on-surface)]">
              Typography & Spacing
            </h4>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">
                Font Family
              </span>
              <input
                type="file"
                ref={fontInputRef}
                onChange={handleFontUpload}
                accept=".ttf,.otf,.woff,.woff2"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fontInputRef.current?.click()}
                className="text-[10px] font-bold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer bg-[var(--md-sys-color-primary-container)]/40 px-2 py-0.5 rounded-lg border border-[var(--md-sys-color-primary)]/30"
              >
                <Upload size={12} />
                <span>UPLOAD FONT</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.name}
                  onClick={() => setConfig(p => ({ ...p, fontFamily: font.name, customFont: null }))}
                  className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 truncate text-left active:scale-95 cursor-pointer ${
                    config.fontFamily === font.name && !config.customFont
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] shadow-sm'
                      : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]/30 hover:border-white/20'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Slider label="Title Size" value={config.titleSize} min={10} max={80} field="titleSize" suffix="px" setConfig={setConfig} />
            <Slider label="Subtitle Size" value={config.subtitleSize || 12} min={8} max={40} field="subtitleSize" suffix="px" setConfig={setConfig} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <Slider label="Category Size" value={config.categorySize || 10} min={6} max={30} field="categorySize" suffix="px" setConfig={setConfig} />
            <Slider label="Genre Size" value={config.genresSize || 10} min={6} max={30} field="genresSize" suffix="px" setConfig={setConfig} />
          </div>

          {config.showDesc && (
            <Slider label="Desc Size" value={config.descSize} min={8} max={24} field="descSize" suffix="px" setConfig={setConfig} />
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Slider label="Title Spacing" value={config.titleLetterSpacing} min={-5} max={20} field="titleLetterSpacing" suffix="px" setConfig={setConfig} />
            <Slider label="Subtitle Spacing" value={config.subtitleLetterSpacing} min={-5} max={20} field="subtitleLetterSpacing" suffix="px" setConfig={setConfig} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Slider label="Category Spacing" value={config.categoryLetterSpacing} min={-5} max={20} field="categoryLetterSpacing" suffix="px" setConfig={setConfig} />
            <Slider label="Genres Spacing" value={config.genresLetterSpacing} min={-5} max={20} field="genresLetterSpacing" suffix="px" setConfig={setConfig} />
          </div>
        </section>

        {/* --- 5. LAYOUT & OFFSETS --- */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
              <Layout size={14} />
            </div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--md-sys-color-on-surface)]">
              Layout & Image Offsets
            </h4>
          </div>

          <SegmentedButton
            label="Vertical Text Position"
            options={[
              { id: 'top', label: 'Top' },
              { id: 'middle', label: 'Middle' },
              { id: 'bottom', label: 'Bottom' }
            ]}
            value={config.textPos}
            onChange={(pos) => setConfig(p => ({ ...p, textPos: pos }))}
          />

          <Slider label="Poster Frame Height" value={config.imageHeight} min={100} max={550} field="imageHeight" suffix="px" setConfig={setConfig} />
          <Slider label="Internal Zoom" value={config.scale} min={1} max={4} step={0.01} field="scale" suffix="x" setConfig={setConfig} />

          <div className="grid grid-cols-2 gap-4">
            <Slider label="X Offset" value={config.x} min={-250} max={250} field="x" suffix="px" setConfig={setConfig} />
            <Slider label="Y Offset" value={config.y} min={-250} max={250} field="y" suffix="px" setConfig={setConfig} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Slider label="Card Round" value={config.cardRoundness} min={0} max={150} field="cardRoundness" suffix="px" setConfig={setConfig} />
            <Slider label="Window Round" value={config.windowCorner ?? 30} min={0} max={100} field="windowCorner" suffix="px" setConfig={setConfig} />
            <Slider label="Poster Round" value={config.posterRoundness} min={0} max={100} field="posterRoundness" suffix="px" setConfig={setConfig} />
          </div>
        </section>

        {/* --- 6. SAVE CARD BUTTON --- */}
        <div className="pt-6">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full py-4 rounded-[28px] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-black text-sm uppercase tracking-wider shadow-xl shadow-[var(--md-dynamic-accent-glow)] flex items-center justify-center gap-3 active:scale-95 transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Download size={20} strokeWidth={2.5} />
                <span>SAVE CARD</span>
              </>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
}
