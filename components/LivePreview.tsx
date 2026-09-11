'use client';

import React, { useState } from 'react';
import { Maximize2, Minimize2, Copy, Check, QrCode, CreditCard } from 'lucide-react';
import { ReadabilityCheckResult } from '@/types/qr';

interface LivePreviewProps {
  cardSvgMarkup?: string;
  svgMarkup: string;
  qrName: string;
  readability: ReadabilityCheckResult;
  isGenerating?: boolean;
}

export default function LivePreview({
  cardSvgMarkup,
  svgMarkup,
  qrName,
  readability,
  isGenerating,
}: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<'card' | 'qr'>('card');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active SVG based on toggle
  const activeSvg = viewMode === 'card' && cardSvgMarkup ? cardSvgMarkup : svgMarkup;

  const handleCopySVG = async () => {
    try {
      await navigator.clipboard.writeText(activeSvg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <>
      <div className="w-full bg-white border-[3px] border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#000] flex flex-col items-center">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between border-b-2 border-black pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#70EE9C] border border-black inline-block animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
              Realtime Canvas Preview
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Copy SVG code button */}
            <button
              type="button"
              onClick={handleCopySVG}
              className="p-1.5 bg-[#FFFDF8] border-2 border-black hover:bg-neutral-100 active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_0px_#000] transition-all"
              title="Copy active SVG code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-black" />
              )}
            </button>

            {/* Maximize preview */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 bg-[#FFFDF8] border-2 border-black hover:bg-neutral-100 active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_0px_#000] transition-all"
              title="Expand preview"
            >
              <Maximize2 className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="w-full flex items-center gap-1.5 bg-[#F5F2EB] p-1 border-2 border-black mb-3">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex-1 py-1.5 px-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 font-mono ${
              viewMode === 'card'
                ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                : 'text-black hover:bg-neutral-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Kartu QR (Download)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('qr')}
            className={`flex-1 py-1.5 px-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 font-mono ${
              viewMode === 'qr'
                ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                : 'text-black hover:bg-neutral-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Saja</span>
          </button>
        </div>

        {/* QR Stage with Checkerboard background for transparency preview */}
        <div
          className={`w-full flex items-center justify-center p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] relative overflow-hidden transition-all duration-200 ${
            viewMode === 'card'
              ? 'max-w-[360px] min-h-[360px] bg-[#FFFDF8]'
              : 'max-w-[340px] aspect-square'
          }`}
          style={{
            backgroundImage:
              viewMode === 'qr'
                ? 'radial-gradient(#d4d4d8 1px, transparent 1px), radial-gradient(#d4d4d8 1px, #fafafa 1px)'
                : 'none',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2 text-neutral-600 font-bold text-xs">
              <QrCode className="w-8 h-8 animate-spin text-black" />
              <span>Updating vector geometry...</span>
            </div>
          ) : activeSvg ? (
            <div
              className="w-full h-full flex items-center justify-center transition-all duration-200 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: activeSvg }}
            />
          ) : (
            <div className="text-center text-xs font-bold text-neutral-500">
              Generating initial QR vector...
            </div>
          )}

          {/* Scannable Indicator pill */}
          <div className="absolute bottom-2 right-2 z-10">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] font-mono ${
                readability.score >= 80
                  ? 'bg-[#70EE9C] text-black'
                  : readability.score >= 60
                  ? 'bg-[#FFE600] text-black'
                  : 'bg-[#FF5E5B] text-white'
              }`}
            >
              {readability.score >= 80 ? '✓ SCANNABLE' : '⚠ CHECK SCAN'}
            </span>
          </div>
        </div>

        {/* Caption */}
        <div className="mt-3 text-center">
          <div className="text-xs font-black uppercase font-mono text-black truncate max-w-[300px]">
            {qrName || 'UNTITLED QR'}
          </div>
          <div className="text-[11px] text-neutral-600 font-medium">
            {viewMode === 'card'
              ? 'Tampilan kartu pembayaran modern siap diunduh dan dibagikan'
              : 'Test scan on your phone camera directly from screen'}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal Preview */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#FFE600] max-w-lg w-full relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <h3 className="text-base font-black uppercase font-mono">{qrName || 'QR PREVIEW'}</h3>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 bg-[#FF5E5B] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`w-full flex items-center justify-center p-4 border-2 border-black [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain ${
                viewMode === 'card' ? 'aspect-[640/880] max-h-[70vh]' : 'aspect-square'
              }`}
              dangerouslySetInnerHTML={{ __html: activeSvg }}
            />

            <div className="mt-4 flex justify-between items-center text-xs font-bold text-neutral-600">
              <span>Ready for high-speed camera recognition</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-1.5 bg-black text-[#FFE600] border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#FFE600]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
