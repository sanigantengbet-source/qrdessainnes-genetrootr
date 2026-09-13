'use client';

import React from 'react';
import { slugifyFilename } from '@/lib/utils/slugify';
import { QRFormData, QRType } from '@/types/qr';
import { Tag, FileCode, CheckCircle2 } from 'lucide-react';

interface QRFormInputsProps {
  formData: QRFormData;
  onChange: (updater: (prev: QRFormData) => QRFormData) => void;
}

function QRFormInputsComponent({ formData, onChange }: QRFormInputsProps) {
  const { type, qrName } = formData;
  const sampleFilename = slugifyFilename(qrName || 'my-qr', 'png');

  return (
    <div className="w-full bg-white border-[3px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
      {/* QR Name Section */}
      <div className="space-y-2.5 pb-4 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 font-mono">
            <Tag className="w-3.5 h-3.5 text-[#0066FF]" />
            1. QR Name / Brand Title (Header Kartu)
          </label>
          <span className="text-[11px] font-mono font-bold bg-[#FFE600] px-2 py-0.5 border border-black text-black">
            File: {sampleFilename}
          </span>
        </div>
        <input
          type="text"
          value={qrName}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              qrName: e.target.value,
            }))
          }
          placeholder="e.g. SANN STORE or KOPI SENJA"
          className="w-full px-3 py-2 text-sm font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none focus:bg-[#FFE600]/10 focus:border-black shadow-[2px_2px_0px_0px_#000]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
              Card Call to Action (Bawah Kartu)
            </label>
            <input
              type="text"
              value={formData.cardSubtitle || 'Scan to Pay'}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  cardSubtitle: e.target.value,
                }))
              }
              placeholder="e.g. Scan to Pay"
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none focus:bg-[#FFE600]/10"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
              Pilihan Cepat CTA:
            </label>
            <div className="flex flex-wrap gap-1">
              {['Scan to Pay', 'Scan to Order', 'Scan Me', 'Scan & Connect'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      cardSubtitle: chip,
                    }))
                  }
                  className={`text-[10px] font-bold px-2 py-0.5 border border-black transition-all ${
                    (formData.cardSubtitle || 'Scan to Pay') === chip
                      ? 'bg-black text-[#FFE600]'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-neutral-600 font-medium">
          Ditampilkan di kartu QR saat download (seperti kartu QRIS/pembayaran modern) dan sebagai nama file.
        </p>
      </div>

      {/* Dynamic Type Fields */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 font-mono">
          <span className="w-2.5 h-2.5 bg-[#FF5E5B] inline-block"></span>
          2. Enter QR Data ({type.toUpperCase()})
        </label>

        {type === 'url' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800">Website URL</label>
            <input
              type="url"
              value={formData.urlData.url}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  urlData: { ...prev.urlData, url: e.target.value },
                }))
              }
              placeholder="https://example.com/promo"
              className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>
        )}

        {type === 'text' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800">Plain Text / Message</label>
            <textarea
              rows={3}
              value={formData.textData.text}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  textData: { text: e.target.value },
                }))
              }
              placeholder="Type any textual content or alphanumeric code..."
              className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>
        )}

        {type === 'whatsapp' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Phone Number (with Country Code)</label>
              <input
                type="tel"
                value={formData.whatsAppData.phone}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    whatsAppData: { ...prev.whatsAppData, phone: e.target.value },
                  }))
                }
                placeholder="628123456789 or 15551234"
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800">Pre-filled Message (Optional)</label>
              <textarea
                rows={2}
                value={formData.whatsAppData.message}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    whatsAppData: { ...prev.whatsAppData, message: e.target.value },
                  }))
                }
                placeholder="Hello! I found your QR code and would like more details..."
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
          </div>
        )}

        {type === 'email' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Recipient Email Address</label>
                <input
                  type="email"
                  value={formData.emailData.email}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      emailData: { ...prev.emailData, email: e.target.value },
                    }))
                  }
                  placeholder="contact@business.com"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Subject Line</label>
                <input
                  type="text"
                  value={formData.emailData.subject}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      emailData: { ...prev.emailData, subject: e.target.value },
                    }))
                  }
                  placeholder="Inquiry about services"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Email Body Message</label>
              <textarea
                rows={2}
                value={formData.emailData.body}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    emailData: { ...prev.emailData, body: e.target.value },
                  }))
                }
                placeholder="Pre-populated email body text..."
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
          </div>
        )}

        {type === 'phone' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800">Phone Number to Call</label>
            <input
              type="tel"
              value={formData.phoneData.phone}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  phoneData: { phone: e.target.value },
                }))
              }
              placeholder="+1 (555) 019-2834"
              className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>
        )}

        {type === 'sms' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Recipient Mobile Number</label>
              <input
                type="tel"
                value={formData.smsData.phone}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    smsData: { ...prev.smsData, phone: e.target.value },
                  }))
                }
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800">SMS Text Message</label>
              <input
                type="text"
                value={formData.smsData.message}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    smsData: { ...prev.smsData, message: e.target.value },
                  }))
                }
                placeholder="PROMO2028 discount code"
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
          </div>
        )}

        {type === 'wifi' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-800">Network Name (SSID)</label>
                <input
                  type="text"
                  value={formData.wiFiData.ssid}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      wiFiData: { ...prev.wiFiData, ssid: e.target.value },
                    }))
                  }
                  placeholder="Cafe_Guest_WiFi"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Security Encryption</label>
                <select
                  value={formData.wiFiData.encryption}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      wiFiData: {
                        ...prev.wiFiData,
                        encryption: e.target.value as any,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 text-sm font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Network Password</label>
                <input
                  type="text"
                  value={formData.wiFiData.password}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      wiFiData: { ...prev.wiFiData, password: e.target.value },
                    }))
                  }
                  placeholder="Password123"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="flex items-center gap-2 pt-4 sm:pt-0">
                <input
                  type="checkbox"
                  id="wifi-hidden"
                  checked={formData.wiFiData.hidden}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      wiFiData: { ...prev.wiFiData, hidden: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-black rounded border-black"
                />
                <label htmlFor="wifi-hidden" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Hidden SSID Network
                </label>
              </div>
            </div>
          </div>
        )}

        {type === 'location' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Search Place / Address (Google Maps)</label>
              <input
                type="text"
                value={formData.locationData.query || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    locationData: { ...prev.locationData, query: e.target.value },
                  }))
                }
                placeholder="e.g. Grand Indonesia Mall, Jakarta or 1600 Amphitheatre Pkwy"
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Latitude (Optional)</label>
                <input
                  type="text"
                  value={formData.locationData.latitude}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      locationData: { ...prev.locationData, latitude: e.target.value },
                    }))
                  }
                  placeholder="-6.2088"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Longitude (Optional)</label>
                <input
                  type="text"
                  value={formData.locationData.longitude}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      locationData: { ...prev.locationData, longitude: e.target.value },
                    }))
                  }
                  placeholder="106.8456"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>
          </div>
        )}

        {type === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">First Name</label>
                <input
                  type="text"
                  value={formData.vCardData.firstName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, firstName: e.target.value },
                    }))
                  }
                  placeholder="John"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Last Name</label>
                <input
                  type="text"
                  value={formData.vCardData.lastName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, lastName: e.target.value },
                    }))
                  }
                  placeholder="Doe"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Phone</label>
                <input
                  type="tel"
                  value={formData.vCardData.phone}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, phone: e.target.value },
                    }))
                  }
                  placeholder="+1 555-0199"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Email</label>
                <input
                  type="email"
                  value={formData.vCardData.email}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, email: e.target.value },
                    }))
                  }
                  placeholder="john@company.com"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Organization</label>
                <input
                  type="text"
                  value={formData.vCardData.organization}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, organization: e.target.value },
                    }))
                  }
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Job Title</label>
                <input
                  type="text"
                  value={formData.vCardData.jobTitle}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, jobTitle: e.target.value },
                    }))
                  }
                  placeholder="Managing Partner"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-800">Website</label>
                <input
                  type="url"
                  value={formData.vCardData.website}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, website: e.target.value },
                    }))
                  }
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-800">Physical Address</label>
                <input
                  type="text"
                  value={formData.vCardData.address}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vCardData: { ...prev.vCardData, address: e.target.value },
                    }))
                  }
                  placeholder="123 Business Way, Suite 400"
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>
          </div>
        )}

        {type === 'event' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Event Title</label>
              <input
                type="text"
                value={formData.eventData.title}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    eventData: { ...prev.eventData, title: e.target.value },
                  }))
                }
                placeholder="Product Launch Keynote"
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.eventData.startDate}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      eventData: { ...prev.eventData, startDate: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.eventData.endDate}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      eventData: { ...prev.eventData, endDate: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Location</label>
              <input
                type="text"
                value={formData.eventData.location}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    eventData: { ...prev.eventData, location: e.target.value },
                  }))
                }
                placeholder="Grand Hall B or Zoom Link"
                className="w-full px-3 py-2 text-sm font-semibold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
            </div>
          </div>
        )}

        {type === 'custom' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-800">Custom String Payload</label>
            <textarea
              rows={4}
              value={formData.customData.payload}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  customData: { payload: e.target.value },
                }))
              }
              placeholder="Enter JSON, raw protocol (e.g. bitcoin:..., geo:..., etc.)"
              className="w-full px-3 py-2 text-xs font-mono bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

const QRFormInputs = React.memo(QRFormInputsComponent);
export default QRFormInputs;

