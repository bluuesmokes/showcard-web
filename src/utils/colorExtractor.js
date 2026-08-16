/**
 * Extracts dominant color palette from image and dynamically applies
 * Material Design 3 CSS custom variables to the document root.
 */

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function extractAndApplyColors(imageUrl) {
  if (!imageUrl) return;

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;

      ctx.drawImage(img, 0, 0, 64, 64);
      const imageData = ctx.getImageData(0, 0, 64, 64).data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      // Sample pixels, ignoring extreme darks and extreme whites
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 200) continue;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 15 || brightness > 240) continue;

        rSum += r;
        gSum += g;
        bSum += b;
        count++;
      }

      if (count === 0) return;

      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);

      const [h, s] = rgbToHsl(avgR, avgG, avgB);

      // Generate dynamic dark palette tokens
      const primaryHex = hslToHex(h, Math.min(s, 75), 75); // Bright dynamic accent
      const onPrimaryHex = hslToHex(h, Math.min(s, 80), 20);
      const primaryContainerHex = hslToHex(h, Math.min(s, 70), 30);
      const onPrimaryContainerHex = hslToHex(h, Math.min(s, 80), 90);

      const secondaryHex = hslToHex((h + 30) % 360, Math.min(s, 40), 75);
      const secondaryContainerHex = hslToHex((h + 30) % 360, Math.min(s, 50), 25);

      const root = document.documentElement;
      root.style.setProperty('--md-sys-color-primary', primaryHex);
      root.style.setProperty('--md-sys-color-on-primary', onPrimaryHex);
      root.style.setProperty('--md-sys-color-primary-container', primaryContainerHex);
      root.style.setProperty('--md-sys-color-on-primary-container', onPrimaryContainerHex);

      root.style.setProperty('--md-sys-color-secondary', secondaryHex);
      root.style.setProperty('--md-sys-color-secondary-container', secondaryContainerHex);

      root.style.setProperty('--md-dynamic-accent-glow', `rgba(${avgR}, ${avgG}, ${avgB}, 0.25)`);
    } catch {
      // Ignore color extraction errors
    }
  };

  img.src = imageUrl;
}
