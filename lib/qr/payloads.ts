import { QRFormData, QRType } from '@/types/qr';

/**
 * Format date to iCalendar format (YYYYMMDDTHHmmssZ)
 */
function formatDateToICal(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Clean phone number for tel / wa / sms
 */
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Encode QR form data into compliant QR code standard strings
 */
export function encodeQRPayload(formData: QRFormData): string {
  const { type } = formData;

  switch (type) {
    case 'url': {
      let rawUrl = formData.urlData.url.trim();
      if (!rawUrl) return 'https://example.com';
      if (!/^https?:\/\//i.test(rawUrl)) {
        rawUrl = `https://${rawUrl}`;
      }
      return rawUrl;
    }

    case 'text': {
      return formData.textData.text || 'Hello World';
    }

    case 'whatsapp': {
      const phone = cleanPhoneNumber(formData.whatsAppData.phone).replace(/^\+/, '');
      const message = formData.whatsAppData.message ? encodeURIComponent(formData.whatsAppData.message) : '';
      if (!phone) return 'https://wa.me/';
      return message ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/${phone}`;
    }

    case 'email': {
      const { email, subject, body } = formData.emailData;
      if (!email) return 'mailto:info@example.com';
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (body) params.append('body', body);
      const query = params.toString();
      return query ? `mailto:${email}?${query}` : `mailto:${email}`;
    }

    case 'phone': {
      const phone = cleanPhoneNumber(formData.phoneData.phone);
      return `tel:${phone || '+1234567890'}`;
    }

    case 'sms': {
      const phone = cleanPhoneNumber(formData.smsData.phone);
      const msg = formData.smsData.message || '';
      return `smsto:${phone}:${msg}`;
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = formData.wiFiData;
      const cleanSSID = (ssid || 'Guest_WiFi').replace(/[\\;,:"]/g, '\\$&');
      const cleanPass = (password || '').replace(/[\\;,:"]/g, '\\$&');
      const secType = encryption === 'nopass' ? 'nopass' : encryption;
      return `WIFI:T:${secType};S:${cleanSSID};P:${cleanPass};H:${hidden ? 'true' : 'false'};;`;
    }

    case 'location': {
      const lat = formData.locationData.latitude.trim() || '0';
      const lng = formData.locationData.longitude.trim() || '0';
      const query = formData.locationData.query?.trim();
      if (query) {
        return `https://maps.google.com/local?q=${encodeURIComponent(query)}`;
      }
      return `https://maps.google.com/local?q=${lat},${lng}`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email, organization, jobTitle, website, address } = formData.vCardData;
      const fn = `${firstName} ${lastName}`.trim() || 'Contact';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName || ''};${firstName || ''};;;`,
        `FN:${fn}`,
        organization ? `ORG:${organization}` : '',
        jobTitle ? `TITLE:${jobTitle}` : '',
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        website ? `URL:${website}` : '',
        address ? `ADR;TYPE=WORK:;;${address};;;;` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'event': {
      const { title, startDate, endDate, location, description } = formData.eventData;
      const start = formatDateToICal(startDate);
      const end = formatDateToICal(endDate || startDate);
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${title || 'Calendar Event'}`,
        start ? `DTSTART:${start}` : '',
        end ? `DTEND:${end}` : '',
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'custom': {
      return formData.customData.payload || 'CUSTOM-QR-DATA';
    }

    default:
      return 'https://example.com';
  }
}
