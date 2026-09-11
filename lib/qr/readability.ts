import { QRDesignConfig, ReadabilityCheckResult } from '@/types/qr';

function parseHex(hexStr: string): { r: number; g: number; b: number } | null {
  let hex = hexStr.replace('#', '').trim();
  if (hex === 'transparent' || !hex) {
    return { r: 255, g: 255, b: 255 };
  }
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseHex(color1) || { r: 0, g: 0, b: 0 };
  const rgb2 = parseHex(color2) || { r: 255, g: 255, b: 255 };

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function evaluateQRReadability(config: QRDesignConfig): ReadabilityCheckResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Contrast Check
  const fgColor = config.foreground;
  const bgColor = config.background === 'transparent' ? '#FFFFFF' : config.background;
  let minContrast = calculateContrastRatio(fgColor, bgColor);

  if (config.gradient && config.gradient.type !== 'none') {
    const c2Contrast = calculateContrastRatio(config.gradient.color2, bgColor);
    minContrast = Math.min(minContrast, c2Contrast);
  }

  const isContrastPass = minContrast >= 3.5;

  if (minContrast < 2.5) {
    score -= 40;
    issues.push('Critical: Low color contrast between QR modules and background');
    recommendations.push('Increase contrast by using a darker foreground color or a lighter background');
  } else if (minContrast < 4.5) {
    score -= 15;
    issues.push('Moderate contrast: QR may struggle under low-light or glare cameras');
    recommendations.push('Aim for a contrast ratio of at least 4.5:1');
  }

  // 2. Inverted QR Check (Light modules on dark background)
  const fgRgb = parseHex(fgColor) || { r: 0, g: 0, b: 0 };
  const bgRgb = parseHex(bgColor) || { r: 255, g: 255, b: 255 };
  const fgLum = getRelativeLuminance(fgRgb);
  const bgLum = getRelativeLuminance(bgRgb);
  const isInverted = fgLum > bgLum;

  if (isInverted) {
    score -= 15;
    issues.push('Inverted colors: Dark background with light modules');
    recommendations.push('Some older barcode scanners fail on inverted QR codes. Consider dark modules on light background for universal scanning');
  }

  // 3. Logo Coverage & Error Correction
  const logoSize = config.logo?.dataUrl || config.logo?.url ? (config.logo.size || 20) : 0;
  const isLogoPresent = logoSize > 0;
  const logoCoveragePercent = isLogoPresent ? Math.round(logoSize) : 0;
  let isLogoSafe = true;

  if (isLogoPresent) {
    if (logoSize > 28) {
      score -= 25;
      isLogoSafe = false;
      issues.push(`Large logo (${logoSize}%): Risks covering essential data codewords`);
      recommendations.push('Reduce logo size to under 24% and set Error Correction Level to H (High)');
    } else if (logoSize > 20 && config.errorCorrectionLevel !== 'H' && config.errorCorrectionLevel !== 'Q') {
      score -= 15;
      issues.push('Logo present with low error correction level (L/M)');
      recommendations.push('Upgrade Error Correction Level to H (High 30% recovery) when embedding a logo');
    }
  }

  // 4. Quiet Zone
  const quietZone = config.quietZone ?? 4;
  const isQuietZoneSafe = quietZone >= 3;
  if (quietZone < 2) {
    score -= 20;
    issues.push('Quiet zone is too narrow (< 2 modules)');
    recommendations.push('Provide at least 3-4 modules of white space border so camera sensors can isolate the matrix');
  } else if (quietZone < 3) {
    score -= 8;
    issues.push('Border space is tight');
    recommendations.push('Increase margin/quiet zone to 4 for optimal scanning distance');
  }

  // Final score clamping
  score = Math.max(10, Math.min(100, score));

  let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
  if (score < 50) {
    status = 'critical';
  } else if (score < 75) {
    status = 'warning';
  } else if (score < 90) {
    status = 'good';
  }

  return {
    score,
    status,
    contrastRatio: Number(minContrast.toFixed(2)),
    isContrastPass,
    isInverted,
    logoCoveragePercent,
    isLogoSafe,
    quietZoneModules: quietZone,
    isQuietZoneSafe,
    issues,
    recommendations,
  };
}
