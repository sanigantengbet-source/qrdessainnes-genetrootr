import QRCode from 'qrcode';
import { QRDesignConfig, DotStyle, CornerSquareStyle, CornerDotStyle } from '@/types/qr';
import { CardTheme } from '@/types/cardTheme';
import { getGoogleFontSvgImport, loadGoogleFontInDocument, extractFontName } from '@/lib/qr/fonts';
import { generateQRCardWithThemeSVG } from './cardRenderer';

export interface RenderQROptions {
  payload: string;
  config: QRDesignConfig;
  qrName?: string;
  renderSize?: number; // target output resolution in pixels
  idPrefix?: string;
  omitFrame?: boolean;
}

/**
 * Check if a cell (r, c) is part of the 3 finder pattern areas (7x7 modules)
 */
function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-left
  if (r < 7 && c < 7) return true;
  // Top-right
  if (r < 7 && c >= size - 7) return true;
  // Bottom-left
  if (r >= size - 7 && c < 7) return true;
  return false;
}

/**
 * Check if a cell is inside the logo area in the center
 */
function isInsideLogoArea(r: number, c: number, size: number, logoCoverage = 0): boolean {
  if (logoCoverage <= 0) return false;
  // logoCoverage is roughly 10% to 30% of total width
  const logoModules = Math.ceil((size * logoCoverage) / 100);
  const start = Math.floor((size - logoModules) / 2);
  const end = start + logoModules;
  return r >= start && r < end && c >= start && c < end;
}

/**
 * Generate SVG Path for an individual data module
 */
function getDotPath(
  r: number,
  c: number,
  cellSize: number,
  dotStyle: DotStyle,
  marginOffset: number
): string {
  const x = marginOffset + c * cellSize;
  const y = marginOffset + r * cellSize;
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const radius = cellSize / 2;

  switch (dotStyle) {
    case 'dots':
      return `<circle cx="${cx}" cy="${cy}" r="${radius * 0.92}" />`;

    case 'rounded':
      return `<rect x="${x + cellSize * 0.05}" y="${y + cellSize * 0.05}" width="${cellSize * 0.9}" height="${cellSize * 0.9}" rx="${cellSize * 0.28}" />`;

    case 'extra-rounded':
      return `<rect x="${x + cellSize * 0.05}" y="${y + cellSize * 0.05}" width="${cellSize * 0.9}" height="${cellSize * 0.9}" rx="${cellSize * 0.45}" />`;

    case 'classy':
      // Diagonal rounded corners
      return `<path d="M ${x + cellSize * 0.45} ${y} 
        L ${x + cellSize} ${y} 
        L ${x + cellSize} ${y + cellSize * 0.55} 
        A ${cellSize * 0.45} ${cellSize * 0.45} 0 0 1 ${x + cellSize * 0.55} ${y + cellSize} 
        L ${x} ${y + cellSize} 
        L ${x} ${y + cellSize * 0.45} 
        A ${cellSize * 0.45} ${cellSize * 0.45} 0 0 1 ${x + cellSize * 0.45} ${y} Z" />`;

    case 'classy-rounded':
      // Leaf shape
      return `<path d="M ${x} ${y + cellSize * 0.5} 
        A ${cellSize * 0.5} ${cellSize * 0.5} 0 0 1 ${x + cellSize * 0.5} ${y} 
        L ${x + cellSize} ${y} 
        L ${x + cellSize} ${y + cellSize * 0.5} 
        A ${cellSize * 0.5} ${cellSize * 0.5} 0 0 1 ${x + cellSize * 0.5} ${y + cellSize} 
        L ${x} ${y + cellSize} Z" />`;

    case 'diamond': {
      const half = cellSize * 0.48;
      return `<polygon points="${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}" />`;
    }

    case 'star': {
      const s = cellSize * 0.48;
      const inner = s * 0.35;
      return `<path d="M ${cx} ${cy - s} 
        Q ${cx} ${cy - inner} ${cx + inner} ${cy - inner} 
        Q ${cx + inner} ${cy} ${cx + s} ${cy} 
        Q ${cx + inner} ${cy} ${cx + inner} ${cy + inner} 
        Q ${cx} ${cy + inner} ${cx} ${cy + s} 
        Q ${cx} ${cy + inner} ${cx - inner} ${cy + inner} 
        Q ${cx - inner} ${cy} ${cx - s} ${cy} 
        Q ${cx - inner} ${cy} ${cx - inner} ${cy - inner} 
        Q ${cx} ${cy - inner} ${cx} ${cy - s} Z" />`;
    }

    case 'cross': {
      const w = cellSize * 0.34;
      return `<path d="M ${cx - w / 2} ${y} H ${cx + w / 2} V ${cy - w / 2} H ${x + cellSize} V ${cy + w / 2} H ${cx + w / 2} V ${y + cellSize} H ${cx - w / 2} V ${cy + w / 2} H ${x} V ${cy - w / 2} H ${cx - w / 2} Z" />`;
    }

    case 'vertical-lines':
      return `<rect x="${x + cellSize * 0.2}" y="${y}" width="${cellSize * 0.6}" height="${cellSize}" rx="${cellSize * 0.3}" />`;

    case 'horizontal-lines':
      return `<rect x="${x}" y="${y + cellSize * 0.2}" width="${cellSize}" height="${cellSize * 0.6}" rx="${cellSize * 0.3}" />`;

    case 'pixel': {
      const p = cellSize * 0.2;
      return `<rect x="${x + p}" y="${y + p}" width="${cellSize - 2 * p}" height="${cellSize - 2 * p}" />`;
    }

    case 'heart': {
      const w = cellSize * 0.85;
      const h = cellSize * 0.8;
      const ox = cx - w / 2;
      const oy = cy - h / 2;
      return `<path transform="translate(${ox}, ${oy}) scale(${w / 24})" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />`;
    }

    case 'fluid':
      return `<rect x="${x + cellSize * 0.02}" y="${y + cellSize * 0.02}" width="${cellSize * 0.96}" height="${cellSize * 0.96}" rx="${cellSize * 0.35}" />`;

    case 'square':
    default:
      return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" />`;
  }
}

/**
 * Render one of the 3 Corner Outer Squares (7x7 modules)
 */
function renderCornerSquare(
  x: number,
  y: number,
  cellSize: number,
  style: CornerSquareStyle,
  idPrefix = 'qr',
  bgCutColor = '#ffffff'
): string {
  const outerSize = 7 * cellSize;
  const innerCutSize = 5 * cellSize;
  const wall = cellSize;
  const cx = x + outerSize / 2;
  const cy = y + outerSize / 2;
  const fillUrl = `url(#${idPrefix}-color)`;

  switch (style) {
    case 'rounded':
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${cellSize * 2}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" rx="${cellSize * 1.2}" fill="${bgCutColor}" />
      `;

    case 'extra-rounded':
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${cellSize * 3}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" rx="${cellSize * 2}" fill="${bgCutColor}" />
      `;

    case 'dot':
      return `
        <circle cx="${cx}" cy="${cy}" r="${outerSize / 2}" fill="${fillUrl}" />
        <circle cx="${cx}" cy="${cy}" r="${innerCutSize / 2}" fill="${bgCutColor}" />
      `;

    case 'squircle':
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${cellSize * 2.4}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" rx="${cellSize * 1.5}" fill="${bgCutColor}" />
      `;

    case 'double':
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${cellSize * 0.5}" fill="none" stroke="${fillUrl}" stroke-width="${cellSize * 0.8}" />
        <rect x="${x + cellSize * 1.2}" y="${y + cellSize * 1.2}" width="${outerSize - 2.4 * cellSize}" height="${outerSize - 2.4 * cellSize}" rx="${cellSize * 0.3}" fill="none" stroke="${fillUrl}" stroke-width="${cellSize * 0.5}" />
      `;

    case 'vintage':
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${cellSize * 1.5}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" rx="${cellSize}" fill="${bgCutColor}" />
        <circle cx="${x + wall / 2}" cy="${y + wall / 2}" r="${cellSize * 0.4}" fill="${fillUrl}" />
        <circle cx="${x + outerSize - wall / 2}" cy="${y + wall / 2}" r="${cellSize * 0.4}" fill="${fillUrl}" />
        <circle cx="${x + wall / 2}" cy="${y + outerSize - wall / 2}" r="${cellSize * 0.4}" fill="${fillUrl}" />
      `;

    case 'diamond': {
      const half = outerSize / 2;
      const innerHalf = innerCutSize / 2;
      return `
        <polygon points="${cx},${y} ${x + outerSize},${cy} ${cx},${y + outerSize} ${x},${cy}" fill="${fillUrl}" />
        <polygon points="${cx},${cy - innerHalf} ${cx + innerHalf},${cy} ${cx},${cy + innerHalf} ${cx - innerHalf},${cy}" fill="${bgCutColor}" />
      `;
    }

    case 'bold-angle': {
      const c = cellSize * 2.2;
      return `
        <polygon points="${x + c},${y} ${x + outerSize},${y} ${x + outerSize},${y + outerSize - c} ${x + outerSize - c},${y + outerSize} ${x},${y + outerSize} ${x},${y + c}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" fill="${bgCutColor}" />
      `;
    }

    case 'pill':
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${outerSize * 0.35}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" rx="${innerCutSize * 0.35}" fill="${bgCutColor}" />
      `;

    case 'square':
    default:
      return `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" fill="${fillUrl}" />
        <rect x="${x + wall}" y="${y + wall}" width="${innerCutSize}" height="${innerCutSize}" fill="${bgCutColor}" />
      `;
  }
}

/**
 * Render one of the 3 Corner Inner Dots (3x3 modules)
 */
function renderCornerDot(
  x: number,
  y: number,
  cellSize: number,
  style: CornerDotStyle,
  idPrefix = 'qr'
): string {
  const dotOffset = 2 * cellSize;
  const dotSize = 3 * cellSize;
  const dotX = x + dotOffset;
  const dotY = y + dotOffset;
  const cx = dotX + dotSize / 2;
  const cy = dotY + dotSize / 2;
  const fillUrl = `url(#${idPrefix}-color)`;

  switch (style) {
    case 'dot':
      return `<circle cx="${cx}" cy="${cy}" r="${dotSize * 0.48}" fill="${fillUrl}" />`;

    case 'rounded':
      return `<rect x="${dotX}" y="${dotY}" width="${dotSize}" height="${dotSize}" rx="${cellSize * 0.8}" fill="${fillUrl}" />`;

    case 'diamond': {
      const half = dotSize / 2;
      return `<polygon points="${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}" fill="${fillUrl}" />`;
    }

    case 'star': {
      const s = dotSize / 2;
      const inner = s * 0.4;
      return `<path d="M ${cx} ${cy - s} 
        Q ${cx} ${cy - inner} ${cx + inner} ${cy - inner} 
        Q ${cx + inner} ${cy} ${cx + s} ${cy} 
        Q ${cx + inner} ${cy} ${cx + inner} ${cy + inner} 
        Q ${cx} ${cy + inner} ${cx} ${cy + s} 
        Q ${cx} ${cy + inner} ${cx - inner} ${cy + inner} 
        Q ${cx - inner} ${cy} ${cx - s} ${cy} 
        Q ${cx - inner} ${cy} ${cx - inner} ${cy - inner} 
        Q ${cx} ${cy - inner} ${cx} ${cy - s} Z" fill="${fillUrl}" />`;
    }

    case 'cross': {
      const w = dotSize * 0.35;
      return `
        <rect x="${cx - w / 2}" y="${dotY}" width="${w}" height="${dotSize}" fill="${fillUrl}" />
        <rect x="${dotX}" y="${cy - w / 2}" width="${dotSize}" height="${w}" fill="${fillUrl}" />
      `;
    }

    case 'heart': {
      const w = dotSize * 0.9;
      const h = dotSize * 0.85;
      return `<path transform="translate(${cx - w / 2}, ${cy - h / 2}) scale(${w / 24})" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${fillUrl}" />`;
    }

    case 'square':
    default:
      return `<rect x="${dotX}" y="${dotY}" width="${dotSize}" height="${dotSize}" fill="${fillUrl}" />`;
  }
}

/**
 * Main QR SVG Generator Engine
 */
export function generateQRSVG(options: RenderQROptions): string {
  const { payload, config, qrName } = options;
  const renderSize = options.renderSize || config.size || 400;
  const idPrefix = options.idPrefix || 'qr';

  // 1. Generate QR matrix using qrcode
  const qr = QRCode.create(payload || 'https://example.com', {
    errorCorrectionLevel: config.errorCorrectionLevel || 'M',
  });

  const matrixSize = qr.modules.size;
  const quietZone = config.quietZone ?? 4;
  const totalModules = matrixSize + quietZone * 2;
  const cellSize = renderSize / totalModules;
  const marginOffset = quietZone * cellSize;

  // 2. Build Gradient & Fill Definitions
  const gradColor1 = config.gradient?.color1 || config.foreground;
  const gradColor2 = config.gradient?.color2 || '#2563EB';

  let defs = '';
  if (config.gradient && config.gradient.type === 'linear') {
    const angle = config.gradient.angle || 0;
    const rad = (angle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(rad) * 50);
    const y1 = Math.round(50 - Math.sin(rad) * 50);
    const x2 = Math.round(50 + Math.cos(rad) * 50);
    const y2 = Math.round(50 + Math.sin(rad) * 50);
    defs += `
      <linearGradient id="${idPrefix}-color" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${gradColor1}" />
        <stop offset="100%" stop-color="${gradColor2}" />
      </linearGradient>
    `;
  } else if (config.gradient && config.gradient.type === 'radial') {
    defs += `
      <radialGradient id="${idPrefix}-color" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${gradColor1}" />
        <stop offset="100%" stop-color="${gradColor2}" />
      </radialGradient>
    `;
  } else {
    defs += `
      <linearGradient id="${idPrefix}-color" x1="0%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="${config.foreground}" />
        <stop offset="100%" stop-color="${config.foreground}" />
      </linearGradient>
    `;
  }

  // 3. Background Pattern Definitions (dots, grid, diagonal, cross, waves)
  let bgPattern = '';
  if (config.pattern && config.pattern.type !== 'none') {
    const pType = config.pattern.type;
    const pColor = config.pattern.color || config.foreground || '#000000';
    const pOp = config.pattern.opacity ?? 0.08;
    defs += `
      <pattern id="${idPrefix}-bg-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
        ${
          pType === 'dots'
            ? `<circle cx="8" cy="8" r="2" fill="${pColor}" opacity="${pOp}" />`
            : pType === 'grid'
            ? `<path d="M 16 0 L 0 0 0 16" fill="none" stroke="${pColor}" stroke-width="1" opacity="${pOp}" />`
            : pType === 'cross'
            ? `<path d="M 8 2 L 8 14 M 2 8 L 14 8" fill="none" stroke="${pColor}" stroke-width="1.5" stroke-linecap="round" opacity="${pOp}" />`
            : pType === 'waves'
            ? `<path d="M 0 8 Q 4 2 8 8 T 16 8" fill="none" stroke="${pColor}" stroke-width="1.5" opacity="${pOp}" />`
            : `<path d="M 0 16 L 16 0" fill="none" stroke="${pColor}" stroke-width="1.5" opacity="${pOp}" />`
        }
      </pattern>
    `;
    bgPattern = `<rect width="${renderSize}" height="${renderSize}" fill="url(#${idPrefix}-bg-pattern)" />`;
  }

  // 4. Render Data Modules (excluding 3 finder pattern areas & center logo area)
  const logoCoverage = config.logo?.dataUrl || config.logo?.url ? (config.logo.size || 20) : 0;
  let dataModulesPaths = '';

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (qr.modules.get(r, c) === 1) {
        if (isFinderPattern(r, c, matrixSize)) continue;
        if (isInsideLogoArea(r, c, matrixSize, logoCoverage)) continue;

        dataModulesPaths += getDotPath(
          r,
          c,
          cellSize,
          config.dotStyle || 'square',
          marginOffset
        );
      }
    }
  }

  // 5. Render the 3 Finder Patterns
  // Cutout color inside finder outer square should match background
  const bgCutColor = config.background === 'transparent' ? '#ffffff' : config.background;
  const styleVariables = `--qr-bg-cut: ${bgCutColor};`;

  const tlX = marginOffset;
  const tlY = marginOffset;
  const trX = marginOffset + (matrixSize - 7) * cellSize;
  const trY = marginOffset;
  const blX = marginOffset;
  const blY = marginOffset + (matrixSize - 7) * cellSize;

  const cornerStyle = config.cornerSquareStyle || 'square';
  const cornerDotStyle = config.cornerDotStyle || 'square';

  const finderPatternsSVG = `
    <!-- Top-Left Finder -->
    ${renderCornerSquare(tlX, tlY, cellSize, cornerStyle, idPrefix, bgCutColor)}
    ${renderCornerDot(tlX, tlY, cellSize, cornerDotStyle, idPrefix)}
    <!-- Top-Right Finder -->
    ${renderCornerSquare(trX, trY, cellSize, cornerStyle, idPrefix, bgCutColor)}
    ${renderCornerDot(trX, trY, cellSize, cornerDotStyle, idPrefix)}
    <!-- Bottom-Left Finder -->
    ${renderCornerSquare(blX, blY, cellSize, cornerStyle, idPrefix, bgCutColor)}
    ${renderCornerDot(blX, blY, cellSize, cornerDotStyle, idPrefix)}
  `;

  // 6. Render Logo in the center
  let logoSVG = '';
  if (logoCoverage > 0 && (config.logo?.dataUrl || config.logo?.url)) {
    const logoImgUrl = config.logo.dataUrl || config.logo.url;
    const logoSizePx = (renderSize * logoCoverage) / 100;
    const logoPadding = (config.logo.padding ?? 4) * (renderSize / 400);
    const logoCenter = renderSize / 2;
    const logoBoxSize = logoSizePx + logoPadding * 2;
    const logoBoxX = logoCenter - logoBoxSize / 2;
    const logoBoxY = logoCenter - logoBoxSize / 2;
    const logoImgX = logoCenter - logoSizePx / 2;
    const logoImgY = logoCenter - logoSizePx / 2;
    const isCircle = config.logo.borderRadius === 50;
    const bgRadius = isCircle
      ? logoBoxSize / 2
      : (config.logo.borderRadius ?? 8) * (renderSize / 400);
    const imgRadius = isCircle
      ? logoSizePx / 2
      : Math.max(0, bgRadius - logoPadding);

    const logoBgColor = config.logo.backgroundColor || '#ffffff';
    const logoOpacity = config.logo.opacity ?? 1;

    // SVG ClipPath to ensure the image is strictly clipped to the container's exact geometry
    // In SVG, <image> does not inherit border-radius without an explicit clipPath.
    const logoClipId = `${idPrefix}-logo-clip-${Math.round(logoCenter)}`;
    defs += `
      <clipPath id="${logoClipId}">
        ${
          isCircle
            ? `<circle cx="${logoCenter}" cy="${logoCenter}" r="${logoSizePx / 2}" />`
            : `<rect x="${logoImgX}" y="${logoImgY}" width="${logoSizePx}" height="${logoSizePx}" rx="${imgRadius}" ry="${imgRadius}" />`
        }
      </clipPath>
    `;

    logoSVG = `
      <g id="${idPrefix}-logo-container" opacity="${logoOpacity}">
        ${
          isCircle
            ? `<circle cx="${logoCenter}" cy="${logoCenter}" r="${logoBoxSize / 2}" fill="${logoBgColor}" stroke="#000000" stroke-width="2" />`
            : `<rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${bgRadius}" ry="${bgRadius}" fill="${logoBgColor}" stroke="#000000" stroke-width="2" />`
        }
        <image href="${logoImgUrl}" x="${logoImgX}" y="${logoImgY}" width="${logoSizePx}" height="${logoSizePx}" clip-path="url(#${logoClipId})" preserveAspectRatio="xMidYMid slice" style="border-radius: ${isCircle ? '50%' : `${imgRadius}px`}; overflow: hidden;" />
      </g>
    `;
  }

  // 7. Base QR Core SVG
  const qrCoreSVG = `
    <g id="${idPrefix}-matrix" fill="url(#${idPrefix}-color)" style="${styleVariables}">
      <g id="${idPrefix}-data-modules">
        ${dataModulesPaths}
      </g>
      <g id="${idPrefix}-finder-patterns">
        ${finderPatternsSVG}
      </g>
    </g>
    ${logoSVG}
  `;

  // 8. Frame Enclosure System
  const frame = config.frame;
  const hasFrame = frame && frame.style && frame.style !== 'none';
  const typography = config.typography;
  const fontFamily = typography?.fontFamily || "'Space Grotesk', sans-serif";
  const fontWeight = typography?.fontWeight || '800';
  const letterSpacing = typography?.letterSpacing ?? 1;
  const textTransform = typography?.textTransform || 'uppercase';

  // Load font in browser
  loadGoogleFontInDocument(fontFamily);
  const fontImport = getGoogleFontSvgImport(fontFamily);

  // Add Font definitions to defs
  defs += `
    <style>
      ${fontImport}
      .qr-font-text {
        font-family: ${fontFamily};
        font-weight: ${fontWeight};
        letter-spacing: ${letterSpacing}px;
      }
    </style>
  `;

  const rawFrameText = frame?.text || qrName || 'SCAN ME';
  const frameText = textTransform === 'uppercase' ? rawFrameText.toUpperCase() : rawFrameText;
  const rawFrameSubtext = frame?.subtext || '';
  const frameSubtext = textTransform === 'uppercase' ? rawFrameSubtext.toUpperCase() : rawFrameSubtext;

  if (!hasFrame || options.omitFrame) {
    // Return direct QR code
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${renderSize} ${renderSize}" width="${renderSize}" height="${renderSize}" shape-rendering="geometricPrecision">
        <defs>${defs}</defs>
        ${config.background !== 'transparent' ? `<rect width="${renderSize}" height="${renderSize}" fill="${config.background}" />` : ''}
        ${bgPattern}
        ${qrCoreSVG}
      </svg>
    `.trim();
  }

  // Calculate Frame Envelope Dimensions
  const framePos = frame.position || 'bottom';
  const pad = 24 * (renderSize / 400);
  let totalWidth = renderSize + pad * 2;
  let totalHeight = renderSize + pad * 2;
  let qrX = pad;
  let qrY = pad;

  const headerHeight = frameSubtext ? 68 * (renderSize / 400) : 52 * (renderSize / 400);
  const bannerHeight = frameSubtext ? 68 * (renderSize / 400) : 52 * (renderSize / 400);

  if (framePos === 'bottom' || framePos === 'polaroid' || framePos === 'brutalist') {
    totalHeight += bannerHeight;
  } else if (framePos === 'top') {
    totalHeight += headerHeight;
    qrY += headerHeight;
  } else if (framePos === 'box' || framePos === 'tag' || framePos === 'badge') {
    totalHeight += bannerHeight + 16 * (renderSize / 400);
  }

  const frameBorderWidth = frame.borderWidth ?? 3;
  const frameBg = frame.backgroundColor || '#FFE600';
  const frameTextCol = frame.textColor || '#000000';
  const frameBorderCol = frame.borderColor || '#000000';
  const hasDropShadow = config.shadow?.enabled ?? true;

  let frameDecoration = '';

  if (frame.style === 'brutalist-block' || frame.style === 'brutalist-hazard') {
    frameDecoration = `
      <!-- Brutalist Frame Box -->
      <rect x="6" y="6" width="${totalWidth - 12}" height="${totalHeight - 12}" fill="${frameBg}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <!-- Neo-brutalist hard drop shadow -->
      ${hasDropShadow ? `
        <rect x="${totalWidth - 6}" y="12" width="6" height="${totalHeight - 6}" fill="#000000" />
        <rect x="12" y="${totalHeight - 6}" width="${totalWidth - 6}" height="6" fill="#000000" />
      ` : ''}
      <!-- Inner QR viewport container -->
      <rect x="${qrX}" y="${qrY}" width="${renderSize}" height="${renderSize}" fill="${config.background === 'transparent' ? '#ffffff' : config.background}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <!-- Frame Label Block -->
      <g id="frame-text-block">
        <text x="${totalWidth / 2}" y="${qrY + renderSize + 34 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${18 * (renderSize / 400)}" fill="${frameTextCol}" letter-spacing="${letterSpacing}px">
          ${frameText}
        </text>
        ${
          frameSubtext
            ? `<text x="${totalWidth / 2}" y="${qrY + renderSize + 52 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="600" font-size="${11 * (renderSize / 400)}" fill="${frameTextCol}" opacity="0.85" letter-spacing="${letterSpacing * 0.8}px">
                ${frameSubtext}
              </text>`
            : ''
        }
      </g>
    `;
  } else if (frame.style === 'brutalist-tag' || frame.style === 'tag') {
    frameDecoration = `
      <!-- Industrial Tag Container -->
      <rect x="6" y="6" width="${totalWidth - 12}" height="${totalHeight - 12}" fill="${frameBg}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <circle cx="26" cy="26" r="6" fill="#ffffff" stroke="${frameBorderCol}" stroke-width="2" />
      <rect x="${qrX}" y="${qrY}" width="${renderSize}" height="${renderSize}" fill="${config.background === 'transparent' ? '#ffffff' : config.background}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <g id="frame-text-block">
        <text x="${totalWidth / 2}" y="${qrY + renderSize + 34 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${16 * (renderSize / 400)}" fill="${frameTextCol}" letter-spacing="${letterSpacing}px">
          ${frameText}
        </text>
      </g>
    `;
  } else if (frame.style === 'polaroid-card') {
    frameDecoration = `
      <!-- Polaroid Container -->
      <rect x="4" y="4" width="${totalWidth - 8}" height="${totalHeight - 8}" rx="8" fill="${frameBg || '#FFFFFF'}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <!-- QR photo cut -->
      <rect x="${qrX}" y="${qrY}" width="${renderSize}" height="${renderSize}" fill="${config.background === 'transparent' ? '#ffffff' : config.background}" stroke="#e5e7eb" stroke-width="1.5" />
      <!-- Polaroid text -->
      <g id="frame-text-block">
        <text x="${totalWidth / 2}" y="${qrY + renderSize + 36 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${20 * (renderSize / 400)}" fill="${frameTextCol}" letter-spacing="${letterSpacing}px">
          ${frameText}
        </text>
        ${
          frameSubtext
            ? `<text x="${totalWidth / 2}" y="${qrY + renderSize + 52 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="500" font-size="${12 * (renderSize / 400)}" fill="#6b7280" letter-spacing="${letterSpacing * 0.5}px">
                ${frameSubtext}
              </text>`
            : ''
        }
      </g>
    `;
  } else if (frame.style === 'pill-banner' || frame.style === 'floating-pill') {
    const pillW = renderSize * 0.78;
    const pillH = 42 * (renderSize / 400);
    const pillX = (totalWidth - pillW) / 2;
    const pillY = qrY + renderSize + 14 * (renderSize / 400);

    frameDecoration = `
      <!-- Pill Banner Frame Container -->
      <rect x="4" y="4" width="${totalWidth - 8}" height="${totalHeight - 8}" rx="20" fill="${config.background === 'transparent' ? '#ffffff' : config.background}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      ${hasDropShadow ? `<rect x="${pillX + 4}" y="${pillY + 4}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="#000000" />` : ''}
      <!-- Pill Badge -->
      <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${frameBg}" stroke="${frameBorderCol}" stroke-width="2.5" />
      <text x="${totalWidth / 2}" y="${pillY + pillH / 2 + 5 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${14 * (renderSize / 400)}" fill="${frameTextCol}" letter-spacing="${letterSpacing}px">
        ${frameText}
      </text>
    `;
  } else if (frame.style === 'banner') {
    const isTop = framePos === 'top';
    const bannerH = 44 * (renderSize / 400);
    const bannerY = isTop ? 4 : totalHeight - bannerH - 4;

    frameDecoration = `
      <rect x="4" y="4" width="${totalWidth - 8}" height="${totalHeight - 8}" rx="8" fill="${config.background === 'transparent' ? '#ffffff' : config.background}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <rect x="4" y="${bannerY}" width="${totalWidth - 8}" height="${bannerH}" fill="${frameBg}" stroke="${frameBorderCol}" stroke-width="2" />
      <text x="${totalWidth / 2}" y="${bannerY + bannerH / 2 + 5 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${15 * (renderSize / 400)}" fill="${frameTextCol}" letter-spacing="${letterSpacing}px">
        ${frameText}
      </text>
    `;
  } else {
    // Default Solid Badge / Header Frame
    const isTop = framePos === 'top';
    const badgeY = isTop ? 14 * (renderSize / 400) : qrY + renderSize + 8 * (renderSize / 400);

    frameDecoration = `
      <rect x="4" y="4" width="${totalWidth - 8}" height="${totalHeight - 8}" rx="14" fill="${config.background === 'transparent' ? '#ffffff' : config.background}" stroke="${frameBorderCol}" stroke-width="${frameBorderWidth}" />
      <g id="frame-header-badge">
        <rect x="${qrX}" y="${badgeY}" width="${renderSize}" height="${38 * (renderSize / 400)}" rx="8" fill="${frameBg}" stroke="${frameBorderCol}" stroke-width="2" />
        <text x="${totalWidth / 2}" y="${badgeY + 24 * (renderSize / 400)}" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${15 * (renderSize / 400)}" fill="${frameTextCol}" letter-spacing="${letterSpacing}px">
          ${frameText}
        </text>
      </g>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" shape-rendering="geometricPrecision">
      <defs>${defs}</defs>
      ${frameDecoration}
      <!-- QR Content -->
      <g transform="translate(${qrX}, ${qrY})">
        ${bgPattern}
        ${qrCoreSVG}
      </g>
    </svg>
  `.trim();
}

export interface RenderQRCardOptions {
  payload: string;
  config: QRDesignConfig;
  cardTheme?: CardTheme;
  qrName?: string;
  cardSubtitle?: string;
  renderWidth?: number; // default 640
  renderHeight?: number; // default 880
  idPrefix?: string;
}

/**
 * Modern QR Payment Card Generator (QRIS-style Scannable Presentation Card)
 * Produces a complete, ready-to-share card with:
 * - QR Name at top
 * - Customized QR in the center
 * - "Scan to Pay" / Action Callout at bottom
 */
export function generateQRCardSVG(options: RenderQRCardOptions): string {
  if (options.cardTheme) {
    return generateQRCardWithThemeSVG({
      payload: options.payload,
      config: options.config,
      theme: options.cardTheme,
      qrName: options.qrName,
      cardSubtitle: options.cardSubtitle,
      idPrefix: options.idPrefix,
    });
  }

  const { payload, config } = options;
  const rawQrName = (options.qrName || 'SANN STORE').trim();
  const rawSubtitle = (options.cardSubtitle || 'Scan to Pay').trim();

  // Escape XML safe
  const escapeXML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Typography parameters
  const typography = config.typography;
  const fontFamily = typography?.fontFamily || "'Space Grotesk', sans-serif";
  const fontWeight = typography?.fontWeight || '900';
  let letterSpacing = typography?.letterSpacing ?? 2;
  const textTransform = typography?.textTransform || 'uppercase';

  // Load font in browser document head
  loadGoogleFontInDocument(fontFamily);
  const fontImport = getGoogleFontSvgImport(fontFamily);

  const displayName = textTransform === 'uppercase'
    ? escapeXML(rawQrName || 'MY QR CODE').toUpperCase()
    : escapeXML(rawQrName || 'My QR Code');

  // CTA Text from frame text or custom subtitle
  const ctaText = (config.frame?.text || rawSubtitle || 'SCAN TO PAY').trim();
  const displaySubtitle = textTransform === 'uppercase'
    ? escapeXML(ctaText).toUpperCase()
    : escapeXML(ctaText);

  // Subtitle tag under name (or frame subtext)
  const displayTag = config.frame?.subtext
    ? escapeXML(config.frame.subtext).toUpperCase()
    : 'NATIONAL STANDARD SCANNABLE QR CODE';

  const width = options.renderWidth || 640;
  const height = options.renderHeight || 880;
  const idPrefix = options.idPrefix || 'qrcard';

  // Inner QR stage box
  const qrBoxSize = 460;
  const qrBoxX = (width - qrBoxSize) / 2; // 90
  const qrBoxY = 175;

  const qrInnerSize = 420;
  const qrX = (width - qrInnerSize) / 2; // 110
  const qrY = qrBoxY + (qrBoxSize - qrInnerSize) / 2; // 195

  // Generate the core QR SVG with user customizations: dots, corners, gradient, logo, quietZone
  const innerQRSvg = generateQRSVG({
    payload,
    config,
    qrName: rawQrName,
    renderSize: qrInnerSize,
    idPrefix: `${idPrefix}-core`,
    omitFrame: true,
  });

  // Calculate dynamic font size so long QR names fit smoothly
  let nameFontSize = 28;
  if (displayName.length > 25) {
    nameFontSize = 18;
    letterSpacing = Math.min(letterSpacing, 1);
  } else if (displayName.length > 18) {
    nameFontSize = 22;
    letterSpacing = Math.min(letterSpacing, 1.5);
  } else if (displayName.length > 13) {
    nameFontSize = 25;
  }

  // Theme accents from Frame customizations or defaults
  const cardAccentBg = config.frame?.backgroundColor || '#FFE600';
  const cardAccentText = config.frame?.textColor || '#000000';
  const cardBorderColor = config.frame?.borderColor || '#000000';
  const hasDropShadow = config.shadow?.enabled ?? true;

  // QR inner container background
  const qrBgFill = config.background === 'transparent' ? '#FFFFFF' : config.background;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="geometricPrecision">
      <defs>
        <style>
          ${fontImport}
          .card-brand-title {
            font-family: ${fontFamily};
            font-weight: ${fontWeight};
            letter-spacing: ${letterSpacing}px;
          }
          .card-brand-cta {
            font-family: ${fontFamily};
            font-weight: ${fontWeight};
            letter-spacing: 1.2px;
          }
          .card-brand-tag {
            font-family: ${fontFamily};
          }
        </style>
      </defs>

      <!-- Card Hard Drop Shadow (Neo-brutalist) -->
      ${hasDropShadow ? `<rect x="22" y="22" width="${width - 32}" height="${height - 32}" rx="28" fill="#000000" />` : ''}

      <!-- Main Payment Card Body -->
      <rect x="14" y="14" width="${width - 32}" height="${height - 32}" rx="28" fill="#FFFFFF" stroke="${cardBorderColor}" stroke-width="4" />

      <!-- Corner Accents / Card Alignment Marks -->
      <path d="M 38 64 L 38 38 L 64 38" fill="none" stroke="${cardBorderColor}" stroke-width="3" stroke-linecap="round" />
      <path d="M ${width - 38} 64 L ${width - 38} 38 L ${width - 64} 38" fill="none" stroke="${cardBorderColor}" stroke-width="3" stroke-linecap="round" />
      <path d="M 38 ${height - 64} L 38 ${height - 38} L 64 ${height - 38}" fill="none" stroke="${cardBorderColor}" stroke-width="3" stroke-linecap="round" />
      <path d="M ${width - 38} ${height - 64} L ${width - 38} ${height - 38} L ${width - 64} ${height - 38}" fill="none" stroke="${cardBorderColor}" stroke-width="3" stroke-linecap="round" />

      <!-- Top Header Area -->
      <!-- Merchant / Payment Pill Badge -->
      <g transform="translate(${width / 2 - 105}, 42)">
        <rect x="0" y="0" width="210" height="32" rx="16" fill="${cardAccentBg}" stroke="${cardBorderColor}" stroke-width="2.5" />
        <path d="M 28 16 A 5 5 0 0 1 28 10 M 33 19 A 9 9 0 0 1 33 7 M 38 22 A 13 13 0 0 1 38 4" fill="none" stroke="${cardAccentText}" stroke-width="2" stroke-linecap="round" />
        <text x="118" y="21" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="11" fill="${cardAccentText}" letter-spacing="1.5px">MERCHANT QR CARD</text>
      </g>

      <!-- User QR Name / Title (uses selected typography) -->
      <text x="${width / 2}" y="114" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${nameFontSize}" fill="#000000" letter-spacing="${letterSpacing}px">
        ${displayName}
      </text>

      <!-- Subtitle Tag Under Name -->
      <text x="${width / 2}" y="136" text-anchor="middle" font-family="${fontFamily}" font-weight="700" font-size="11" fill="#6B7280" letter-spacing="1px">
        ${displayTag}
      </text>

      <!-- Top Divider Line -->
      <line x1="52" y1="156" x2="${width - 52}" y2="156" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="6,6" />

      <!-- Center QR Stage Frame -->
      <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="20" fill="${qrBgFill}" stroke="${cardBorderColor}" stroke-width="3" />

      <!-- Embedded QR SVG -->
      <g transform="translate(${qrX}, ${qrY})">
        ${innerQRSvg}
      </g>

      <!-- Bottom Divider Line -->
      <line x1="52" y1="655" x2="${width - 52}" y2="655" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="6,6" />

      <!-- Bottom Call To Action Pill: Scan to Pay / Custom CTA -->
      <g transform="translate(${width / 2 - 145}, 674)">
        ${hasDropShadow ? `<rect x="4" y="4" width="290" height="50" rx="25" fill="#000000" />` : ''}
        <rect x="0" y="0" width="290" height="50" rx="25" fill="${cardAccentBg}" stroke="${cardBorderColor}" stroke-width="2.5" />
        <text x="145" y="31" text-anchor="middle" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="16" fill="${cardAccentText}" letter-spacing="1.2px">
          ${displaySubtitle}
        </text>
      </g>

      <!-- Bottom Explanatory Guidance -->
      <text x="${width / 2}" y="752" text-anchor="middle" font-family="${fontFamily}" font-weight="700" font-size="12" fill="#374151">
        Buka kamera smartphone atau aplikasi pembayaran untuk scan
      </text>
      <text x="${width / 2}" y="772" text-anchor="middle" font-family="${fontFamily}" font-weight="600" font-size="10" fill="#9CA3AF" letter-spacing="0.8px">
        SUPPORTS ALL CAMERA, MOBILE BANKING &amp; E-WALLET APPS
      </text>

      <!-- Security / Certified Authentic Mark -->
      <g transform="translate(${width / 2 - 95}, 802)">
        <path d="M 0 3 L 7 0 L 14 3 L 14 8 Q 14 13 7 16 Q 0 13 0 8 Z" fill="#70EE9C" stroke="#000000" stroke-width="1.5" />
        <path d="M 4 8 L 6 10 L 10 6" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <text x="22" y="12" font-family="${fontFamily}" font-weight="800" font-size="9.5" fill="#6B7280" letter-spacing="1.2px">
          SECURE HIGH RESOLUTION QR
        </text>
      </g>
    </svg>
  `.trim();
}
