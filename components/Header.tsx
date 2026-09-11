'use client';

import React from 'react';
import { QrCode, Sparkles, Layers, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onOpenBatch: () => void;
  onResetDefaults: () => void;
}

export default function Header({ onOpenBatch, onResetDefaults }: HeaderProps) {
  return (
    <header className="w-full border-b-[3px] border-black bg-[#FFE600] sticky top-0 z-40 px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-black text-[#FFE600] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-black font-mono uppercase">
                QR Design <span className="bg-black text-[#FFE600] px-1.5 py-0.5 ml-0.5">Generator</span>
              </h1>
              <span className="hidden md:inline-flex text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#fff]">
                PRO SAAS
              </span>
            </div>
            <p className="text-[11px] font-semibold text-black/80 hidden sm:block">
              Modern Neo-Brutalist Visual QR Studio • Vector & High-Res
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5"
            title="Reset to default design"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onOpenBatch}
            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-black bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#FFE600] hover:bg-neutral-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FFE600]" />
            <span>Batch QR</span>
          </button>
        </div>
      </div>
    </header>
  );
}
