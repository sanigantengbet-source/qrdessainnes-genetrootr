export type CardCategory =
  | 'Payment'
  | 'Business'
  | 'Fluid & Organic'
  | 'Abstract & Geometric'
  | 'Modern'
  | 'Minimal'
  | 'Luxury & Gold'
  | 'Pastel & Soft'
  | 'Tech & Cyber'
  | 'Neo-Brutalist'
  | 'Restaurant & Cafe'
  | 'Event & Pass'
  | 'Creative & Pop'
  | 'Dark & Neon';

export type CardLayoutType =
  | 'center-standard'       // Title top, QR center, CTA bottom (QRIS/Payment card)
  | 'fluid-wave-bottom'    // Fluid waves top/corners, QR lower center (image 1 & 2)
  | 'fluid-wave-top'       // Fluid waves bottom/sides, QR upper center
  | 'diagonal-split'       // Angled color blocks top/bottom (image 4)
  | 'badge-vertical'       // Standee / Table check-in badge (image 3)
  | 'organic-blob'         // Multi-color organic blobs framing the QR
  | 'minimal-clean'        // Clean generous whitespace, refined typography
  | 'cyber-grid'           // Matrix/cyber gridlines and HUD accents
  | 'brutalist-block'      // Heavy black borders, offset hard shadows, stickers
  | 'split-side'           // Side-by-side or asymmetrical layout
  | 'gold-luxury'          // Double metallic borders and ornate serif header
  | 'ticket-pass'          // Event pass with punch-hole notches and scan stamp
  | 'cafe-retro';          // Warm retro palette with artisan badge

export interface CardThemeDecoration {
  type:
    | 'waves-dual'         // Coral & Yellow fluid curves (as in uploaded images)
    | 'waves-corner'       // Fluid waves flowing from opposite corners
    | 'organic-blobs'      // Multi-layer organic colorful blobs
    | 'diagonal-stripes'   // Sharp diagonal color blocking
    | 'corner-brackets'    // Scannable HUD target brackets
    | 'geometric-accents'  // Circles, crosses, quote marks, diamonds
    | 'dots-matrix'        // Decorative dot array in corners
    | 'neon-glow'          // Vibrant radial light ambient glow
    | 'checkin-badge'      // "CHECK IN" / "VISIT US" top badge stand
    | 'retro-stripes'      // 80s/90s bold vibrant stripes
    | 'none';
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  detailColor?: string;
}

export interface CardTheme {
  id: string;
  name: string;
  category: CardCategory;
  description: string;
  layout: CardLayoutType;
  dimensions: {
    width: number;
    height: number;
  };
  cardBg: string;               // Card background color (e.g. #FFFFFF or hex)
  cardBgGradient?: {
    type: 'linear' | 'radial';
    stops: { offset: string; color: string; opacity?: number }[];
    angle?: number;
  };
  cardBorder: {
    color: string;
    width: number;
    radius: number;
  };
  cardShadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
  };
  qrContainer: {
    bg: string;
    border: string;
    borderWidth: number;
    radius: number;
    padding: number;
    shadow?: boolean;
    size: number;
    yOffset?: number;
  };
  header: {
    badgeText?: string;
    badgeBg?: string;
    badgeTextColor?: string;
    badgeBorderColor?: string;
    titleColor: string;
    subtitleColor: string;
    fontFamily?: string;
    fontSize?: number;
    align?: 'center' | 'left' | 'right';
  };
  footer: {
    ctaText?: string;
    ctaBg?: string;
    ctaTextColor?: string;
    ctaBorderColor?: string;
    ctaRadius?: number;
    hintText?: string;
    hintColor?: string;
    subText?: string;
    subTextColor?: string;
    showSecurityBadge?: boolean;
  };
  decoration: CardThemeDecoration;
  customBackgroundImage?: string;
  customImageSettings?: CustomImageSettings;
  isCustom?: boolean;
}

export interface CustomImageSettings {
  cropX: number; // 0 to 100 (horizontal offset percentage)
  cropY: number; // 0 to 100 (vertical offset percentage)
  zoom: number;  // 1.0 to 3.0
  ratio: 'portrait' | 'square'; // 'portrait' (640x880) | 'square' (640x640)
  overlayOpacity?: number; // 0 to 0.8
  overlayColor?: string; // e.g. '#000000' or '#FFFFFF'
}
