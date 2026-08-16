import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FONT_FAMILIES } from '../constants';
import { createBlurredImageUri } from '../utils/blurGenerator';

export default React.forwardRef(function CardPreview({
  config,
  posterData,
  safeImageUrl,
  isImageLoading
}, ref) {
  const [blurredCanvasUri, setBlurredCanvasUri] = useState(null);

  useEffect(() => {
    if (!config.showBgImage || config.bgType !== 'blur' || !safeImageUrl) {
      return;
    }
    let isMounted = true;
    createBlurredImageUri(safeImageUrl, config.bgBlur).then((uri) => {
      if (isMounted) {
        setBlurredCanvasUri(uri);
      }
    });
    return () => { isMounted = false; };
  }, [safeImageUrl, config.bgBlur, config.bgType, config.showBgImage]);

  const blurredBgUrl = (config.showBgImage && config.bgType === 'blur' && blurredCanvasUri)
    ? blurredCanvasUri
    : safeImageUrl;

  const fontObj = FONT_FAMILIES.find(f => f.name === config.fontFamily) || FONT_FAMILIES[0];
  const selectedFontFamily = config.customFont || fontObj?.value || '"Inter", sans-serif';

  return (
    <div className="select-none">
      <div
        ref={ref}
        style={{
          width: config.customCanvas ? `${config.canvasW}px` : '380px',
          height: config.customCanvas ? `${config.canvasH}px` : '675px',
          borderRadius: `${config.cardRoundness ?? 40}px`
        }}
        className="flex items-center justify-center relative overflow-hidden bg-black shadow-[0_10px_60px_rgba(0,0,0,0.85)] transition-all duration-300"
      >
        {/* Background Blur Image - Layered with scale and negative inset to prevent white border fringe */}
        {config.showBgImage && config.bgType === 'blur' && (safeImageUrl || blurredBgUrl) && (
          <div className="absolute -inset-16 overflow-hidden bg-black pointer-events-none">
            <img
              src={blurredBgUrl || safeImageUrl}
              style={{
                opacity: config.bgOpacity,
                transform: `scale(${config.bgZoom || 1.5})`
              }}
              className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
              alt=""
            />
          </div>
        )}

        {/* Solid Color Background */}
        {config.showBgImage && config.bgType === 'solid' && (
          <div
            className="absolute inset-0 w-full h-full transition-all duration-300 pointer-events-none"
            style={{
              backgroundColor: config.solidBgColor,
              opacity: config.bgOpacity
            }}
          />
        )}

        {/* Gradient Background */}
        {config.showBgImage && config.bgType === 'gradient' && (
          <div
            className="absolute inset-0 w-full h-full transition-all duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${config.bgGradientStart || '#000000'}, ${config.bgGradientEnd || '#2c2c2c'})`,
              opacity: config.bgOpacity
            }}
          />
        )}

        {/* Transparent Background */}
        {config.showBgImage && config.bgType === 'transparent' && (
          <div className="absolute inset-0 w-full h-full pointer-events-none" />
        )}

        {/* Outer Card Glass Frame */}
        <div
          style={{
            borderRadius: `${config.windowCorner ?? config.cardRoundness}px`,
            width: '85%',
            height: '85%',
            background: config.bgType === 'transparent' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.12)'
          }}
          className="border border-white/20 p-5 sm:p-8 flex flex-col items-center z-10 relative shadow-2xl backdrop-blur-md overflow-hidden"
        >
          {/* Inner Poster / Cover Artwork Container */}
          <div
            style={{
              borderRadius: `${config.posterRoundness}px`,
              height: `${config.imageHeight}px`
            }}
            className="w-full bg-black/40 overflow-hidden mb-4 sm:mb-5 relative border border-white/10 shrink-0 shadow-2xl flex items-center justify-center"
          >
            {isImageLoading && (
              <Loader2 className="animate-spin text-white/30" size={32} />
            )}
            {safeImageUrl && !isImageLoading && (
              <img
                src={safeImageUrl}
                style={{
                  transform: `scale(${config.scale}) translate(${config.x}px, ${config.y}px)`
                }}
                className="w-full h-full object-contain animate-in fade-in duration-300"
                alt=""
              />
            )}
          </div>

          {/* Text Info Container */}
          <div
            className={`flex-1 w-full flex flex-col gap-1.5 ${
              config.textPos === 'top'
                ? 'justify-start pt-1'
                : config.textPos === 'middle'
                ? 'justify-center'
                : 'justify-end pb-2'
            } ${
              config.textAlign === 'center'
                ? 'items-center text-center'
                : config.textAlign === 'right'
                ? 'items-end text-right'
                : 'items-start text-left'
            }`}
          >
            {config.showText && (
              <div className="space-y-1 w-full px-1 text-white animate-in fade-in">
                <div
                  className={`w-full pb-0.5 flex flex-col ${
                    config.textAlign === 'center'
                      ? 'items-center text-center'
                      : config.textAlign === 'right'
                      ? 'items-end text-right'
                      : 'items-start text-left'
                  }`}
                >
                  {(() => {
                    const titleText = posterData.title || 'Untitled';
                    const words = titleText.split(' ');
                    const lines = [];
                    let currentLine = [];
                    const maxCharsPerLine = 18;

                    words.forEach((word) => {
                      const testLine = [...currentLine, word].join(' ');
                      if (testLine.length > maxCharsPerLine && currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                        currentLine = [word];
                      } else {
                        currentLine.push(word);
                      }
                    });

                    if (currentLine.length > 0) {
                      lines.push(currentLine.join(' '));
                    }

                    const baseLineHeight = parseInt(config.titleSize) || 30;
                    const spacingMultiplier = 50;
                    const actualLineCount = lines.length || 1;
                    const totalHeight = baseLineHeight + ((actualLineCount - 1) * (baseLineHeight + 5)) + 5;

                    return (
                      <svg
                        width="100%"
                        height={totalHeight || 100}
                        style={{
                          fontFamily: selectedFontFamily,
                          letterSpacing: `${config.titleLetterSpacing}px`,
                          lineHeight: config.lineHeight,
                          display: 'block',
                          overflow: 'visible',
                          ...(config.textAlign === 'center' && { margin: '0 auto' }),
                          ...(config.textAlign === 'right' && { marginLeft: 'auto' }),
                          textIndent: 0,
                          paddingLeft: 0
                        }}
                        className="font-black break-words"
                      >
                        {config.useGradientText && (
                          <defs>
                            <linearGradient id="m3TextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={config.gradientStart || '#ff0000'} />
                              <stop offset="100%" stopColor={config.gradientEnd || '#0000ff'} />
                            </linearGradient>
                          </defs>
                        )}
                        {lines.map((line, lineIndex) => (
                          <text
                            key={lineIndex}
                            x={config.textAlign === 'center' ? '50%' : config.textAlign === 'right' ? '100%' : '0%'}
                            textAnchor={config.textAlign === 'center' ? 'middle' : config.textAlign === 'right' ? 'end' : 'start'}
                            y={baseLineHeight + (lineIndex * (baseLineHeight + (config.titleLetterSpacing * spacingMultiplier)))}
                            fontSize={config.titleSize}
                            fontWeight="900"
                            fill={config.useGradientText ? "url(#m3TextGradient)" : config.titleColor}
                            style={{
                              fontFamily: selectedFontFamily,
                              letterSpacing: `${config.titleLetterSpacing}px`,
                              lineHeight: config.lineHeight
                            }}
                          >
                            {line}
                          </text>
                        ))}
                      </svg>
                    );
                  })()}
                </div>

                {posterData.subtitle && (
                  <p
                    style={{
                      fontFamily: selectedFontFamily,
                      fontSize: `${config.subtitleSize || 12}px`,
                      letterSpacing: `${config.subtitleLetterSpacing}px`,
                      lineHeight: config.lineHeight
                    }}
                    className="font-bold opacity-50 leading-none"
                  >
                    {posterData.typeLabel === 'Song' || posterData.typeLabel === 'Album' ? posterData.subtitle : `(${posterData.subtitle})`}
                  </p>
                )}

                {/* Category & Divider Line */}
                <div
                  className={`flex items-center gap-3 w-full opacity-60 pt-1.5 ${
                    config.categoryAlign === 'center'
                      ? 'justify-center'
                      : config.categoryAlign === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {(config.showCategoryLine ?? true) && (config.categoryAlign === 'center' || config.categoryAlign === 'right') && (
                    <div className="h-[1px] flex-1 bg-white/20" />
                  )}

                  <span
                    style={{
                      fontFamily: selectedFontFamily,
                      fontSize: `${config.categorySize || 10}px`,
                      letterSpacing: `${config.categoryLetterSpacing}px`,
                      lineHeight: config.lineHeight
                    }}
                    className="font-black uppercase tracking-[0.3em] shrink-0 text-[var(--md-sys-color-primary)]"
                  >
                    {posterData.typeLabel || 'MEDIA'}
                  </span>

                  {(config.showCategoryLine ?? true) && (config.categoryAlign === 'center' || config.categoryAlign === 'left') && (
                    <div className="h-[1px] flex-1 bg-white/20" />
                  )}
                </div>

                {/* Genres text with Genres Alignment */}
                {posterData.genres && (
                  <p
                    style={{
                      textAlign: config.genresAlign || 'left',
                      fontFamily: selectedFontFamily,
                      fontSize: `${config.genresSize || 10}px`,
                      letterSpacing: `${config.genresLetterSpacing}px`,
                      lineHeight: config.lineHeight
                    }}
                    className="font-bold text-white/40 tracking-widest uppercase truncate w-full pt-1"
                  >
                    {posterData.genres}
                  </p>
                )}

                {config.showDesc && posterData.overview && (
                  <p
                    style={{ fontSize: `${config.descSize}px` }}
                    className="text-white/70 leading-relaxed font-medium line-clamp-4 pt-1.5"
                  >
                    {posterData.overview}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
