'use client';

import React, { useState, useMemo, useCallback, useTransition } from 'react';
import { QRDesignConfig, DotStyle, CornerSquareStyle, CornerDotStyle, FrameConfig } from '@/types/qr';
import { FRAME_PRESETS, FRAME_CATEGORIES } from '@/lib/constants/frames';
import { FONT_DEFINITIONS, FONT_CATEGORIES } from '@/lib/constants/fonts';
import { loadGoogleFontInDocument } from '@/lib/qr/fonts';

const DEFAULT_FRAME_FALLBACK: FrameConfig = {
  id: 'custom-frame',
  style: 'pill-banner',
  text: 'SCAN ME',
  textColor: '#000000',
  backgroundColor: '#FFE600',
  borderColor: '#000000',
  borderWidth: 3,
  position: 'bottom',
};
import {
  Palette,
  Shapes,
  LayoutTemplate,
  Type,
  ImageIcon,
  SlidersHorizontal,
  Upload,
  X,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

interface CustomizationPanelProps {
  config: QRDesignConfig;
  onChange: (updater: (prev: QRDesignConfig) => QRDesignConfig) => void;
  onAutoFixReadability?: () => void;
}

const FontGridItem = React.memo(function FontGridItem({
  font,
  isSelected,
  onSelect,
}: {
  font: (typeof FONT_DEFINITIONS)[0];
  isSelected: boolean;
  onSelect: (font: (typeof FONT_DEFINITIONS)[0]) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onSelect(font);
      }}
      className={`p-2.5 border-2 border-black text-left transition-all ${
        isSelected
          ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] font-black scale-[1.01]'
          : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-neutral-100 border border-black/30 rounded uppercase text-neutral-600 truncate">
          {font.category}
        </span>
        {isSelected && (
          <span className="text-[9px] font-black text-black flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        )}
      </div>
      <div className="text-xs font-black text-black truncate leading-tight">{font.name}</div>
      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Aa 123</div>
    </button>
  );
});

const DOT_STYLES: { id: DotStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dots', label: 'Dots' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-rounded', label: 'Pill Round' },
  { id: 'classy', label: 'Classy Leaf' },
  { id: 'classy-rounded', label: 'Classy Soft' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'cross', label: 'Cross' },
  { id: 'fluid', label: 'Fluid Blob' },
  { id: 'vertical-lines', label: 'V-Lines' },
  { id: 'horizontal-lines', label: 'H-Lines' },
  { id: 'pixel', label: '8-Bit Pixel' },
  { id: 'heart', label: 'Heart' },
];

const CORNER_SQUARE_STYLES: { id: CornerSquareStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-rounded', label: 'Pebble' },
  { id: 'dot', label: 'Circle Ring' },
  { id: 'squircle', label: 'Squircle' },
  { id: 'double', label: 'Double Ring' },
  { id: 'vintage', label: 'Vintage Corner' },
  { id: 'diamond', label: 'Diamond Frame' },
  { id: 'bold-angle', label: 'Chamfer Brut' },
  { id: 'pill', label: 'Pill Ring' },
];

const CORNER_DOT_STYLES: { id: CornerDotStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Circle Dot' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Starlight' },
  { id: 'cross', label: 'Cross' },
  { id: 'heart', label: 'Heart' },
];

function CustomizationPanelComponent({ config, onChange }: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'shapes' | 'colors' | 'frames' | 'fonts' | 'logo' | 'advanced'>('shapes');
  const [frameCategory, setFrameCategory] = useState<string>('All');
  const [fontCategory, setFontCategory] = useState<string>('Sans');
  const [, startTransition] = useTransition();

  const handleSelectFont = useCallback((font: (typeof FONT_DEFINITIONS)[0]) => {
    // Non-blocking Google font link injection
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        loadGoogleFontInDocument(font.family);
      });
    }

    startTransition(() => {
      onChange((prev) => ({
        ...prev,
        typography: {
          fontSize: prev.typography?.fontSize ?? 16,
          fontWeight: prev.typography?.fontWeight ?? '800',
          letterSpacing: prev.typography?.letterSpacing ?? 1,
          textTransform: prev.typography?.textTransform ?? 'uppercase',
          fontId: font.id,
          fontFamily: font.family,
        },
      }));
    });
  }, [onChange]);

  // Handle Logo Upload safely
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('Logo file too large. Please select an image under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange((prev) => ({
        ...prev,
        // Auto bump error correction to H for scannability when logo is uploaded
        errorCorrectionLevel: 'H',
        logo: {
          ...(prev.logo || {
            size: 20,
            padding: 6,
            backgroundColor: '#FFFFFF',
            borderRadius: 50,
            opacity: 1,
          }),
          dataUrl,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    onChange((prev) => ({
      ...prev,
      logo: {
        ...(prev.logo || {
          size: 20,
          padding: 6,
          backgroundColor: '#FFFFFF',
          borderRadius: 50,
          opacity: 1,
        }),
        dataUrl: '',
        url: '',
      },
    }));
  };

  // Filter frames
  const filteredFrames = FRAME_PRESETS.filter((f) => {
    if (frameCategory === 'All') return true;
    return f.category === frameCategory;
  });

  // Filter fonts
  const filteredFonts = FONT_DEFINITIONS.filter((f) => f.category === fontCategory);

  return (
    <div className="w-full bg-white border-[3px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
          <span className="w-2.5 h-2.5 bg-[#0066FF] inline-block"></span>
          4. Customization Engine
        </label>
        <span className="text-[11px] font-bold text-neutral-600">Granular Controls</span>
      </div>

      {/* Tabs Row */}
      <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
        {[
          { id: 'shapes', label: 'Dots & Shapes', icon: Shapes },
          { id: 'colors', label: 'Colors & Gradient', icon: Palette },
          { id: 'frames', label: 'Frames (100+)', icon: LayoutTemplate },
          { id: 'fonts', label: 'Typography (100+)', icon: Type },
          { id: 'logo', label: 'Logo Upload', icon: ImageIcon },
          { id: 'advanced', label: 'Safety & Advanced', icon: SlidersHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-black whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                  : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SHAPES */}
      {activeTab === 'shapes' && (
        <div className="space-y-4 pt-1">
          {/* Data Module Dot Style */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black font-mono">Data Dot Pattern</span>
              <span className="text-[11px] font-bold text-neutral-600">{config.dotStyle}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {DOT_STYLES.map((dot) => {
                const isSelected = config.dotStyle === dot.id;
                return (
                  <button
                    key={dot.id}
                    type="button"
                    onClick={() => onChange((prev) => ({ ...prev, dotStyle: dot.id }))}
                    className={`px-2 py-2 text-xs font-bold border-2 border-black transition-all text-center ${
                      isSelected
                        ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                        : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    {dot.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corner Square Style (Outer) */}
          <div className="space-y-1.5 pt-2 border-t-2 border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black font-mono">
                Corner Outer Ring (Finder Anchor)
              </span>
              <span className="text-[11px] font-bold text-neutral-600">{config.cornerSquareStyle}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {CORNER_SQUARE_STYLES.map((cs) => {
                const isSelected = config.cornerSquareStyle === cs.id;
                return (
                  <button
                    key={cs.id}
                    type="button"
                    onClick={() => onChange((prev) => ({ ...prev, cornerSquareStyle: cs.id }))}
                    className={`px-2 py-2 text-xs font-bold border-2 border-black transition-all text-center ${
                      isSelected
                        ? 'bg-[#70EE9C] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                        : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    {cs.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corner Dot Style (Inner) */}
          <div className="space-y-1.5 pt-2 border-t-2 border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black font-mono">
                Corner Center Eye (Finder Dot)
              </span>
              <span className="text-[11px] font-bold text-neutral-600">{config.cornerDotStyle}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {CORNER_DOT_STYLES.map((cd) => {
                const isSelected = config.cornerDotStyle === cd.id;
                return (
                  <button
                    key={cd.id}
                    type="button"
                    onClick={() => onChange((prev) => ({ ...prev, cornerDotStyle: cd.id }))}
                    className={`px-2 py-2 text-xs font-bold border-2 border-black transition-all text-center ${
                      isSelected
                        ? 'bg-[#FF5E5B] text-white shadow-[2px_2px_0px_0px_#000] font-black'
                        : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    {cd.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLORS & GRADIENT */}
      {activeTab === 'colors' && (
        <div className="space-y-4 pt-1">
          {/* Main Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foreground */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-black font-mono flex items-center justify-between">
                <span>Foreground / Module Color</span>
                <span className="font-mono text-neutral-600">{config.foreground}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.foreground.startsWith('#') ? config.foreground : '#000000'}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      foreground: val,
                      gradient: prev.gradient && prev.gradient.type !== 'none'
                        ? { ...prev.gradient, color1: val }
                        : prev.gradient,
                    }));
                  }}
                  className="w-12 h-10 border-2 border-black cursor-pointer bg-white p-0.5 shadow-[2px_2px_0px_0px_#000]"
                />
                <input
                  type="text"
                  value={config.foreground}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      foreground: val,
                      gradient: prev.gradient && prev.gradient.type !== 'none'
                        ? { ...prev.gradient, color1: val }
                        : prev.gradient,
                    }));
                  }}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              {/* Swatches */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#000000', '#1E1B4B', '#0047FF', '#991B1B', '#064E3B', '#78350F', '#BE185D', '#334155'].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          foreground: c,
                          gradient: prev.gradient && prev.gradient.type !== 'none'
                            ? { ...prev.gradient, color1: c }
                            : prev.gradient,
                        }))
                      }
                      style={{ backgroundColor: c }}
                      className="w-6 h-6 border-2 border-black hover:scale-110 transition-transform shadow-[1px_1px_0px_0px_#000]"
                      title={c}
                    />
                  )
                )}
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-black font-mono flex items-center justify-between">
                <span>Background Color</span>
                <span className="font-mono text-neutral-600">{config.background}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.background.startsWith('#') ? config.background : '#FFFFFF'}
                  onChange={(e) => onChange((prev) => ({ ...prev, background: e.target.value }))}
                  className="w-12 h-10 border-2 border-black cursor-pointer bg-white p-0.5 shadow-[2px_2px_0px_0px_#000]"
                />
                <input
                  type="text"
                  value={config.background}
                  onChange={(e) => onChange((prev) => ({ ...prev, background: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              {/* Swatches */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#FFFFFF', '#FFFDF8', '#F8FAFC', '#FFE600', '#70EE9C', '#FF5E5B', '#E0F2FE', '#FEF3C7'].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, background: c }))}
                      style={{ backgroundColor: c }}
                      className="w-6 h-6 border-2 border-black hover:scale-110 transition-transform shadow-[1px_1px_0px_0px_#000]"
                      title={c}
                    />
                  )
                )}
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, background: 'transparent' }))}
                  className="px-2 py-0.5 text-[10px] font-black border-2 border-black bg-white shadow-[1px_1px_0px_0px_#000]"
                >
                  TRANSPARENT
                </button>
              </div>
            </div>
          </div>

          {/* Gradient Section */}
          <div className="pt-3 border-t-2 border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black font-mono">Gradient Overlay</span>
              <div className="flex gap-1.5">
                {(['none', 'linear', 'radial'] as const).map((gType) => (
                  <button
                    key={gType}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        gradient: {
                          type: gType,
                          color1: prev.foreground,
                          color2: prev.gradient?.color2 || '#2563EB',
                          angle: prev.gradient?.angle ?? 45,
                        },
                      }))
                    }
                    className={`px-2 py-1 text-[11px] font-black border-2 border-black uppercase ${
                      (config.gradient?.type || 'none') === gType
                        ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                        : 'bg-white text-black'
                    }`}
                  >
                    {gType}
                  </button>
                ))}
              </div>
            </div>

            {config.gradient && config.gradient.type !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-[#FFFDF8] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-800">Gradient Second Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.gradient.color2}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          gradient: {
                            ...(prev.gradient || { type: 'linear', color1: prev.foreground, angle: 45 }),
                            color2: e.target.value,
                          },
                        }))
                      }
                      className="w-10 h-8 border-2 border-black cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={config.gradient.color2}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          gradient: {
                            ...(prev.gradient || { type: 'linear', color1: prev.foreground, angle: 45 }),
                            color2: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs font-mono border border-black bg-white"
                    />
                  </div>
                </div>

                {config.gradient.type === 'linear' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-neutral-800">
                      <span>Angle</span>
                      <span>{config.gradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={15}
                      value={config.gradient.angle}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          gradient: {
                            ...(prev.gradient || { type: 'linear', color1: prev.foreground, color2: '#2563EB' }),
                            angle: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Background Texture Pattern */}
          <div className="pt-3 border-t-2 border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black font-mono">Background Pattern Overlay</span>
              <div className="flex flex-wrap gap-1">
                {(['none', 'dots', 'grid', 'cross', 'waves', 'diagonal'] as const).map((pType) => {
                  const isActive = (config.pattern?.type || 'none') === pType;
                  return (
                    <button
                      key={pType}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          pattern: {
                            type: pType,
                            color: prev.pattern?.color || prev.foreground || '#000000',
                            opacity: prev.pattern?.opacity ?? 0.12,
                          },
                        }))
                      }
                      className={`px-2 py-1 text-[10px] font-black border-2 border-black uppercase ${
                        isActive
                          ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                          : 'bg-white text-black hover:bg-neutral-50'
                      }`}
                    >
                      {pType}
                    </button>
                  );
                })}
              </div>
            </div>

            {config.pattern && config.pattern.type !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-[#FFFDF8] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-neutral-800">
                    <span>Pattern Opacity</span>
                    <span>{Math.round((config.pattern.opacity ?? 0.12) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={Math.round((config.pattern.opacity ?? 0.12) * 100)}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        pattern: {
                          ...(prev.pattern || { type: 'dots', color: prev.foreground }),
                          opacity: Number(e.target.value) / 100,
                        },
                      }))
                    }
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-800">Pattern Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.pattern.color || config.foreground}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          pattern: {
                            ...(prev.pattern || { type: 'dots', opacity: 0.12 }),
                            color: e.target.value,
                          },
                        }))
                      }
                      className="w-10 h-8 border-2 border-black cursor-pointer bg-white"
                    />
                    <span className="text-xs font-mono font-bold">{config.pattern.color || config.foreground}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FRAMES */}
      {activeTab === 'frames' && (
        <div className="space-y-4 pt-1">
          {/* Category Filter */}
          <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
            {FRAME_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFrameCategory(cat)}
                className={`px-2.5 py-1 text-xs font-bold border-2 border-black whitespace-nowrap transition-all ${
                  frameCategory === cat
                    ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                    : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Frame Text & Placement inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFFDF8] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Frame Text / CTA</label>
              <input
                type="text"
                value={config.frame?.text || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    frame: {
                      ...(prev.frame || {
                        id: 'custom-frame',
                        style: 'pill-banner',
                        textColor: '#000000',
                        backgroundColor: '#FFE600',
                        borderColor: '#000000',
                        borderWidth: 3,
                        position: 'bottom',
                      }),
                      text: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. SCAN ME or VISIT STORE"
                className="w-full px-3 py-1.5 text-xs font-bold bg-white border-2 border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800">Subtext (Optional)</label>
              <input
                type="text"
                value={config.frame?.subtext || ''}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    frame: {
                      ...(prev.frame || {
                        id: 'custom-frame',
                        style: 'pill-banner',
                        text: 'SCAN ME',
                        textColor: '#000000',
                        backgroundColor: '#FFE600',
                        borderColor: '#000000',
                        borderWidth: 3,
                        position: 'bottom',
                      }),
                      subtext: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. POINT CAMERA HERE"
                className="w-full px-3 py-1.5 text-xs font-bold bg-white border-2 border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Frame Colors & Styling Controls */}
          {config.frame && config.frame.style !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FFFDF8] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Frame Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.frame.backgroundColor || '#FFE600'}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        frame: {
                          ...(prev.frame || DEFAULT_FRAME_FALLBACK),
                          backgroundColor: e.target.value,
                        },
                      }))
                    }
                    className="w-9 h-8 border-2 border-black cursor-pointer bg-white"
                  />
                  <span className="text-xs font-mono font-bold">{config.frame.backgroundColor || '#FFE600'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Frame Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.frame.textColor || '#000000'}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        frame: {
                          ...(prev.frame || DEFAULT_FRAME_FALLBACK),
                          textColor: e.target.value,
                        },
                      }))
                    }
                    className="w-9 h-8 border-2 border-black cursor-pointer bg-white"
                  />
                  <span className="text-xs font-mono font-bold">{config.frame.textColor || '#000000'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800">Frame Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.frame.borderColor || '#000000'}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        frame: {
                          ...(prev.frame || DEFAULT_FRAME_FALLBACK),
                          borderColor: e.target.value,
                        },
                      }))
                    }
                    className="w-9 h-8 border-2 border-black cursor-pointer bg-white"
                  />
                  <span className="text-xs font-mono font-bold">{config.frame.borderColor || '#000000'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Frames List Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {/* No Frame Option */}
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  frame: undefined,
                }))
              }
              className={`p-3 border-2 border-black text-center font-bold text-xs transition-all ${
                !config.frame
                  ? 'bg-black text-[#FFE600] font-black shadow-[2px_2px_0px_0px_#FFE600]'
                  : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
              }`}
            >
              [NO FRAME]
            </button>

            {filteredFrames.map((f) => {
              const isSelected = config.frame?.id === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      frame: {
                        id: f.id,
                        style: f.style,
                        text: prev.frame?.text || f.text,
                        subtext: prev.frame?.subtext || f.subtext,
                        textColor: f.textColor,
                        backgroundColor: f.backgroundColor,
                        borderColor: f.borderColor,
                        borderWidth: f.borderWidth,
                        position: f.position,
                        badgeIcon: f.badgeIcon,
                      },
                    }))
                  }
                  className={`p-2.5 border-2 border-black text-left transition-all ${
                    isSelected
                      ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                      : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div
                    className="w-full py-1 px-1.5 text-[10px] font-black text-center truncate mb-1 border border-black"
                    style={{ backgroundColor: f.backgroundColor, color: f.textColor }}
                  >
                    {f.text}
                  </div>
                  <div className="text-[11px] font-black truncate">{f.name}</div>
                  <div className="text-[9px] text-neutral-500 uppercase">{f.category}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: FONTS & TYPOGRAPHY */}
      {activeTab === 'fonts' && (
        <div className="space-y-4 pt-1">
          {/* Active Font & Live Preview Banner */}
          {(() => {
            const currentFontId = config.typography?.fontId || 'space-grotesk';
            const currentFont = FONT_DEFINITIONS.find((f) => f.id === currentFontId) || FONT_DEFINITIONS[0];
            const activeFamily = config.typography?.fontFamily || currentFont.family;
            const activeWeight = config.typography?.fontWeight || '800';
            const activeSpacing = config.typography?.letterSpacing ?? 1;
            const activeTransform = config.typography?.textTransform || 'uppercase';

            return (
              <div className="bg-[#FFFDF8] border-2 border-black p-3.5 shadow-[2px_2px_0px_0px_#000] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-neutral-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-black text-[#FFE600] border border-black">
                      ACTIVE FONT
                    </span>
                    <span className="text-xs font-black text-black font-mono">
                      {currentFont.name} ({currentFont.category})
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-600 font-mono">
                    Weight: {activeWeight} • Spacing: {activeSpacing}px
                  </span>
                </div>

                {/* Live Real-time Sample Banner in exact font */}
                <div
                  className="w-full p-2.5 bg-white border-2 border-black text-center truncate text-base overflow-hidden"
                  style={{
                    fontFamily: activeFamily,
                    fontWeight: activeWeight,
                    letterSpacing: `${activeSpacing}px`,
                    textTransform: activeTransform,
                  }}
                >
                  SCAN TO PAY • SANN STORE 123
                </div>

                {/* Fine Tuning Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Font Weight */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-neutral-800">Font Weight</label>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { val: '400', label: 'Regular' },
                        { val: '600', label: 'Medium' },
                        { val: '700', label: 'Bold' },
                        { val: '800', label: 'Heavy' },
                        { val: '900', label: 'Black' },
                      ].map((w) => (
                        <button
                          key={w.val}
                          type="button"
                          onClick={() =>
                            onChange((prev) => ({
                              ...prev,
                              typography: {
                                ...(prev.typography || {
                                  fontSize: 16,
                                  fontId: currentFont.id,
                                  fontFamily: currentFont.family,
                                  letterSpacing: 1,
                                }),
                                fontWeight: w.val,
                              },
                            }))
                          }
                          className={`px-2 py-0.5 text-[10px] font-black border border-black ${
                            activeWeight === w.val
                              ? 'bg-black text-[#FFE600]'
                              : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-black uppercase text-neutral-800">
                      <span>Tracking / Spacing</span>
                      <span>{activeSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={-1}
                      max={5}
                      step={0.5}
                      value={activeSpacing}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          typography: {
                            ...(prev.typography || {
                              fontSize: 16,
                              fontWeight: '800',
                              fontId: currentFont.id,
                              fontFamily: currentFont.family,
                            }),
                            letterSpacing: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  {/* Text Transform */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-neutral-800">Case Transform</label>
                    <div className="flex gap-1">
                      {(['uppercase', 'capitalize', 'none'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            onChange((prev) => ({
                              ...prev,
                              typography: {
                                ...(prev.typography || {
                                  fontSize: 16,
                                  fontWeight: '800',
                                  letterSpacing: 1,
                                  fontId: currentFont.id,
                                  fontFamily: currentFont.family,
                                }),
                                textTransform: t,
                              },
                            }))
                          }
                          className={`flex-1 py-0.5 text-[10px] font-black border border-black uppercase ${
                            activeTransform === t
                              ? 'bg-black text-[#FFE600]'
                              : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                        >
                          {t === 'none' ? 'Normal' : t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Font Categories */}
          <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
            {FONT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFontCategory(cat)}
                className={`px-2.5 py-1 text-xs font-bold border-2 border-black whitespace-nowrap transition-all ${
                  fontCategory === cat
                    ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                    : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Fonts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
            {filteredFonts.map((f) => (
              <FontGridItem
                key={f.id}
                font={f}
                isSelected={config.typography?.fontId === f.id}
                onSelect={handleSelectFont}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LOGO */}
      {activeTab === 'logo' && (
        <div className="space-y-4 pt-1">
          {/* Logo Upload Dropzone */}
          <div className="border-2 border-dashed border-black bg-[#FFFDF8] p-4 text-center space-y-2">
            {config.logo?.dataUrl ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 border-2 border-black bg-white p-1 flex items-center justify-center shadow-[2px_2px_0px_0px_#000] overflow-hidden ${
                    config.logo.borderRadius === 50 ? 'rounded-full' : 'rounded-md'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.logo.dataUrl}
                    alt="Uploaded Logo"
                    className={`w-full h-full object-cover ${
                      config.logo.borderRadius === 50 ? 'rounded-full' : 'rounded-sm'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black">Custom Logo Active</span>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-2 py-1 bg-[#FF5E5B] text-white text-xs font-bold border border-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="cursor-pointer inline-flex flex-col items-center gap-1.5 p-3">
                  <div className="w-10 h-10 bg-black text-[#FFE600] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase text-black">Upload Logo (PNG, JPG, WEBP, SVG)</span>
                  <span className="text-[11px] text-neutral-600">Max size 3MB • Auto adjusts Error Correction</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Logo Parameters */}
          {config.logo?.dataUrl && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFFDF8] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {/* Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Logo Size Ratio</span>
                  <span className={config.logo.size > 26 ? 'text-red-600 font-black' : ''}>
                    {config.logo.size}% {config.logo.size > 26 ? '(⚠ high)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={30}
                  value={config.logo.size}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      logo: {
                        ...(prev.logo || { padding: 6, backgroundColor: '#FFFFFF', borderRadius: 50, opacity: 1 }),
                        size: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Padding Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Logo Padding</span>
                  <span>{config.logo.padding}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={config.logo.padding}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      logo: {
                        ...(prev.logo || { size: 20, backgroundColor: '#FFFFFF', borderRadius: 50, opacity: 1 }),
                        padding: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Shape: Circle vs Square */}
              <div className="space-y-1">
                <label className="text-xs font-bold">Badge Shape</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        logo: {
                          ...(prev.logo || { size: 20, padding: 6, backgroundColor: '#FFFFFF', opacity: 1 }),
                          borderRadius: 50,
                        },
                      }))
                    }
                    className={`flex-1 py-1.5 text-xs font-bold border-2 border-black ${
                      config.logo.borderRadius === 50
                        ? 'bg-black text-[#FFE600] font-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    Circle
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        logo: {
                          ...(prev.logo || { size: 20, padding: 6, backgroundColor: '#FFFFFF', opacity: 1 }),
                          borderRadius: 8,
                        },
                      }))
                    }
                    className={`flex-1 py-1.5 text-xs font-bold border-2 border-black ${
                      config.logo.borderRadius !== 50
                        ? 'bg-black text-[#FFE600] font-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    Rounded Box
                  </button>
                </div>
              </div>

              {/* Logo Background Color */}
              <div className="space-y-1">
                <label className="text-xs font-bold">Logo Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.logo.backgroundColor || '#FFFFFF'}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        logo: {
                          ...(prev.logo || { size: 20, padding: 6, borderRadius: 50, opacity: 1 }),
                          backgroundColor: e.target.value,
                        },
                      }))
                    }
                    className="w-10 h-8 border-2 border-black cursor-pointer bg-white"
                  />
                  <span className="text-xs font-mono font-bold">{config.logo.backgroundColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ADVANCED & SAFETY */}
      {activeTab === 'advanced' && (
        <div className="space-y-4 pt-1">
          {/* Error Correction Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-black font-mono">
                Error Correction Level (Reed-Solomon)
              </label>
              <span className="text-xs font-mono font-bold bg-neutral-100 px-1.5 border border-black">
                {config.errorCorrectionLevel}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'L', label: 'L (7%)', desc: 'Minimal redundancy' },
                { id: 'M', label: 'M (15%)', desc: 'Standard default' },
                { id: 'Q', label: 'Q (25%)', desc: 'High reliability' },
                { id: 'H', label: 'H (30%)', desc: 'Best with logos' },
              ].map((lvl) => {
                const isSelected = config.errorCorrectionLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        errorCorrectionLevel: lvl.id as any,
                      }))
                    }
                    className={`p-2 border-2 border-black text-left transition-all ${
                      isSelected
                        ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                        : 'bg-white text-black hover:bg-neutral-50 shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    <div className="text-xs font-black">{lvl.label}</div>
                    <div className="text-[10px] text-neutral-600">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiet Zone Margin Slider */}
          <div className="space-y-1.5 pt-2 border-t-2 border-neutral-200">
            <div className="flex justify-between text-xs font-bold">
              <span>Quiet Zone Border (Modules)</span>
              <span>{config.quietZone} modules {config.quietZone < 3 ? '(tight)' : '(standard)'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={config.quietZone}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  quietZone: Number(e.target.value),
                }))
              }
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Hard Drop Shadow */}
          <div className="space-y-1.5 pt-2 border-t-2 border-neutral-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-black font-mono">
                Brutalist Drop Shadow
              </label>
              <input
                type="checkbox"
                checked={config.shadow?.enabled ?? true}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    shadow: {
                      ...(prev.shadow || { color: '#000000', x: 4, y: 4, blur: 0 }),
                      enabled: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 accent-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CustomizationPanel = React.memo(CustomizationPanelComponent);
export default CustomizationPanel;

