'use client';

import React, { useState, useMemo } from 'react';
import { STYLE_PRESETS, STYLE_CATEGORIES } from '@/lib/constants/styles';
import { DEFAULT_DESIGN_CONFIG } from '@/lib/constants/defaults';
import { StylePreset, QRDesignConfig } from '@/types/qr';
import { Search, Star, Check } from 'lucide-react';
import { generateQRSVG } from '@/lib/qr/engine';

interface PresetSelectorProps {
  currentConfig: QRDesignConfig;
  onSelectPreset: (preset: StylePreset) => void;
}

// Module-level memoization cache so 120+ presets render instantly with zero lag
const PRESET_PREVIEW_CACHE = new Map<string, string>();

function getPresetPreviewSVG(preset: StylePreset): string {
  if (PRESET_PREVIEW_CACHE.has(preset.id)) {
    return PRESET_PREVIEW_CACHE.get(preset.id)!;
  }
  try {
    const fullConfig: QRDesignConfig = {
      ...DEFAULT_DESIGN_CONFIG,
      ...preset.config,
      quietZone: 2, // compact quiet zone so dots and finder corners are large and clearly visible
    };
    const svg = generateQRSVG({
      payload: 'https://qr.design',
      config: fullConfig,
      qrName: preset.name,
      renderSize: 140,
      idPrefix: `p-${preset.id}`,
    });
    PRESET_PREVIEW_CACHE.set(preset.id, svg);
    return svg;
  } catch {
    return '';
  }
}

export default function PresetSelector({ onSelectPreset }: PresetSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('qr_favorite_styles');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activePresetId, setActivePresetId] = useState<string>('');

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('qr_favorite_styles', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Filter presets based on category and search query
  const filteredPresets = useMemo(() => {
    return STYLE_PRESETS.filter((p) => {
      // Category match
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(p.id)) return false;
      } else if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, searchQuery, favorites]);

  return (
    <div className="w-full bg-white border-[3px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 bg-[#FFE600] inline-block"></span>
            3. Choose Style Preset ({STYLE_PRESETS.length}+ Available)
          </label>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search styles (e.g. Neon, Retro)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000]"
          />
        </div>
      </div>

      {/* Category Pills (Horizontal scrolling) */}
      <div className="flex overflow-x-auto pb-2 gap-1.5 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1 text-xs font-black border-2 border-black whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
              : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
          }`}
        >
          ALL ({STYLE_PRESETS.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('Favorites')}
          className={`px-3 py-1 text-xs font-black border-2 border-black whitespace-nowrap transition-all flex items-center gap-1 ${
            selectedCategory === 'Favorites'
              ? 'bg-[#FF5E5B] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
          }`}
        >
          <Star className="w-3 h-3 fill-current" />
          <span>FAVORITES ({favorites.length})</span>
        </button>

        {STYLE_CATEGORIES.map((cat) => {
          const count = STYLE_PRESETS.filter((p) => p.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-bold border-2 border-black whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                  : 'bg-[#FFFDF8] text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[420px] sm:max-h-[460px] overflow-y-auto p-1.5 pr-2 no-scrollbar border-2 border-black bg-[#FFFDF8]">
        {filteredPresets.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs font-bold text-neutral-500">
            No style presets found for &quot;{searchQuery}&quot; in this category.
          </div>
        ) : (
          filteredPresets.map((preset) => {
            const isFav = favorites.includes(preset.id);
            const isCurrent = activePresetId === preset.id;
            const svgMarkup = getPresetPreviewSVG(preset);

            return (
              <div
                key={preset.id}
                onClick={() => {
                  setActivePresetId(preset.id);
                  onSelectPreset(preset);
                }}
                className={`group relative p-2 border-2 border-black cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#FFE600] text-black ring-2 ring-black shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                }`}
              >
                {/* Visual Real QR SVG preview */}
                <div
                  className="w-full aspect-square border-2 border-black mb-2 flex items-center justify-center p-1.5 relative overflow-hidden bg-white shadow-inner"
                  style={{
                    backgroundColor:
                      preset.config.background === 'transparent'
                        ? '#F9FAFB'
                        : preset.config.background,
                  }}
                >
                  {/* Real rendered QR SVG */}
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />

                  {/* Favorite star toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(preset.id, e)}
                    className="absolute top-1 right-1 p-1 bg-white/95 border border-black rounded-sm shadow-sm hover:scale-110 transition-transform z-10"
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-[#FF5E5B] text-[#FF5E5B]' : 'text-neutral-600'
                      }`}
                    />
                  </button>

                  {/* Selected Indicator */}
                  {isCurrent && (
                    <div className="absolute inset-0 bg-black/15 flex items-end justify-center pb-1 pointer-events-none">
                      <span className="bg-black text-[#FFE600] px-1.5 py-0.5 text-[9px] font-black border border-black flex items-center gap-0.5 shadow-sm">
                        <Check className="w-2.5 h-2.5" /> SELECTED
                      </span>
                    </div>
                  )}
                </div>

                {/* Preset metadata */}
                <div className="space-y-0.5">
                  <div className="text-[9.5px] uppercase font-black tracking-wider text-neutral-500 font-mono flex items-center justify-between">
                    <span>{preset.category}</span>
                    <span className="text-[9px] text-neutral-400 capitalize">{preset.config.dotStyle}</span>
                  </div>
                  <div className="text-xs font-black text-black truncate leading-tight" title={preset.name}>
                    {preset.name}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
