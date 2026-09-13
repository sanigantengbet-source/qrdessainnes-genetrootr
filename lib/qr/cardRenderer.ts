import { CardTheme } from '@/types/cardTheme';
import { QRDesignConfig } from '@/types/qr';
import { generateQRSVG } from './engine';
import { loadGoogleFontInDocument, getGoogleFontSvgImport } from './fonts';

export interface RenderCardThemeOptions {
  payload: string;
  config: QRDesignConfig;
  theme: CardTheme;
  qrName?: string;
  cardSubtitle?: string;
  idPrefix?: string;
}

function escapeXML(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate decorative SVG layer based on theme decoration type
 */
function renderThemeDecorationSVG(theme: CardTheme, width: number, height: number): string {
  const dec = theme.decoration;
  const pCol = dec.primaryColor || '#FFE600';
  const sCol = dec.secondaryColor || '#FF5E5B';
  const aCol = dec.accentColor || '#FFFFFF';

  switch (dec.type) {
    case 'waves-dual': {
      // Coral & Yellow fluid curves (as in uploaded Image 1 & 3)
      return `
        <!-- Fluid Wave Top/Left -->
        <path d="M 14 14 Q 160 30 220 120 T 140 280 Q 80 340 14 360 Z" fill="${pCol}" opacity="0.95" />
        <!-- Fluid Wave Bottom/Right -->
        <path d="M ${width - 14} ${height - 14} Q ${width - 140} ${height - 40} ${width - 180} ${height - 180} T ${width - 80} ${height - 320} L ${width - 14} ${height - 320} Z" fill="${sCol}" opacity="0.95" />
        <!-- Floating Accent Circles -->
        <circle cx="60" cy="90" r="14" fill="${aCol}" opacity="0.8" />
        <circle cx="${width - 70}" cy="110" r="22" fill="${pCol}" opacity="0.3" stroke="#000000" stroke-width="2" />
        <circle cx="${width - 50}" cy="${height - 90}" r="16" fill="${aCol}" opacity="0.8" />
        <circle cx="90" cy="${height - 70}" r="28" fill="${sCol}" opacity="0.25" />
        <!-- Quotation Accent Mark (Image 1 top left) -->
        <g transform="translate(48, 48)">
          <path d="M 0 16 C 0 8 4 0 14 0 L 14 6 C 8 6 6 10 6 16 L 14 16 L 14 26 L 0 26 Z M 18 16 C 18 8 22 0 32 0 L 32 6 C 26 6 24 10 24 16 L 32 16 L 32 26 L 18 26 Z" fill="#000000" />
        </g>
      `;
    }

    case 'waves-corner': {
      // Sweeping corner liquid curves
      return `
        <path d="M 14 14 L ${width * 0.65} 14 C ${width * 0.5} 120, ${width * 0.3} 180, 14 210 Z" fill="${sCol}" />
        <path d="M 14 14 L ${width * 0.45} 14 C ${width * 0.35} 90, ${width * 0.2} 140, 14 160 Z" fill="${pCol}" />
        <path d="M ${width - 14} ${height - 14} L ${width * 0.35} ${height - 14} C ${width * 0.5} ${height - 130}, ${width * 0.75} ${height - 190}, ${width - 14} ${height - 210} Z" fill="${pCol}" />
        <circle cx="${width - 80}" cy="${height - 80}" r="24" fill="${aCol}" stroke="#000000" stroke-width="2.5" />
        <circle cx="${width - 80}" cy="${height - 80}" r="12" fill="${sCol}" />
      `;
    }

    case 'organic-blobs': {
      // Multi-layer pastel/vibrant organic blobs (uploaded Image 2)
      return `
        <!-- Top Organic Blobs -->
        <path d="M 14 14 L 280 14 C 320 80, 290 160, 210 180 C 130 200, 70 260, 14 240 Z" fill="${pCol}" opacity="0.9" />
        <path d="M ${width - 14} 14 L ${width - 240} 14 C ${width - 290} 70, ${width - 260} 140, ${width - 180} 180 C ${width - 90} 220, ${width - 20} 260, ${width - 14} 240 Z" fill="${sCol}" opacity="0.85" />
        <!-- Bottom Blobs -->
        <path d="M 14 ${height - 14} L 240 ${height - 14} C 260 ${height - 90}, 200 ${height - 160}, 140 ${height - 180} C 60 ${height - 200}, 20 ${height - 240}, 14 ${height - 240} Z" fill="${sCol}" opacity="0.85" />
        <path d="M ${width - 14} ${height - 14} L ${width - 260} ${height - 14} C ${width - 290} ${height - 80}, ${width - 230} ${height - 150}, ${width - 160} ${height - 170} C ${width - 80} ${height - 190}, ${width - 20} ${height - 230}, ${width - 14} ${height - 230} Z" fill="${pCol}" opacity="0.9" />
        <!-- Ring accents -->
        <circle cx="75" cy="${height - 75}" r="28" fill="none" stroke="#FFFFFF" stroke-width="4" />
        <circle cx="${width - 75}" cy="75" r="24" fill="none" stroke="#FFFFFF" stroke-width="4" />
      `;
    }

    case 'diagonal-stripes': {
      // Sharp modern angular color cuts (uploaded Image 4)
      return `
        <!-- Diagonal Header Polygon -->
        <polygon points="14,14 ${width - 14},14 ${width - 14},180 14,260" fill="${pCol}" />
        <polygon points="14,14 ${width * 0.55},14 14,210" fill="${sCol}" opacity="0.9" />
        <!-- Diagonal Footer Polygon -->
        <polygon points="14,${height - 180} ${width - 14},${height - 260} ${width - 14},${height - 14} 14,${height - 14}" fill="${pCol}" />
        <polygon points="${width * 0.45},${height - 14} ${width - 14},${height - 210} ${width - 14},${height - 14}" fill="${sCol}" opacity="0.9" />
        <!-- Dot row accent -->
        <circle cx="${width - 120}" cy="${height - 45}" r="6" fill="#FFFFFF" />
        <circle cx="${width - 95}" cy="${height - 45}" r="6" fill="#FFFFFF" />
        <circle cx="${width - 70}" cy="${height - 45}" r="6" fill="#FFFFFF" />
      `;
    }

    case 'checkin-badge': {
      // Table Standee with prominent badge and geometric stars (Image 3)
      return `
        <!-- Curving soft background wave -->
        <path d="M 14 180 Q ${width / 2} 240 ${width - 14} 180 L ${width - 14} ${height - 14} L 14 ${height - 14} Z" fill="${pCol}" opacity="0.35" />
        <!-- Top ring symbol -->
        <circle cx="65" cy="85" r="22" fill="none" stroke="#000000" stroke-width="5" />
        <!-- Bottom square symbol -->
        <rect x="50" y="${height - 110}" width="40" height="40" fill="none" stroke="#000000" stroke-width="4.5" />
        <!-- Diamond accents -->
        <path d="M ${width - 70} 110 L ${width - 60} 95 L ${width - 50} 110 L ${width - 60} 125 Z" fill="#000000" />
        <path d="M ${width - 70} 150 L ${width - 60} 135 L ${width - 50} 150 L ${width - 60} 165 Z" fill="#000000" />
      `;
    }

    case 'corner-brackets': {
      // Modern scannable viewfinder corner brackets
      const bLen = 32;
      const bPad = 38;
      const col = dec.primaryColor || '#000000';
      return `
        <path d="M ${bPad} ${bPad + bLen} L ${bPad} ${bPad} L ${bPad + bLen} ${bPad}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" />
        <path d="M ${width - bPad} ${bPad + bLen} L ${width - bPad} ${bPad} L ${width - bPad - bLen} ${bPad}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" />
        <path d="M ${bPad} ${height - bPad - bLen} L ${bPad} ${height - bPad} L ${bPad + bLen} ${height - bPad}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" />
        <path d="M ${width - bPad} ${height - bPad - bLen} L ${width - bPad} ${height - bPad} L ${width - bPad - bLen} ${height - bPad}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" />
      `;
    }

    case 'geometric-accents': {
      return `
        <circle cx="50" cy="50" r="18" fill="none" stroke="${pCol}" stroke-width="3" stroke-dasharray="4,4" />
        <path d="M ${width - 60} 45 L ${width - 45} 45 M ${width - 52.5} 37.5 L ${width - 52.5} 52.5" stroke="${pCol}" stroke-width="3" stroke-linecap="round" />
        <circle cx="${width - 55}" cy="${height - 55}" r="12" fill="${sCol}" opacity="0.6" />
        <rect x="42" y="${height - 65}" width="22" height="22" fill="none" stroke="${pCol}" stroke-width="2.5" transform="rotate(45, 53, ${height - 54})" />
      `;
    }

    case 'dots-matrix': {
      let dots = '';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          dots += `<circle cx="${45 + c * 14}" cy="${45 + r * 14}" r="2.5" fill="${pCol}" opacity="0.4" />`;
          dots += `<circle cx="${width - 100 + c * 14}" cy="${height - 90 + r * 14}" r="2.5" fill="${pCol}" opacity="0.4" />`;
        }
      }
      return dots;
    }

    default:
      return '';
  }
}

/**
 * Main QR Card Theme SVG Generator
 * Generates high-fidelity SVG combining:
 * - Selected Card Theme (100+ themes, distinct shapes, waves, badges, colors)
 * - User's customized QR (any dot pattern, corners, colors, logo)
 * - Dynamic QR Name, custom CTA, security verification badge
 */
export function generateQRCardWithThemeSVG(options: RenderCardThemeOptions): string {
  const { payload, config, theme } = options;
  const rawQrName = (options.qrName || 'SANN STORE').trim();
  const rawSubtitle = (options.cardSubtitle || theme.footer.ctaText || 'SCAN ME').trim();
  const idPrefix = options.idPrefix || `card-${theme.id}`;

  const width = theme.dimensions.width;
  const height = theme.dimensions.height;

  // Typography parameters
  const typography = config.typography;
  const fontFamily = typography?.fontFamily || theme.header.fontFamily || "'Space Grotesk', sans-serif";
  const fontWeight = typography?.fontWeight || '900';
  let letterSpacing = typography?.letterSpacing ?? 1.5;
  const textTransform = typography?.textTransform || 'uppercase';

  loadGoogleFontInDocument(fontFamily);
  const fontImport = getGoogleFontSvgImport(fontFamily);

  const displayName = textTransform === 'uppercase'
    ? escapeXML(rawQrName || 'MY QR CODE').toUpperCase()
    : escapeXML(rawQrName || 'My QR Code');

  // CTA Text
  const ctaText = (config.frame?.text || rawSubtitle).trim();
  const displayCTA = textTransform === 'uppercase'
    ? escapeXML(ctaText).toUpperCase()
    : escapeXML(ctaText);

  // Dynamic font sizing for merchant / QR name
  let nameFontSize = theme.header.fontSize || (width <= 600 ? 24 : 28);
  if (displayName.length > 25) {
    nameFontSize = Math.round(nameFontSize * 0.65);
    letterSpacing = Math.min(letterSpacing, 0.8);
  } else if (displayName.length > 18) {
    nameFontSize = Math.round(nameFontSize * 0.78);
    letterSpacing = Math.min(letterSpacing, 1.2);
  } else if (displayName.length > 13) {
    nameFontSize = Math.round(nameFontSize * 0.88);
  }

  // QR Container Sizing & Coordinates
  const qrBoxSize = theme.qrContainer.size;
  const qrBoxX = (width - qrBoxSize) / 2;

  // Calculate vertical placement based on layout type
  let qrBoxY = theme.qrContainer.yOffset;
  if (qrBoxY === undefined) {
    if (theme.layout === 'center-standard' || theme.layout === 'gold-luxury' || theme.layout === 'brutalist-block' || theme.layout === 'cyber-grid' || theme.layout === 'minimal-clean') {
      qrBoxY = 175;
    } else if (theme.layout === 'fluid-wave-bottom' || theme.layout === 'organic-blob') {
      qrBoxY = (height - qrBoxSize) / 2 + 30;
    } else if (theme.layout === 'badge-vertical') {
      qrBoxY = 230;
    } else {
      qrBoxY = 180;
    }
  }

  // Inner QR rendering (smaller than container to have safe padding)
  const qrInnerPadding = theme.qrContainer.padding || 18;
  const qrInnerSize = qrBoxSize - qrInnerPadding * 2;
  const qrX = qrBoxX + qrInnerPadding;
  const qrY = qrBoxY + qrInnerPadding;

  // Generate the core QR SVG with user customizations: dots, corners, gradient, logo, quietZone
  const innerQRSvg = generateQRSVG({
    payload,
    config,
    qrName: rawQrName,
    renderSize: qrInnerSize,
    idPrefix: `${idPrefix}-core`,
    omitFrame: true,
  });

  // Card shadow markup
  const shadowMarkup = theme.cardShadow && theme.cardShadow.offsetX > 0
    ? `<rect x="${14 + theme.cardShadow.offsetX}" y="${14 + theme.cardShadow.offsetY}" width="${width - 28}" height="${height - 28}" rx="${theme.cardBorder.radius}" fill="${theme.cardShadow.color}" />`
    : '';

  // Theme decorative graphics
  const decorationSVG = renderThemeDecorationSVG(theme, width, height);

  // Custom image background calculation
  const customImg = theme.customBackgroundImage;
  const zoom = theme.customImageSettings?.zoom || 1;
  const cropX = theme.customImageSettings?.cropX ?? 50;
  const cropY = theme.customImageSettings?.cropY ?? 50;
  const overlayOpacity = theme.customImageSettings?.overlayOpacity ?? 0;
  const overlayColor = theme.customImageSettings?.overlayColor || '#000000';
  const surfaceW = width - 28;
  const surfaceH = height - 28;
  const imgW = surfaceW * zoom;
  const imgH = surfaceH * zoom;
  const imgX = 14 - (imgW - surfaceW) * (cropX / 100);
  const imgY = 14 - (imgH - surfaceH) * (cropY / 100);
  const cardClipId = `${idPrefix}-card-inner-clip`;

  // Top header badge
  const showBadge = !!theme.header.badgeText;
  const badgeText = escapeXML(theme.header.badgeText || '');
  const badgeBg = theme.header.badgeBg || '#FFE600';
  const badgeTextColor = theme.header.badgeTextColor || '#000000';
  const badgeBorderColor = theme.header.badgeBorderColor || theme.cardBorder.color;

  // Header alignment
  const textAlign = theme.header.align || 'center';
  const textX = textAlign === 'center' ? width / 2 : textAlign === 'left' ? 52 : width - 52;
  const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'left' ? 'start' : 'end';

  // Subtitle tag under name
  const displaySubtext = config.frame?.subtext
    ? escapeXML(config.frame.subtext).toUpperCase()
    : 'SCANNABLE HIGH RESOLUTION QR CARD';

  // CTA Button Sizing & Placement
  const ctaBtnW = Math.min(320, width - 100);
  const ctaBtnH = 50;
  const ctaBtnX = (width - ctaBtnW) / 2;
  const ctaBtnY = qrBoxY + qrBoxSize + 22;
  const ctaBg = theme.footer.ctaBg || '#FFE600';
  const ctaTextColor = theme.footer.ctaTextColor || '#000000';
  const ctaRadius = theme.footer.ctaRadius ?? 25;
  const ctaBorder = theme.footer.ctaBorderColor || theme.cardBorder.color;

  // Security badge markup
  const showSec = theme.footer.showSecurityBadge ?? (height >= 800);
  const secY = height - 55;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="geometricPrecision">
      <defs>
        <style>
          ${fontImport}
          .theme-title {
            font-family: ${fontFamily};
            font-weight: ${fontWeight};
            letter-spacing: ${letterSpacing}px;
          }
          .theme-cta {
            font-family: ${fontFamily};
            font-weight: ${fontWeight};
            letter-spacing: 1.2px;
          }
          .theme-badge {
            font-family: ${fontFamily};
            font-weight: 800;
            letter-spacing: 1.2px;
          }
        </style>
        ${
          customImg
            ? `<clipPath id="${cardClipId}">
                <rect x="14" y="14" width="${surfaceW}" height="${surfaceH}" rx="${theme.cardBorder.radius}" />
              </clipPath>`
            : ''
        }
      </defs>

      <!-- Card Shadow -->
      ${shadowMarkup}

      <!-- Main Card Surface -->
      <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="${theme.cardBorder.radius}" fill="${theme.cardBg}" stroke="${theme.cardBorder.color}" stroke-width="${theme.cardBorder.width}" />

      <!-- Custom Uploaded Background Image (if active) -->
      ${
        customImg
          ? `
        <g clip-path="url(#${cardClipId})">
          <image href="${customImg}" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="xMidYMid slice" />
          ${
            overlayOpacity > 0
              ? `<rect x="14" y="14" width="${surfaceW}" height="${surfaceH}" fill="${overlayColor}" opacity="${overlayOpacity}" />`
              : ''
          }
        </g>
      `
          : ''
      }

      <!-- Decorative Vector Layers -->
      ${!customImg ? decorationSVG : ''}

      <!-- Top Header Badge (if enabled) -->
      ${
        showBadge
          ? `
        <g transform="translate(${width / 2 - 110}, 38)">
          <rect x="0" y="0" width="220" height="30" rx="15" fill="${badgeBg}" stroke="${badgeBorderColor}" stroke-width="2" />
          <text x="110" y="20" text-anchor="middle" class="theme-badge" font-size="10.5" fill="${badgeTextColor}">
            ${badgeText}
          </text>
        </g>
      `
          : ''
      }

      <!-- User QR Name / Title -->
      <text x="${textX}" y="${showBadge ? 108 : 78}" text-anchor="${textAnchor}" class="theme-title" font-size="${nameFontSize}" fill="${theme.header.titleColor}">
        ${displayName}
      </text>

      <!-- Subtitle Tag Under Name (or Category Tag) -->
      <text x="${textX}" y="${showBadge ? 130 : 100}" text-anchor="${textAnchor}" font-family="${fontFamily}" font-weight="700" font-size="10.5" fill="${theme.header.subtitleColor}" letter-spacing="1px">
        ${displaySubtext}
      </text>

      <!-- QR Container Stage Frame -->
      ${
        theme.qrContainer.shadow
          ? `<rect x="${qrBoxX + 6}" y="${qrBoxY + 6}" width="${qrBoxSize}" height="${qrBoxSize}" rx="${theme.qrContainer.radius}" fill="#000000" />`
          : ''
      }
      <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="${theme.qrContainer.radius}" fill="${theme.qrContainer.bg}" stroke="${theme.qrContainer.border}" stroke-width="${theme.qrContainer.borderWidth}" />

      <!-- Embedded Customized QR SVG -->
      <g transform="translate(${qrX}, ${qrY})">
        ${innerQRSvg}
      </g>

      <!-- Bottom Call To Action Pill / Banner -->
      ${
        ctaBtnY + ctaBtnH < height - 70
          ? `
        <g transform="translate(${ctaBtnX}, ${ctaBtnY})">
          <rect x="4" y="4" width="${ctaBtnW}" height="${ctaBtnH}" rx="${ctaRadius}" fill="#000000" opacity="0.8" />
          <rect x="0" y="0" width="${ctaBtnW}" height="${ctaBtnH}" rx="${ctaRadius}" fill="${ctaBg}" stroke="${ctaBorder}" stroke-width="2.5" />
          <text x="${ctaBtnW / 2}" y="31" text-anchor="middle" class="theme-cta" font-size="15" fill="${ctaTextColor}">
            ${displayCTA}
          </text>
        </g>
      `
          : ''
      }

      <!-- Bottom Explanatory Guidance -->
      ${
        height >= 800
          ? `
        <text x="${width / 2}" y="${ctaBtnY + 80}" text-anchor="middle" font-family="${fontFamily}" font-weight="700" font-size="11.5" fill="${theme.footer.hintColor || '#4B5563'}">
          ${escapeXML(theme.footer.hintText || 'Buka kamera smartphone untuk memindai kode QR')}
        </text>
        <text x="${width / 2}" y="${ctaBtnY + 98}" text-anchor="middle" font-family="${fontFamily}" font-weight="600" font-size="9.5" fill="${theme.footer.subTextColor || '#9CA3AF'}" letter-spacing="0.8px">
          ${escapeXML(theme.footer.subText || 'SUPPORTS ALL SMARTPHONES & E-WALLET APPS')}
        </text>
      `
          : ''
      }

      <!-- Security / Certified Authentic Mark -->
      ${
        showSec
          ? `
        <g transform="translate(${width / 2 - 95}, ${secY})">
          <path d="M 0 3 L 7 0 L 14 3 L 14 8 Q 14 13 7 16 Q 0 13 0 8 Z" fill="#70EE9C" stroke="#000000" stroke-width="1.5" />
          <path d="M 4 8 L 6 10 L 10 6" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <text x="22" y="12" font-family="${fontFamily}" font-weight="800" font-size="9" fill="${theme.footer.subTextColor || '#6B7280'}" letter-spacing="1px">
            AUTHENTIC SCANNABLE CARD
          </text>
        </g>
      `
          : ''
      }
    </svg>
  `.trim();
}

const MINI_THEME_PREVIEW_CACHE = new Map<string, string>();

/**
 * Lightweight, instant Miniature Preview Generator for the Card Theme Selector Grid.
 * Renders an authentic miniature vector card with sample QR so all 100+ cards
 * load instantaneously with 0 lag. Memoized per theme to avoid recomputations.
 */
export function renderCardThemeMiniPreviewSVG(theme: CardTheme, sampleTitle: string = 'SANN STORE'): string {
  const cacheKey = `${theme.id}_${theme.customBackgroundImage ? 'custom' : 'preset'}_${theme.cardBg}`;
  if (MINI_THEME_PREVIEW_CACHE.has(cacheKey)) {
    return MINI_THEME_PREVIEW_CACHE.get(cacheKey)!;
  }

  const w = theme.dimensions.width;
  const h = theme.dimensions.height;

  // Miniature sample QR matrix blocks
  const qrSize = theme.qrContainer.size;
  const qrX = (w - qrSize) / 2;
  const qrY = theme.qrContainer.yOffset !== undefined
    ? theme.qrContainer.yOffset
    : (theme.layout === 'fluid-wave-bottom' || theme.layout === 'organic-blob')
    ? (h - qrSize) / 2 + 30
    : 175;

  const decoration = renderThemeDecorationSVG(theme, w, h);
  const title = escapeXML(sampleTitle);
  const badge = escapeXML(theme.header.badgeText || 'SCAN ME');

  const result = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" shape-rendering="geometricPrecision">
      <defs>
        ${
          theme.customBackgroundImage
            ? `<clipPath id="mini-clip-${theme.id}">
                <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="${theme.cardBorder.radius}" />
              </clipPath>`
            : ''
        }
      </defs>
      <!-- Shadow -->
      ${
        theme.cardShadow && theme.cardShadow.offsetX > 0
          ? `<rect x="${14 + theme.cardShadow.offsetX}" y="${14 + theme.cardShadow.offsetY}" width="${w - 28}" height="${h - 28}" rx="${theme.cardBorder.radius}" fill="${theme.cardShadow.color}" />`
          : ''
      }
      <!-- Card Bg -->
      <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="${theme.cardBorder.radius}" fill="${theme.cardBg}" stroke="${theme.cardBorder.color}" stroke-width="${theme.cardBorder.width}" />
      ${
        theme.customBackgroundImage
          ? `<g clip-path="url(#mini-clip-${theme.id})">
              <image href="${theme.customBackgroundImage}" x="14" y="14" width="${w - 28}" height="${h - 28}" preserveAspectRatio="xMidYMid slice" />
              ${
                (theme.customImageSettings?.overlayOpacity || 0) > 0
                  ? `<rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="${theme.customImageSettings?.overlayColor || '#000000'}" opacity="${theme.customImageSettings?.overlayOpacity || 0}" />`
                  : ''
              }
            </g>`
          : decoration
      }

      <!-- Header Badge -->
      ${
        theme.header.badgeText
          ? `<rect x="${w / 2 - 90}" y="38" width="180" height="26" rx="13" fill="${theme.header.badgeBg || '#FFE600'}" stroke="${theme.cardBorder.color}" stroke-width="2" />
             <text x="${w / 2}" y="55" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="11" fill="${theme.header.badgeTextColor || '#000000'}">${badge}</text>`
          : ''
      }

      <!-- Title -->
      <text x="${w / 2}" y="${theme.header.badgeText ? 105 : 85}" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="${theme.header.titleColor}" letter-spacing="1.5px">
        ${title}
      </text>

      <!-- QR Box -->
      <rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="${theme.qrContainer.radius}" fill="${theme.qrContainer.bg}" stroke="${theme.qrContainer.border}" stroke-width="${theme.qrContainer.borderWidth}" />

      <!-- Stylized Sample QR Matrix inside mini preview -->
      <g transform="translate(${qrX + qrSize * 0.1}, ${qrY + qrSize * 0.1}) scale(${qrSize * 0.8 / 100})">
        <!-- Top Left Corner -->
        <rect x="0" y="0" width="28" height="28" rx="6" fill="#000000" />
        <rect x="5" y="5" width="18" height="18" rx="4" fill="#FFFFFF" />
        <rect x="9" y="9" width="10" height="10" rx="2" fill="#000000" />

        <!-- Top Right Corner -->
        <rect x="72" y="0" width="28" height="28" rx="6" fill="#000000" />
        <rect x="77" y="5" width="18" height="18" rx="4" fill="#FFFFFF" />
        <rect x="81" y="9" width="10" height="10" rx="2" fill="#000000" />

        <!-- Bottom Left Corner -->
        <rect x="0" y="72" width="28" height="28" rx="6" fill="#000000" />
        <rect x="5" y="77" width="18" height="18" rx="4" fill="#FFFFFF" />
        <rect x="9" y="81" width="10" height="10" rx="2" fill="#000000" />

        <!-- Mock data bits -->
        <circle cx="42" cy="14" r="4" fill="#000000" />
        <circle cx="56" cy="14" r="4" fill="#000000" />
        <circle cx="42" cy="28" r="4" fill="#000000" />
        <circle cx="56" cy="28" r="4" fill="#000000" />
        <circle cx="14" cy="42" r="4" fill="#000000" />
        <circle cx="28" cy="42" r="4" fill="#000000" />
        <circle cx="42" cy="42" r="4" fill="#000000" />
        <circle cx="56" cy="42" r="4" fill="#000000" />
        <circle cx="72" cy="42" r="4" fill="#000000" />
        <circle cx="86" cy="42" r="4" fill="#000000" />
        <circle cx="14" cy="56" r="4" fill="#000000" />
        <circle cx="28" cy="56" r="4" fill="#000000" />
        <circle cx="42" cy="56" r="4" fill="#000000" />
        <circle cx="56" cy="56" r="4" fill="#000000" />
        <circle cx="72" cy="56" r="4" fill="#000000" />
        <circle cx="86" cy="56" r="4" fill="#000000" />
        <circle cx="42" cy="72" r="4" fill="#000000" />
        <circle cx="56" cy="72" r="4" fill="#000000" />
        <circle cx="42" cy="86" r="4" fill="#000000" />
        <circle cx="56" cy="86" r="4" fill="#000000" />
        <circle cx="72" cy="86" r="4" fill="#000000" />
        <circle cx="86" cy="86" r="4" fill="#000000" />
      </g>

      <!-- Bottom CTA Pill -->
      <g transform="translate(${w / 2 - 120}, ${qrY + qrSize + 22})">
        <rect x="0" y="0" width="240" height="42" rx="${theme.footer.ctaRadius ?? 21}" fill="${theme.footer.ctaBg || '#FFE600'}" stroke="${theme.cardBorder.color}" stroke-width="2" />
        <text x="120" y="26" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="13" fill="${theme.footer.ctaTextColor || '#000000'}">
          ${escapeXML(theme.footer.ctaText || 'SCAN ME')}
        </text>
      </g>
    </svg>
  `.trim();

  MINI_THEME_PREVIEW_CACHE.set(cacheKey, result);
  return result;
}
