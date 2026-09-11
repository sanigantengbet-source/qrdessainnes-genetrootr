'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import QRTypeSelector from '@/components/QRTypeSelector';
import QRFormInputs from '@/components/QRFormInputs';
import PresetSelector from '@/components/PresetSelector';
import CardThemeSelector from '@/components/CardThemeSelector';
import CustomizationPanel from '@/components/CustomizationPanel';
import LivePreview from '@/components/LivePreview';
import ReadabilityWidget from '@/components/ReadabilityWidget';
import ExportBar from '@/components/ExportBar';
import BatchModal from '@/components/BatchModal';
import { DEFAULT_FORM_DATA, DEFAULT_DESIGN_CONFIG } from '@/lib/constants/defaults';
import { ALL_CARD_THEMES } from '@/lib/constants/cardThemes';
import { encodeQRPayload } from '@/lib/qr/payloads';
import { evaluateQRReadability } from '@/lib/qr/readability';
import { generateQRSVG, generateQRCardSVG } from '@/lib/qr/engine';
import { QRFormData, QRDesignConfig, QRType, StylePreset, ReadabilityCheckResult } from '@/types/qr';
import { CardTheme } from '@/types/cardTheme';
import { Sparkles, Eye, Download, ShieldAlert, RefreshCw } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState<QRFormData>(DEFAULT_FORM_DATA);
  const [designConfig, setDesignConfig] = useState<QRDesignConfig>(DEFAULT_DESIGN_CONFIG);
  const [selectedCardTheme, setSelectedCardTheme] = useState<CardTheme>(() => ALL_CARD_THEMES[0]);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [cardSvgMarkup, setCardSvgMarkup] = useState<string>('');
  const [readability, setReadability] = useState<ReadabilityCheckResult>(() =>
    evaluateQRReadability(DEFAULT_DESIGN_CONFIG)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Generate QR SVG whenever form or design state changes
  const updateQR = useCallback(() => {
    try {
      setIsGenerating(true);
      const payload = encodeQRPayload(formData);
      const readResult = evaluateQRReadability(designConfig);
      setReadability(readResult);

      // Standalone QR code
      const svg = generateQRSVG({
        payload,
        config: designConfig,
        qrName: formData.qrName,
        renderSize: 500,
        idPrefix: 'main-qr',
      });
      setSvgMarkup(svg);

      // Presentation card (QR Card Theme layout)
      const cardSvg = generateQRCardSVG({
        payload,
        config: designConfig,
        cardTheme: selectedCardTheme,
        qrName: formData.qrName,
        cardSubtitle: formData.cardSubtitle,
        renderWidth: selectedCardTheme.dimensions.width,
        renderHeight: selectedCardTheme.dimensions.height,
      });
      setCardSvgMarkup(cardSvg);
    } catch (err) {
      console.error('QR Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [formData, designConfig, selectedCardTheme]);

  // Debounced effect for smooth typing
  useEffect(() => {
    const timer = setTimeout(() => {
      updateQR();
    }, 60);
    return () => clearTimeout(timer);
  }, [updateQR]);

  // Handle QR Type change
  const handleSelectType = (type: QRType) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: StylePreset) => {
    setDesignConfig((prev) => ({
      ...prev,
      ...preset.config,
      // Preserve user custom logo or custom frame text if set
      logo: prev.logo?.dataUrl ? prev.logo : preset.config.logo,
      frame: prev.frame?.text
        ? {
            ...(preset.config.frame || prev.frame),
            text: prev.frame.text,
            subtext: prev.frame.subtext,
          }
        : preset.config.frame,
    }));
  };

  // Auto-Fix Readability
  const handleAutoFixReadability = () => {
    setDesignConfig((prev) => {
      const next = { ...prev };
      // If low contrast, reset to high-contrast monochrome or deep dark
      if (readability.contrastRatio < 4.5) {
        next.foreground = '#000000';
        next.background = '#FFFFFF';
        if (next.gradient) {
          next.gradient = { ...next.gradient, type: 'none' };
        }
      }
      // Ensure quiet zone >= 4
      if (next.quietZone < 3) {
        next.quietZone = 4;
      }
      // If logo exists, guarantee error correction H and safe logo size <= 20
      if (next.logo?.dataUrl) {
        next.errorCorrectionLevel = 'H';
        next.logo = {
          ...next.logo,
          size: Math.min(next.logo.size, 20),
          padding: Math.max(next.logo.padding, 6),
        };
      }
      return next;
    });
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm('Reset QR design to default settings?')) {
      setFormData(DEFAULT_FORM_DATA);
      setDesignConfig(DEFAULT_DESIGN_CONFIG);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Neo-Brutalist Top Navigation */}
      <Header
        onOpenBatch={() => setIsBatchOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* Hero Section */}
      <Hero />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Controls, Type, Inputs, Presets, Customization Engine (cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. QR Type Selector */}
            <section className="bg-white border-[3px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000]">
              <QRTypeSelector
                selectedType={formData.type}
                onSelectType={handleSelectType}
              />
            </section>

            {/* 2. QR Form Inputs (Dynamic per type + Name) */}
            <section>
              <QRFormInputs
                formData={formData}
                onChange={setFormData}
              />
            </section>

            {/* 3. Style Preset Selector (100+ Styles) */}
            <section>
              <PresetSelector
                currentConfig={designConfig}
                onSelectPreset={handleSelectPreset}
              />
            </section>

            {/* 4. Choose Card Theme (100+ Card Layouts) */}
            <section>
              <CardThemeSelector
                selectedThemeId={selectedCardTheme.id}
                onSelectTheme={setSelectedCardTheme}
                qrName={formData.qrName}
                currentTheme={selectedCardTheme}
              />
            </section>

            {/* 5. Customization Engine (Dots, Colors, Frames, Fonts, Logo, Advanced) */}
            <section>
              <CustomizationPanel
                config={designConfig}
                onChange={setDesignConfig}
                onAutoFixReadability={handleAutoFixReadability}
              />
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Realtime Preview, Safety Engine, & Export (cols 8-12) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Live Visual Canvas Preview */}
            <section id="preview-panel">
              <LivePreview
                cardSvgMarkup={cardSvgMarkup}
                svgMarkup={svgMarkup}
                qrName={formData.qrName}
                readability={readability}
                isGenerating={isGenerating}
              />
            </section>

            {/* Scannability & Contrast Safety Widget */}
            <section>
              <ReadabilityWidget
                readability={readability}
                onAutoFix={handleAutoFixReadability}
              />
            </section>

            {/* Lossless Export & Download Bar */}
            <section id="download-panel">
              <ExportBar
                cardSvgMarkup={cardSvgMarkup}
                svgMarkup={svgMarkup}
                qrName={formData.qrName}
              />
            </section>
          </div>
        </div>
      </main>

      {/* Footer / Powered By */}
      <footer id="app-footer" className="w-full border-t-[3px] border-black bg-white mt-8 py-6 px-4 sm:px-6 pb-20 lg:pb-6 shadow-[0px_-2px_0px_0px_#000]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-black uppercase">
              POWER BY SANN404 FORUM GROUP
            </span>
          </div>
          <div className="font-mono text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
            QR DESIGN GENERATOR &bull; MODERN NEO-BRUTALIST STUDIO
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Quick Navigation Bar */}
      <aside aria-label="Mobile quick actions" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFE600] border-t-[3px] border-black px-4 py-2.5 shadow-[0px_-3px_0px_0px_#000] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full border border-black ${
              readability.score >= 80 ? 'bg-[#22C55E]' : 'bg-[#FF5E5B]'
            }`}
          />
          <span className="text-xs font-black uppercase font-mono truncate max-w-[120px] sm:max-w-none">
            {formData.qrName || 'QR PREVIEW'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('preview-panel');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 text-xs font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 font-mono"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('download-panel');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 text-xs font-black bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </aside>

      {/* Batch QR Generator Modal */}
      <BatchModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        currentConfig={designConfig}
      />
    </div>
  );
}
