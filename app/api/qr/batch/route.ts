import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { generateQRSVG } from '@/lib/qr/engine';
import { slugifyFilename } from '@/lib/utils/slugify';
import { BatchQRItem, QRDesignConfig } from '@/types/qr';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, config, format = 'zip' } = body as {
      items: BatchQRItem[];
      config: QRDesignConfig;
      format?: 'zip' | 'json';
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array cannot be empty.' },
        { status: 400 }
      );
    }

    // Cap batch size at 100 to stay within Vercel memory/timeout bounds
    const safeItems = items.slice(0, 100);
    const results: { id: string; name: string; filename: string; svg: string }[] = [];

    for (let i = 0; i < safeItems.length; i++) {
      const item = safeItems[i];
      const payload = item.payload || 'https://example.com';
      const name = item.name || `QR-${i + 1}`;
      const svg = generateQRSVG({
        payload,
        config,
        qrName: name,
        renderSize: 512,
      });

      results.push({
        id: item.id || `qr-${i + 1}`,
        name,
        filename: slugifyFilename(name, 'svg'),
        svg,
      });
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        count: results.length,
        items: results,
      });
    }

    // Build ZIP package in memory
    const zip = new JSZip();
    results.forEach((item) => {
      zip.file(item.filename, item.svg);
    });

    // Add manifest summary
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalQRs: results.length,
      configSummary: {
        dotStyle: config.dotStyle,
        cornerSquareStyle: config.cornerSquareStyle,
        foreground: config.foreground,
        background: config.background,
      },
      files: results.map((r) => ({ name: r.name, filename: r.filename })),
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const zipBuffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="qr-designs-batch.zip"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Batch generation failed' },
      { status: 500 }
    );
  }
}
