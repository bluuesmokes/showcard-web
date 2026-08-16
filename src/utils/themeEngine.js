/**
 * Theme Engine for ShowCard Web
 * Handles Black & White (monochrome) default theme and dynamic HSL hue color themes.
 */

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

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

const STORAGE_KEY = 'showcard_app_theme';

export const DEFAULT_THEME = {
  isMonochrome: true,
  hue: 270 // default hue value when slider is moved
};

export function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        isMonochrome: parsed.isMonochrome ?? true,
        hue: typeof parsed.hue === 'number' ? parsed.hue : 270
      };
    }
  } catch {
    // fallback to default
  }
  return { ...DEFAULT_THEME };
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // ignore quota/storage errors
  }
}

export function applyAppTheme(theme = getSavedTheme()) {
  const root = document.documentElement;

  if (theme.isMonochrome) {
    // Black & White (Monochrome) Default Theme
    root.style.setProperty('--md-sys-color-primary', '#ffffff');
    root.style.setProperty('--md-sys-color-on-primary', '#09090b');
    root.style.setProperty('--md-sys-color-primary-container', '#27272a');
    root.style.setProperty('--md-sys-color-on-primary-container', '#f4f4f5');

    root.style.setProperty('--md-sys-color-secondary', '#e4e4e7');
    root.style.setProperty('--md-sys-color-on-secondary', '#09090b');
    root.style.setProperty('--md-sys-color-secondary-container', '#3f3f46');
    root.style.setProperty('--md-sys-color-on-secondary-container', '#f4f4f5');

    root.style.setProperty('--md-sys-color-tertiary', '#d4d4d8');
    root.style.setProperty('--md-sys-color-on-tertiary', '#09090b');
    root.style.setProperty('--md-sys-color-tertiary-container', '#3f3f46');
    root.style.setProperty('--md-sys-color-on-tertiary-container', '#f4f4f5');

    root.style.setProperty('--md-sys-color-surface', '#09090b');
    root.style.setProperty('--md-sys-color-surface-dim', '#040405');
    root.style.setProperty('--md-sys-color-surface-bright', '#18181b');
    root.style.setProperty('--md-sys-color-surface-container-lowest', '#09090b');
    root.style.setProperty('--md-sys-color-surface-container-low', '#121215');
    root.style.setProperty('--md-sys-color-surface-container', '#18181b');
    root.style.setProperty('--md-sys-color-surface-container-high', '#27272a');
    root.style.setProperty('--md-sys-color-surface-container-highest', '#3f3f46');

    root.style.setProperty('--md-sys-color-on-surface', '#f4f4f5');
    root.style.setProperty('--md-sys-color-on-surface-variant', '#a1a1aa');
    root.style.setProperty('--md-sys-color-outline', '#71717a');
    root.style.setProperty('--md-sys-color-outline-variant', '#3f3f46');

    root.style.setProperty('--md-dynamic-accent-glow', 'rgba(255, 255, 255, 0.15)');
  } else {
    // Custom Hue Color Theme
    const h = theme.hue % 360;

    const primaryHex = hslToHex(h, 85, 70);
    const onPrimaryHex = hslToHex(h, 90, 10);
    const primaryContainerHex = hslToHex(h, 75, 28);
    const onPrimaryContainerHex = hslToHex(h, 85, 92);

    const secondaryHex = hslToHex((h + 30) % 360, 60, 75);
    const secondaryContainerHex = hslToHex((h + 30) % 360, 50, 25);

    const surfaceDimHex = hslToHex(h, 25, 5);
    const surfaceLowestHex = hslToHex(h, 30, 6);
    const surfaceLowHex = hslToHex(h, 25, 9);
    const surfaceHex = hslToHex(h, 25, 12);
    const surfaceHighHex = hslToHex(h, 25, 16);
    const surfaceHighestHex = hslToHex(h, 25, 22);

    const [r, g, b] = hslToRgb(h, 80, 60);

    root.style.setProperty('--md-sys-color-primary', primaryHex);
    root.style.setProperty('--md-sys-color-on-primary', onPrimaryHex);
    root.style.setProperty('--md-sys-color-primary-container', primaryContainerHex);
    root.style.setProperty('--md-sys-color-on-primary-container', onPrimaryContainerHex);

    root.style.setProperty('--md-sys-color-secondary', secondaryHex);
    root.style.setProperty('--md-sys-color-on-secondary', '#09090b');
    root.style.setProperty('--md-sys-color-secondary-container', secondaryContainerHex);
    root.style.setProperty('--md-sys-color-on-secondary-container', '#f4f4f5');

    root.style.setProperty('--md-sys-color-surface', surfaceHex);
    root.style.setProperty('--md-sys-color-surface-dim', surfaceDimHex);
    root.style.setProperty('--md-sys-color-surface-bright', surfaceHighHex);
    root.style.setProperty('--md-sys-color-surface-container-lowest', surfaceLowestHex);
    root.style.setProperty('--md-sys-color-surface-container-low', surfaceLowHex);
    root.style.setProperty('--md-sys-color-surface-container', surfaceHex);
    root.style.setProperty('--md-sys-color-surface-container-high', surfaceHighHex);
    root.style.setProperty('--md-sys-color-surface-container-highest', surfaceHighestHex);

    root.style.setProperty('--md-sys-color-on-surface', '#f4f4f5');
    root.style.setProperty('--md-sys-color-on-surface-variant', hslToHex(h, 20, 75));
    root.style.setProperty('--md-sys-color-outline', hslToHex(h, 50, 60));
    root.style.setProperty('--md-sys-color-outline-variant', hslToHex(h, 30, 30));

    root.style.setProperty('--md-dynamic-accent-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
  }
}
