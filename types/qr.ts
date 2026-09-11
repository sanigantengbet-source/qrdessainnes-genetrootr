export type QRType =
  | 'url'
  | 'text'
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'location'
  | 'vcard'
  | 'event'
  | 'custom';

export interface QRTypeOption {
  id: QRType;
  label: string;
  iconName: string;
  description: string;
  placeholder: string;
}

export interface QRDataURL {
  url: string;
}

export interface QRDataText {
  text: string;
}

export interface QRDataWhatsApp {
  phone: string;
  message: string;
}

export interface QRDataEmail {
  email: string;
  subject: string;
  body: string;
}

export interface QRDataPhone {
  phone: string;
}

export interface QRDataSMS {
  phone: string;
  message: string;
}

export interface QRDataWiFi {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface QRDataLocation {
  latitude: string;
  longitude: string;
  query?: string;
}

export interface QRDataVCard {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  jobTitle: string;
  website: string;
  address: string;
}

export interface QRDataEvent {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface QRDataCustom {
  payload: string;
}

export type QRFormData = {
  type: QRType;
  qrName: string;
  cardSubtitle?: string;
  urlData: QRDataURL;
  textData: QRDataText;
  whatsAppData: QRDataWhatsApp;
  emailData: QRDataEmail;
  phoneData: QRDataPhone;
  smsData: QRDataSMS;
  wiFiData: QRDataWiFi;
  locationData: QRDataLocation;
  vCardData: QRDataVCard;
  eventData: QRDataEvent;
  customData: QRDataCustom;
};

export type DotStyle =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded'
  | 'diamond'
  | 'star'
  | 'fluid'
  | 'vertical-lines'
  | 'horizontal-lines'
  | 'pixel'
  | 'cross'
  | 'heart';

export type CornerSquareStyle =
  | 'square'
  | 'rounded'
  | 'extra-rounded'
  | 'dot'
  | 'squircle'
  | 'double'
  | 'vintage'
  | 'diamond'
  | 'bold-angle'
  | 'pill';

export type CornerDotStyle =
  | 'square'
  | 'dot'
  | 'rounded'
  | 'diamond'
  | 'star'
  | 'cross'
  | 'heart';

export interface GradientConfig {
  type: 'none' | 'linear' | 'radial';
  color1: string;
  color2: string;
  angle: number; // 0 - 360
}

export interface PatternConfig {
  type: 'none' | 'dots' | 'grid' | 'diagonal' | 'cross' | 'waves';
  color: string;
  opacity: number;
}

export interface FrameConfig {
  id: string;
  style: string;
  text: string;
  subtext?: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  position: 'bottom' | 'top' | 'box' | 'badge' | 'polaroid' | 'banner' | 'tag' | 'neon' | 'brutalist';
  badgeIcon?: string;
}

export interface TypographyConfig {
  fontId: string;
  fontFamily: string;
  fontSize: number; // pt or scale factor
  fontWeight: string;
  letterSpacing: number; // px or em
  textTransform?: 'uppercase' | 'none' | 'capitalize';
}

export interface LogoConfig {
  url?: string;
  dataUrl?: string;
  size: number; // 10 to 30 percentage
  padding: number; // 0 to 12
  backgroundColor: string;
  borderRadius: number; // 0 = square, 50 = circle
  opacity: number;
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  x: number;
  y: number;
  blur: number;
}

export interface QRDesignConfig {
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  foreground: string;
  background: string;
  gradient?: GradientConfig;
  frame?: FrameConfig;
  typography?: TypographyConfig;
  logo?: LogoConfig;
  shadow?: ShadowConfig;
  pattern?: PatternConfig;
  quietZone: number; // 2 to 6 modules
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  size: number; // viewport size e.g. 400
}

export type StyleCategory =
  | 'Minimal'
  | 'Modern'
  | 'Classic'
  | 'Rounded'
  | 'Dot'
  | 'Pixel'
  | 'Diamond'
  | 'Star'
  | 'Soft'
  | 'Bold'
  | 'Luxury'
  | 'Corporate'
  | 'Glass'
  | 'Neon'
  | 'Futuristic'
  | 'Gaming'
  | 'Cute'
  | 'Elegant'
  | 'Retro'
  | 'Gradient'
  | 'Tech'
  | 'Geometric';

export interface StylePreset {
  id: string;
  name: string;
  category: StyleCategory;
  description: string;
  config: Partial<QRDesignConfig>;
  badgeText?: string;
}

export type FontCategory =
  | 'Sans'
  | 'Serif'
  | 'Display'
  | 'Handwritten'
  | 'Elegant'
  | 'Modern'
  | 'Bold'
  | 'Futuristic'
  | 'Monospace'
  | 'Retro'
  | 'Casual';

export interface FontDefinition {
  id: string;
  name: string;
  category: FontCategory;
  family: string;
  googleFont?: string;
}

export interface FramePreset {
  id: string;
  name: string;
  category: 'Popular' | 'Call to Action' | 'Brutalist' | 'Badges' | 'Retail & Menu' | 'Social' | 'Cards' | 'Events' | 'Minimal';
  text: string;
  subtext?: string;
  position: 'bottom' | 'top' | 'box' | 'badge' | 'polaroid' | 'banner' | 'tag' | 'neon' | 'brutalist';
  style: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  badgeIcon?: string;
}

export interface ReadabilityCheckResult {
  score: number; // 0 to 100
  status: 'excellent' | 'good' | 'warning' | 'critical';
  contrastRatio: number;
  isContrastPass: boolean;
  isInverted: boolean;
  logoCoveragePercent: number;
  isLogoSafe: boolean;
  quietZoneModules: number;
  isQuietZoneSafe: boolean;
  issues: string[];
  recommendations: string[];
}

export interface BatchQRItem {
  id: string;
  name: string;
  type?: QRType;
  payload: string;
  status?: 'pending' | 'ready' | 'error';
  error?: string;
}
