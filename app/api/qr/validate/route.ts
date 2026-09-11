import { NextRequest, NextResponse } from 'next/server';
import { evaluateQRReadability } from '@/lib/qr/readability';
import { QRDesignConfig } from '@/types/qr';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = body.config as QRDesignConfig;

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Design configuration is required for validation.' },
        { status: 400 }
      );
    }

    const readability = evaluateQRReadability(config);

    return NextResponse.json({
      success: true,
      readability,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Readability analysis failed' },
      { status: 500 }
    );
  }
}
