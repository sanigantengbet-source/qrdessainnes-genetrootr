import { NextRequest, NextResponse } from 'next/server';
import { generateQRSVG } from '@/lib/qr/engine';
import { QRDesignConfig } from '@/types/qr';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, config, qrName, format = 'svg', renderSize = 512 } = body as {
      payload: string;
      config: QRDesignConfig;
      qrName?: string;
      format?: 'svg' | 'json';
      renderSize?: number;
    };

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Payload data is required' },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration object is required' },
        { status: 400 }
      );
    }

    const svg = generateQRSVG({
      payload,
      config,
      qrName,
      renderSize,
    });

    if (format === 'svg') {
      return new NextResponse(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.json({
      success: true,
      svg,
      qrName: qrName || 'qr-code',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate QR design' },
      { status: 500 }
    );
  }
}
