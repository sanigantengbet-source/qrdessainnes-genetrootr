'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Zap, Download } from 'lucide-react';

export default function Hero() {
  return (
    <section className="w-full bg-[#FFFDF8] border-b-[3px] border-black py-4 sm:py-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Headline */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#70EE9C] text-black border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100+ Styles • 100+ Fonts • 100+ Frames • Readability AI Check</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black uppercase font-mono leading-none">
            GENERATE <span className="underline decoration-4 decoration-[#FFE600] underline-offset-4">SCANNABLE</span> ART
          </h2>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium">
            Turn ordinary barcode squares into branded visual assets. Realtime live preview, optical contrast safety validation, and lossless vector output.
          </p>
        </div>

        {/* Right Feature Badges in Neo-Brutalist Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
            <Zap className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Stateless Engine</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FF5E5B] text-white border-2 border-black px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Checked</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FFE600] text-black border-2 border-black px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
            <Download className="w-3.5 h-3.5" />
            <span>SVG • PNG • PDF</span>
          </div>
        </div>
      </div>
    </section>
  );
}
