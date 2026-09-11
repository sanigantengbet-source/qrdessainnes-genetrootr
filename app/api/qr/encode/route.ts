import { NextRequest, NextResponse } from 'next/server';
import { encodeQRPayload } from '@/lib/qr/payloads';
import { QRFormData } from '@/types/qr';

export async function POST(req: NextRequest) {
  try {
    const formData = (await req.json()) as QRFormData;

    if (!formData || !formData.type) {
      return NextResponse.json(
        { success: false, error: 'QR data is invalid. Please check your input.' },
        { status: 400 }
      );
    }

    // Input validations per type
    if (formData.type === 'url') {
      const url = formData.urlData?.url?.trim();
      if (!url) {
        return NextResponse.json(
          { success: false, error: 'URL field cannot be empty.' },
          { status: 400 }
        );
      }
    } else if (formData.type === 'email') {
      const email = formData.emailData?.email?.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address format.' },
          { status: 400 }
        );
      }
    } else if (formData.type === 'wifi') {
      const ssid = formData.wiFiData?.ssid?.trim();
      if (!ssid) {
        return NextResponse.json(
          { success: false, error: 'Wi-Fi Network SSID is required.' },
          { status: 400 }
        );
      }
    }

    const payload = encodeQRPayload(formData);

    return NextResponse.json({
      success: true,
      payload,
      type: formData.type,
      qrName: formData.qrName || '',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to encode QR payload' },
      { status: 500 }
    );
  }
}
