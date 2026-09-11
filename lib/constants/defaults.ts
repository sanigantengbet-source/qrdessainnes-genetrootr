import { QRDesignConfig, QRFormData } from '@/types/qr';

export const DEFAULT_FORM_DATA: QRFormData = {
  type: 'url',
  qrName: 'SANN STORE',
  cardSubtitle: 'Scan to Pay',
  urlData: {
    url: 'https://mywebsite.com',
  },
  textData: {
    text: 'Hello from QR Design Generator!',
  },
  whatsAppData: {
    phone: '628123456789',
    message: 'Hello! I scanned your QR code and would like to connect.',
  },
  emailData: {
    email: 'hello@brandstudio.com',
    subject: 'VIP Inquiry',
    body: 'Hello, I reached out via your scannable QR code!',
  },
  phoneData: {
    phone: '+1 555-0199',
  },
  smsData: {
    phone: '+1 555-0199',
    message: 'Greetings! I scanned your contact QR code.',
  },
  wiFiData: {
    ssid: 'DesignStudio_Guest_5G',
    password: 'SuperSecureWiFi2028',
    encryption: 'WPA',
    hidden: false,
  },
  locationData: {
    latitude: '-6.2088',
    longitude: '106.8456',
    query: 'Jakarta Convention Center',
  },
  vCardData: {
    firstName: 'Alex',
    lastName: 'Morgan',
    phone: '+1 555-0199',
    email: 'alex@brandstudio.com',
    organization: 'Brand Studio Co.',
    jobTitle: 'Creative Director',
    website: 'https://brandstudio.com',
    address: '100 Market St, San Francisco, CA',
  },
  eventData: {
    title: 'Global Tech & Design Expo 2028',
    startDate: '2028-10-15T09:00',
    endDate: '2028-10-15T18:00',
    location: 'Grand Exhibition Hall 4',
    description: 'Keynotes, live prototyping workshops, and networking.',
  },
  customData: {
    payload: 'PRODUCT-SKU-99482-AUTH',
  },
};

export const DEFAULT_DESIGN_CONFIG: QRDesignConfig = {
  dotStyle: 'rounded',
  cornerSquareStyle: 'squircle',
  cornerDotStyle: 'rounded',
  foreground: '#000000',
  background: '#FFFFFF',
  gradient: {
    type: 'none',
    color1: '#000000',
    color2: '#2563EB',
    angle: 45,
  },
  pattern: {
    type: 'none',
    color: '#000000',
    opacity: 0.05,
  },
  frame: {
    id: 'frame-scan-me-bottom',
    style: 'pill-banner',
    text: 'SCAN ME',
    subtext: 'POINT CAMERA HERE',
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    borderColor: '#000000',
    borderWidth: 3,
    position: 'bottom',
    badgeIcon: 'QrCode',
  },
  typography: {
    fontId: 'f-space-grotesk',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  logo: {
    url: '',
    dataUrl: '',
    size: 20,
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    opacity: 1,
  },
  shadow: {
    enabled: true,
    color: '#000000',
    x: 4,
    y: 4,
    blur: 0,
  },
  quietZone: 4,
  errorCorrectionLevel: 'M',
  size: 420,
};
