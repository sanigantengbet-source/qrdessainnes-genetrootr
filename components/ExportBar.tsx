'use client';

import React, { useState } from 'react';
import { exportSVG, exportRasterImage, exportPDF } from '@/lib/qr/exporter';
import { Download, FileDown, Image as ImageIcon, FileCode, Printer, CreditCard, QrCode } from 'lucide-react';

interface ExportBarProps {
  cardSvgMarkup?: string;
  svgMarkup: string;
  qrName: string;
}

export default function ExportBar({ cardSvgMarkup, svgMarkup, qrName }: ExportBarProps) {
  const [exportLayout, setExportLayout] = useState<'card' | 'standalone'>('card');
  const [resolution, setResolution] = useState<number>(1024); // 512, 1024, 2048
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const activeSvg = exportLayout === 'card' && cardSvgMarkup ? cardSvgMarkup : svgMarkup;

  const handleDownload = async (format: 'png' | 'svg' | 'jpeg' | 'pdf') => {
    if (!activeSvg) return;
    setDownloadingFormat(format);

    try {
      if (format === 'svg') {
        exportSVG(activeSvg, qrName);
      } else if (format === 'png' || format === 'jpeg') {
        // Base SVG scale calculation based on resolution
        const scale = exportLayout === 'card' ? resolution / 640 : resolution / 500;
        await exportRasterImage(activeSvg, qrName, format, scale);
      } else if (format === 'pdf') {
        await exportPDF(activeSvg, qrName);
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Failed to export image: ' + (err?.message || 'Unknown error'));
    } finally {
      setTimeout(() => setDownloadingFormat(null), 800);
    }
  };

  return (
    <div className="w-full bg-white border-[3px] border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#000] space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
          <Download className="w-4 h-4 text-black" />
          5. Download & Export Assets
        </label>
        <span className="text-[11px] font-mono font-bold text-neutral-600">Lossless Master Files</span>
      </div>

      {/* Export Layout Format Selector */}
      <div className="space-y-1.5 pb-1">
        <div className="flex justify-between text-xs font-bold text-neutral-800">
          <span>Format Hasil Download</span>
          <span className="text-[11px] font-mono text-neutral-500 font-normal">
            {exportLayout === 'card' ? 'Kartu QR (Modern Card Style)' : 'QR Code Standalone'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setExportLayout('card')}
            className={`py-2 px-3 border-2 border-black text-xs font-black transition-all flex items-center justify-center gap-1.5 font-mono ${
              exportLayout === 'card'
                ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Kartu QR (Card Style)</span>
          </button>
          <button
            type="button"
            onClick={() => setExportLayout('standalone')}
            className={`py-2 px-3 border-2 border-black text-xs font-black transition-all flex items-center justify-center gap-1.5 font-mono ${
              exportLayout === 'standalone'
                ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Saja (Raw)</span>
          </button>
        </div>
      </div>

      {/* Resolution Selector */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-neutral-800">
          <span>Raster Resolution (PNG & JPG)</span>
          <span className="font-mono">{resolution} x {exportLayout === 'card' ? Math.round((resolution * 880) / 640) : resolution} px</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { size: 512, label: '512px', tag: 'Web' },
            { size: 1024, label: '1024px', tag: 'Standard' },
            { size: 2048, label: '2048px', tag: 'Ultra 4K' },
          ].map((item) => (
            <button
              key={item.size}
              type="button"
              onClick={() => setResolution(item.size)}
              className={`py-1.5 px-2 border-2 border-black text-center text-xs transition-all ${
                resolution === item.size
                  ? 'bg-black text-[#FFE600] font-black shadow-[2px_2px_0px_0px_#FFE600]'
                  : 'bg-[#FFFDF8] text-black font-bold hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
              }`}
            >
              <div>{item.label}</div>
              <div className="text-[9px] opacity-80 uppercase">{item.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* PNG Button */}
        <button
          type="button"
          onClick={() => handleDownload('png')}
          disabled={!!downloadingFormat}
          className="p-3 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center gap-1 font-mono disabled:opacity-50"
        >
          <ImageIcon className="w-5 h-5" />
          <span>{downloadingFormat === 'png' ? 'EXPORTING...' : 'DOWNLOAD PNG'}</span>
          <span className="text-[9px] font-sans font-bold">Siap Dibagikan</span>
        </button>

        {/* SVG Button */}
        <button
          type="button"
          onClick={() => handleDownload('svg')}
          disabled={!!downloadingFormat}
          className="p-3 bg-[#70EE9C] text-black border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:bg-emerald-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center gap-1 font-mono disabled:opacity-50"
        >
          <FileCode className="w-5 h-5" />
          <span>{downloadingFormat === 'svg' ? 'SAVING...' : 'DOWNLOAD SVG'}</span>
          <span className="text-[9px] font-sans font-bold">Infinite Vector</span>
        </button>

        {/* JPG Button */}
        <button
          type="button"
          onClick={() => handleDownload('jpeg')}
          disabled={!!downloadingFormat}
          className="p-3 bg-[#FF5E5B] text-white border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:bg-red-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center gap-1 font-mono disabled:opacity-50"
        >
          <FileDown className="w-5 h-5" />
          <span>{downloadingFormat === 'jpeg' ? 'SAVING...' : 'DOWNLOAD JPG'}</span>
          <span className="text-[9px] font-sans font-bold">Solid Base</span>
        </button>

        {/* PDF Button */}
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          disabled={!!downloadingFormat}
          className="p-3 bg-black text-[#FFE600] border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#FFE600] hover:bg-neutral-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center gap-1 font-mono disabled:opacity-50"
        >
          <Printer className="w-5 h-5" />
          <span>{downloadingFormat === 'pdf' ? 'BUILDING...' : 'PRINT PDF (A4)'}</span>
          <span className="text-[9px] font-sans font-bold text-neutral-300">Ready to Print</span>
        </button>
      </div>
    </div>
  );
}
