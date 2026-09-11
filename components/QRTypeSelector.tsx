'use client';

import React from 'react';
import {
  Link2,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  MapPin,
  UserSquare2,
  Calendar,
  Code2,
} from 'lucide-react';
import { QRType, QRTypeOption } from '@/types/qr';

interface QRTypeSelectorProps {
  selectedType: QRType;
  onSelectType: (type: QRType) => void;
}

export const QR_TYPE_OPTIONS: QRTypeOption[] = [
  { id: 'url', label: 'URL / Website', iconName: 'Link2', description: 'Open any website link', placeholder: 'https://' },
  { id: 'text', label: 'Plain Text', iconName: 'FileText', description: 'Raw textual notes or codes', placeholder: 'Enter text' },
  { id: 'whatsapp', label: 'WhatsApp', iconName: 'MessageCircle', description: 'Direct WhatsApp chat & message', placeholder: 'Phone & message' },
  { id: 'email', label: 'Email', iconName: 'Mail', description: 'Pre-filled email compose', placeholder: 'Recipient email' },
  { id: 'phone', label: 'Phone Call', iconName: 'Phone', description: 'Instant dial prompt', placeholder: 'Phone number' },
  { id: 'sms', label: 'SMS', iconName: 'MessageSquare', description: 'Send text message', placeholder: 'Recipient & message' },
  { id: 'wifi', label: 'Wi-Fi Network', iconName: 'Wifi', description: '1-tap auto connect Wi-Fi', placeholder: 'SSID & Password' },
  { id: 'location', label: 'Location / Maps', iconName: 'MapPin', description: 'Google Maps directions', placeholder: 'Coordinates / place' },
  { id: 'vcard', label: 'vCard / Contact', iconName: 'UserSquare2', description: 'Digital business contact card', placeholder: 'Name, phone, email' },
  { id: 'event', label: 'Calendar Event', iconName: 'Calendar', description: 'Add event to phone calendar', placeholder: 'Title & dates' },
  { id: 'custom', label: 'Custom Payload', iconName: 'Code2', description: 'Raw payload for devs', placeholder: 'Raw string' },
];

function getIcon(name: string) {
  switch (name) {
    case 'Link2':
      return <Link2 className="w-4 h-4" />;
    case 'FileText':
      return <FileText className="w-4 h-4" />;
    case 'MessageCircle':
      return <MessageCircle className="w-4 h-4" />;
    case 'Mail':
      return <Mail className="w-4 h-4" />;
    case 'Phone':
      return <Phone className="w-4 h-4" />;
    case 'MessageSquare':
      return <MessageSquare className="w-4 h-4" />;
    case 'Wifi':
      return <Wifi className="w-4 h-4" />;
    case 'MapPin':
      return <MapPin className="w-4 h-4" />;
    case 'UserSquare2':
      return <UserSquare2 className="w-4 h-4" />;
    case 'Calendar':
      return <Calendar className="w-4 h-4" />;
    case 'Code2':
    default:
      return <Code2 className="w-4 h-4" />;
  }
}

export default function QRTypeSelector({ selectedType, onSelectType }: QRTypeSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
          <span className="w-2.5 h-2.5 bg-black inline-block"></span>
          1. Select QR Code Type
        </label>
        <span className="text-[11px] font-bold text-neutral-600">
          {QR_TYPE_OPTIONS.find((t) => t.id === selectedType)?.label}
        </span>
      </div>

      {/* Horizontal scrolling ribbon on mobile, wrapping grid on desktop */}
      <div className="flex overflow-x-auto pb-2 gap-2 sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 no-scrollbar">
        {QR_TYPE_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectType(opt.id)}
              className={`flex-shrink-0 flex items-center sm:flex-col sm:justify-center gap-2 px-3 py-2 sm:py-2.5 border-2 border-black text-left sm:text-center transition-all min-w-[130px] sm:min-w-0 ${
                isSelected
                  ? 'bg-black text-[#FFE600] font-black shadow-[3px_3px_0px_0px_#FFE600] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-white text-black font-bold shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
              }`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center border border-black ${
                  isSelected ? 'bg-[#FFE600] text-black' : 'bg-[#FFFDF8] text-black'
                }`}
              >
                {getIcon(opt.iconName)}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-black truncate">{opt.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
