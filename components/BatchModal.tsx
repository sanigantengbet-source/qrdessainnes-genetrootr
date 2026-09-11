'use client';

import React, { useState } from 'react';
import { QRDesignConfig, BatchQRItem } from '@/types/qr';
import { X, FileSpreadsheet, Download, Sparkles, Check, AlertCircle } from 'lucide-react';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: QRDesignConfig;
}

export default function BatchModal({ isOpen, onClose, currentConfig }: BatchModalProps) {
  const [inputText, setInputText] = useState<string>(
    `Store Alpha,https://mystore.com/alpha\nStore Beta,https://mystore.com/beta\nVIP Lounge,https://mystore.com/vip\nEvent Table 1,https://mystore.com/table-1\nEvent Table 2,https://mystore.com/table-2`
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadBatch = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Parse CSV or newline text
      const lines = inputText.trim().split('\n');
      const items: BatchQRItem[] = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Comma separated or single url
        if (trimmed.includes(',')) {
          const parts = trimmed.split(',');
          const name = parts[0].trim();
          const payload = parts.slice(1).join(',').trim();
          items.push({ id: `qr-${idx + 1}`, name, payload });
        } else {
          items.push({ id: `qr-${idx + 1}`, name: `QR Code ${idx + 1}`, payload: trimmed });
        }
      });

      if (items.length === 0) {
        throw new Error('Please enter at least one item to generate.');
      }

      const res = await fetch('/api/qr/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          config: currentConfig,
          format: 'zip',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server failed to build batch ZIP archive');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr-batch-designs.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process batch generation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setInputText(
      `Menu Table 1,https://restaurant.com/menu?table=1\nMenu Table 2,https://restaurant.com/menu?table=2\nMenu Table 3,https://restaurant.com/menu?table=3\nWiFi Guest,WIFI:S:CafeWiFi;T:WPA;P:guest123;;\nSupport WhatsApp,https://wa.me/628123456789\nStaff Badge Alex,MECARD:N:Morgan,Alex;TEL:5550199;;`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-[4px] border-black p-5 sm:p-6 shadow-[8px_8px_0px_0px_#FFE600] max-w-xl w-full relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-[#FFE600] flex items-center justify-center border border-black font-black">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase font-mono">BATCH QR GENERATOR (ZIP)</h3>
              <p className="text-[11px] text-neutral-600 font-bold">
                Batch encode up to 100 QR codes using your active visual styling
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-[#FF5E5B] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black hover:bg-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#FFFDF8] border-2 border-black p-3 text-xs space-y-1">
          <div className="font-bold flex items-center justify-between">
            <span>Format: <code>Name,Payload</code> (one entry per line)</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[10px] font-black uppercase bg-[#FFE600] px-2 py-0.5 border border-black hover:bg-yellow-300"
            >
              Load Sample Data
            </button>
          </div>
          <p className="text-neutral-600 text-[11px]">
            Example: <code>Table 01,https://menu.io/01</code>
          </p>
        </div>

        {/* Text Area */}
        <div className="space-y-1">
          <textarea
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 font-mono text-xs border-2 border-black focus:outline-none bg-[#FFFDF8] shadow-[2px_2px_0px_0px_#000]"
            placeholder="Name,URL..."
          />
        </div>

        {errorMsg && (
          <div className="p-2 bg-red-100 border-2 border-red-600 text-red-800 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] font-bold text-neutral-600">
            Active preset: <span className="font-mono text-black font-black">{currentConfig.dotStyle} dots / {currentConfig.cornerSquareStyle} corners</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold border-2 border-black bg-white hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownloadBatch}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-black bg-black text-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] hover:bg-neutral-900 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5 font-mono disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'BUILDING ZIP...' : 'GENERATE & DOWNLOAD ZIP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
