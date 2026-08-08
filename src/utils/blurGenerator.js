/**
 * Canvas-based background image pre-blur generator.
 * Creates a pre-blurred PNG data URL with edge clamping and black background padding
 * to eliminate white borders during domToPng / html2canvas image export.
 */

const blurCache = new Map();

export async function createBlurredImageUri(imageUrl, blurAmount) {
  if (!imageUrl || blurAmount <= 0) return imageUrl;

  const cacheKey = `${imageUrl}_blur_${blurAmount}`;
  if (blurCache.has(cacheKey)) {
    return blurCache.get(cacheKey);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Target size for background blur
        const targetW = 400;
        const targetH = 600;
        canvas.width = targetW;
        canvas.height = targetH;

        // 1. Fill canvas background with solid dark color to avoid white fringe
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, targetW, targetH);

        // 2. Set Canvas 2D blur filter
        const MathBlur = Math.min(Math.max(blurAmount, 1), 150);
        if ('filter' in ctx) {
          ctx.filter = `blur(${MathBlur * 0.4}px)`;
        }

        // 3. Draw image with bleed padding to ensure no edge sampling artifacts
        const bleed = MathBlur * 0.5 + 20;
        ctx.drawImage(
          img,
          -bleed,
          -bleed,
          targetW + bleed * 2,
          targetH + bleed * 2
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        blurCache.set(cacheKey, dataUrl);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas blur fallback:', err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
