'use client';

import React from 'react';
import { ReadabilityCheckResult } from '@/types/qr';
import { ShieldCheck, AlertTriangle, CheckCircle2, Wrench, Info } from 'lucide-react';

interface ReadabilityWidgetProps {
  readability: ReadabilityCheckResult;
  onAutoFix: () => void;
}

export default function ReadabilityWidget({ readability, onAutoFix }: ReadabilityWidgetProps) {
  const { score, status, issues, recommendations, contrastRatio } = readability;

  let badgeBg = 'bg-[#70EE9C] text-black'; // green
  let statusText = 'OPTIMAL READABILITY';
  if (status === 'warning') {
    badgeBg = 'bg-[#FFE600] text-black'; // yellow
    statusText = 'CAUTION: MAY BE HARD TO SCAN';
  } else if (status === 'critical') {
    badgeBg = 'bg-[#FF5E5B] text-white'; // red
    statusText = 'CRITICAL: RISK OF SCAN FAILURE';
  }

  return (
    <div className="w-full bg-white border-[3px] border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#000] space-y-3">
      {/* Header with Score */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-black" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
              Scannability & Safety Engine
            </h4>
            <div className="text-[10px] text-neutral-600 font-bold">
              Optical Contrast: {contrastRatio.toFixed(2)}:1
            </div>
          </div>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono ${badgeBg}`}
          >
            {score}% SCORE
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="w-full bg-neutral-200 h-3 border-2 border-black overflow-hidden relative">
        <div
          className={`h-full transition-all duration-300 ${
            score >= 80 ? 'bg-[#70EE9C]' : score >= 60 ? 'bg-[#FFE600]' : 'bg-[#FF5E5B]'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Issues / Recommendations */}
      {issues.length > 0 ? (
        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs font-bold text-red-700">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{issue}</span>
              </div>
            ))}
          </div>

          {/* Auto Fix Button */}
          <button
            type="button"
            onClick={onAutoFix}
            className="w-full py-2 px-3 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 font-mono"
          >
            <Wrench className="w-4 h-4" />
            <span>Auto-Fix Readability Settings</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>High optical safety score. Perfectly legible across iOS and Android barcode scanners.</span>
        </div>
      )}
    </div>
  );
}
