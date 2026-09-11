/**
 * Google Font dynamic loader and SVG embedding helper
 */

// Known system fonts that don't need Google Fonts loading
const SYSTEM_FONTS = new Set([
  'Helvetica Neue',
  'Helvetica',
  'Arial',
  'Arial Black',
  'Impact',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'system-ui',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
]);

/**
 * Extract clean font family name from CSS font-family string
 * e.g. "'Playfair Display', serif" -> "Playfair Display"
 */
export function extractFontName(fontFamily: string): string {
  if (!fontFamily) return 'Space Grotesk';
  const firstPart = fontFamily.split(',')[0].trim();
  return firstPart.replace(/['"]/g, '').trim();
}

/**
 * Check if the font requires a Google Font stylesheet
 */
export function isGoogleFont(fontFamily: string): boolean {
  const fontName = extractFontName(fontFamily);
  return !SYSTEM_FONTS.has(fontName);
}

/**
 * Get Google Fonts URL for a font family
 */
export function getGoogleFontUrl(fontFamily: string): string | null {
  if (!isGoogleFont(fontFamily)) return null;
  const fontName = extractFontName(fontFamily);
  const encodedName = fontName.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${encodedName}&display=swap`;
}

/**
 * Dynamically load Google Font into the browser document head
 */
export function loadGoogleFontInDocument(fontFamily: string): void {
  if (typeof document === 'undefined') return;
  const url = getGoogleFontUrl(fontFamily);
  if (!url) return;

  const fontName = extractFontName(fontFamily);
  const linkId = `gfont-link-${fontName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  // Trigger browser font load check if supported
  if ('fonts' in document) {
    try {
      (document as any).fonts.load(`16px "${fontName}"`).catch(() => {});
    } catch {}
  }
}

/**
 * Generate CSS @import statement for embedding inside SVG <defs><style>
 */
export function getGoogleFontSvgImport(fontFamily: string): string {
  const url = getGoogleFontUrl(fontFamily);
  if (!url) return '';
  // XML safe escape of &
  const xmlSafeUrl = url.replace(/&/g, '&amp;');
  return `@import url('${xmlSafeUrl}');`;
}
