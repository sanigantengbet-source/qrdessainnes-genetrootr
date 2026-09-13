'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect, useTransition } from 'react';
import { CardTheme, CardCategory } from '@/types/cardTheme';
import { CARD_CATEGORIES, ALL_CARD_THEMES } from '@/lib/constants/cardThemes';
import { renderCardThemeMiniPreviewSVG } from '@/lib/qr/cardRenderer';
import CustomCardEditorModal from '@/components/CustomCardEditorModal';
import {
  Layers,
  Search,
  Check,
  ChevronDown,
  Upload,
  Edit3,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

interface CardThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (theme: CardTheme) => void;
  qrName?: string;
  currentTheme?: CardTheme;
}

const ThemeCardItem = React.memo(function ThemeCardItem({
  theme,
  isSelected,
  onSelect,
}: {
  theme: CardTheme;
  isSelected: boolean;
  onSelect: (theme: CardTheme) => void;
}) {
  const miniSvg = useMemo(() => {
    return renderCardThemeMiniPreviewSVG(theme, 'SANN STORE');
  }, [theme]);

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        onSelect(theme);
      }}
      className={`group relative flex flex-col bg-[#FFFDF8] border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-black ring-4 ring-[#FFE600] shadow-[4px_4px_0px_0px_#000] scale-[1.01]'
          : 'border-black hover:border-black hover:shadow-[3px_3px_0px_0px_#000]'
      }`}
    >
      {/* Selected Floating Checkmark Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-black text-[#FFE600] border-2 border-[#FFE600] flex items-center justify-center rounded-full shadow-md">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Miniature Card Canvas Preview */}
      <div className="w-full aspect-[3/4] bg-neutral-100 p-2 flex items-center justify-center overflow-hidden border-b-2 border-black">
        <div
          className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
          dangerouslySetInnerHTML={{ __html: miniSvg }}
        />
      </div>

      {/* Theme Details Footer */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#F5F2EB] text-neutral-700 border border-black/30 rounded truncate">
              {theme.category}
            </span>
            <span className="text-[9px] font-mono text-neutral-500 uppercase">
              {theme.dimensions.height === 640 ? '1:1 Sq' : 'Stand'}
            </span>
          </div>
          <h4 className="text-xs font-black text-black leading-tight line-clamp-1">
            {theme.name}
          </h4>
        </div>

        <p className="text-[10px] text-neutral-500 leading-snug line-clamp-1 mt-1 font-sans">
          {theme.description}
        </p>
      </div>
    </div>
  );
});

function CardThemeSelectorComponent({
  selectedThemeId,
  onSelectTheme,
  qrName = 'SANN STORE',
  currentTheme,
}: CardThemeSelectorProps) {
  // Tab Switcher: 'presets' (100+ themes) vs 'custom' (Upload & Edit)
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>(() =>
    selectedThemeId.startsWith('custom-card') ? 'custom' : 'presets'
  );

  // Local optimistic selection for zero-delay visual response
  const [optimisticThemeId, setOptimisticThemeId] = useState<string | null>(null);
  const activeSelectedId = optimisticThemeId ?? selectedThemeId;
  const [, startTransition] = useTransition();

  if (optimisticThemeId !== null && optimisticThemeId === selectedThemeId) {
    setOptimisticThemeId(null);
  }

  const handleSelectThemeOptimistic = useCallback((theme: CardTheme) => {
    setOptimisticThemeId(theme.id);
    startTransition(() => {
      onSelectTheme(theme);
    });
  }, [onSelectTheme]);

  // Existing themes state
  const [activeCategory, setActiveCategory] = useState<CardCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(16);

  // Custom Card state
  const [customTheme, setCustomTheme] = useState<CardTheme | null>(() => {
    if (currentTheme?.isCustom) return currentTheme;
    return null;
  });
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter existing themes
  const filteredThemes = useMemo(() => {
    return ALL_CARD_THEMES.filter((theme) => {
      const matchCategory = activeCategory === 'All' || theme.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const visibleThemes = useMemo(() => {
    return filteredThemes.slice(0, displayCount);
  }, [filteredThemes, displayCount]);

  // Determine active theme name for display
  const activeThemeDisplay = useMemo(() => {
    if (selectedThemeId.startsWith('custom-card')) {
      return customTheme?.name || 'Custom Card Theme';
    }
    const found = ALL_CARD_THEMES.find((t) => t.id === selectedThemeId);
    return found?.name || ALL_CARD_THEMES[0].name;
  }, [selectedThemeId, customTheme]);

  // Handle custom image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    setUploadError(null);

    // Validate type: PNG, JPG/JPEG, WEBP
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Format tidak didukung. Harap upload gambar PNG, JPG, atau WEBP.');
      return;
    }

    // Validate size: max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Ukuran file terlalu besar (maksimal 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPendingImageUrl(dataUrl);
        // Automatically open editor modal so user can crop & position properly
        setIsEditorOpen(true);
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file gambar. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Called when user finishes editing in CustomCardEditorModal
  const handleApplyCustomCard = (savedTheme: CardTheme) => {
    setCustomTheme(savedTheme);
    onSelectTheme(savedTheme);
    setActiveTab('custom');
  };

  // Remove / reset custom card
  const handleRemoveCustomCard = () => {
    setCustomTheme(null);
    setPendingImageUrl(null);
    if (selectedThemeId.startsWith('custom-card')) {
      onSelectTheme(ALL_CARD_THEMES[0]);
      setActiveTab('presets');
    }
  };

  return (
    <div className="w-full bg-white border-[3px] border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#000] space-y-4">
      {/* Header with Title & Active Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Layers className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-black uppercase tracking-wider text-black font-mono">
                CHOOSE CARD THEME
              </label>
              <span className="px-2 py-0.5 bg-black text-[#FFE600] text-[10px] font-black font-mono">
                100+ THEMES &amp; CUSTOM
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 font-sans">
              Pilih template kartu modern atau upload background kartu kustom Anda sendiri.
            </p>
          </div>
        </div>

        {/* Selected Theme Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#F5F2EB] px-2.5 py-1 border-2 border-black text-xs font-bold font-mono">
          <span className="text-neutral-500">Active:</span>
          <span className="text-black truncate max-w-[140px] sm:max-w-[180px] font-black">
            {activeThemeDisplay}
          </span>
        </div>
      </div>

      {/* Primary Tab Switcher: Existing Themes (100+) vs Custom Card */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F2EB] border-2 border-black">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`py-2 px-3 text-xs font-black uppercase font-mono border-2 border-black flex items-center justify-center gap-2 transition-all ${
            activeTab === 'presets'
              ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
              : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>CARD THEMES ({ALL_CARD_THEMES.length}+)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`py-2 px-3 text-xs font-black uppercase font-mono border-2 border-black flex items-center justify-center gap-2 transition-all ${
            activeTab === 'custom'
              ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
              : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>CUSTOM CARD {customTheme ? '●' : ''}</span>
        </button>
      </div>

      {/* TAB 1: EXISTING CARD THEMES (100+) */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          {/* Search Bar & Category Filter */}
          <div className="space-y-2.5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(16);
                }}
                placeholder="Cari tema kartu (e.g. Coral Wave, QRIS, Neo Brutal, Slated, VIP, Cafe)..."
                className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-[#FFFDF8] border-2 border-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-500 hover:text-black font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setDisplayCount(16);
                }}
                className={`px-3 py-1 text-xs font-black whitespace-nowrap transition-all border-2 border-black font-mono ${
                  activeCategory === 'All'
                    ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                    : 'bg-white text-black hover:bg-[#F5F2EB] shadow-[1px_1px_0px_0px_#000]'
                }`}
              >
                All ({ALL_CARD_THEMES.length})
              </button>
              {CARD_CATEGORIES.map((category) => {
                const count = ALL_CARD_THEMES.filter((t) => t.category === category).length;
                const isSelected = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setDisplayCount(16);
                    }}
                    className={`px-3 py-1 text-xs font-black whitespace-nowrap transition-all border-2 border-black font-mono ${
                      isSelected
                        ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                        : 'bg-white text-black hover:bg-[#F5F2EB] shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Miniature Card Previews Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
            {visibleThemes.map((theme) => (
              <ThemeCardItem
                key={theme.id}
                theme={theme}
                isSelected={theme.id === activeSelectedId}
                onSelect={handleSelectThemeOptimistic}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredThemes.length === 0 && (
            <div className="py-10 text-center bg-[#FFFDF8] border-2 border-dashed border-black">
              <p className="text-sm font-bold text-neutral-800 font-mono">
                Tidak ada tema kartu yang cocok dengan pencarian &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="mt-3 px-4 py-1.5 text-xs font-black bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Pagination / Expand More */}
          {filteredThemes.length > displayCount && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t-2 border-black/20">
              <span className="text-xs font-mono font-bold text-neutral-600">
                Menampilkan {visibleThemes.length} dari {filteredThemes.length} Card Themes
              </span>
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => Math.min(prev + 24, filteredThemes.length))}
                className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-[#FFFDF8] hover:bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5 font-mono"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Tampilkan Lebih Banyak ({filteredThemes.length - visibleThemes.length} tema lagi)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOM CARD (UPLOAD & EDIT) */}
      {activeTab === 'custom' && (
        <div className="space-y-4 pt-1">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadError && (
            <div className="p-3 bg-[#FF5E5B]/20 border-2 border-[#FF5E5B] text-xs font-bold text-black font-mono">
              ⚠️ {uploadError}
            </div>
          )}

          {/* Condition A: No Custom Card Uploaded Yet */}
          {!customTheme ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-[3px] border-dashed border-black bg-[#FFFDF8] hover:bg-[#FFE600]/10 p-8 sm:p-12 text-center cursor-pointer transition-all shadow-[3px_3px_0px_0px_#000] flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-14 h-14 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-black" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-sm font-black uppercase font-mono text-black">
                  UPLOAD GAMBAR / TEMPLATE CARD SENDIRI
                </h4>
                <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                  Tarik dan lepas file di sini, atau klik untuk memilih file dari komputer atau HP Anda.
                </p>
                <p className="text-[11px] font-mono font-bold text-neutral-500">
                  Format didukung: PNG, JPG, JPEG, WEBP (Maksimal 5MB)
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase font-mono shadow-[3px_3px_0px_0px_#000] group-hover:bg-[#FFE600]/90"
              >
                PILIH GAMBAR DARI PERANGKAT
              </button>
            </div>
          ) : (
            /* Condition B: Custom Card Has Been Uploaded & Created */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 sm:p-5 bg-[#FFFDF8] border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              {/* Left Column: Miniature Card Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div
                  className={`w-full max-w-[220px] bg-neutral-100 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden ${
                    customTheme.dimensions.height === 640 ? 'aspect-square' : 'aspect-[640/880]'
                  }`}
                >
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: renderCardThemeMiniPreviewSVG(customTheme, qrName || 'SANN STORE'),
                    }}
                  />
                </div>
                <span className="mt-2 text-[10px] font-mono font-bold text-neutral-600 uppercase">
                  Rasio Card: {customTheme.dimensions.height === 640 ? 'Square (1:1)' : 'Portrait Standee (3:4)'}
                </span>
              </div>

              {/* Right Column: Custom Card Controls & Actions */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black text-[#FFE600] text-[10px] font-black font-mono">
                      CUSTOM CARD ACTIVE
                    </span>
                    {selectedThemeId === customTheme.id && (
                      <span className="px-2 py-0.5 bg-[#22C55E] text-white text-[10px] font-black font-mono flex items-center gap-1 border border-black">
                        <Check className="w-3 h-3 stroke-[3]" /> Terpasang di Preview
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black uppercase font-mono text-black">
                    {customTheme.name}
                  </h4>
                  <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                    Template kartu custom buatan Anda digunakan sebagai latar belakang kartu. QR code, nama QR,
                    dan tombol CTA &quot;SCAN ME&quot; ditempatkan otomatis di atasnya secara rapi dan presisi.
                  </p>
                </div>

                {/* Action Buttons: Edit, Change, Remove */}
                <div className="space-y-2.5 pt-2 border-t-2 border-black/10">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* EDIT Button (Crop, Zoom, Reposition) */}
                    <button
                      type="button"
                      onClick={() => {
                        setPendingImageUrl(customTheme.customBackgroundImage || null);
                        setIsEditorOpen(true);
                      }}
                      className="flex-1 min-w-[130px] py-2 px-3 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase font-mono shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>EDIT CROP / POSISI</span>
                    </button>

                    {/* Change Image Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 bg-white hover:bg-neutral-100 text-black border-2 border-black text-xs font-black uppercase font-mono shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Ganti Gambar</span>
                    </button>

                    {/* Delete Custom Card */}
                    <button
                      type="button"
                      onClick={handleRemoveCustomCard}
                      className="p-2 bg-[#FF5E5B] text-white hover:bg-red-600 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                      title="Hapus Custom Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Apply if not currently active */}
                  {selectedThemeId !== customTheme.id && (
                    <button
                      type="button"
                      onClick={() => onSelectTheme(customTheme)}
                      className="w-full py-2 px-4 bg-black text-[#FFE600] border-2 border-black text-xs font-black uppercase font-mono shadow-[2px_2px_0px_0px_#FFE600] flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Gunakan Tema Custom Ini Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Informational Tip */}
          <div className="p-3 bg-[#F5F2EB] border-2 border-black text-xs text-neutral-700 flex items-start gap-2">
            <span className="text-base">💡</span>
            <div className="space-y-0.5">
              <p className="font-bold text-black font-mono">Tips Custom Card:</p>
              <p className="text-[11px]">
                Tekan tombol <strong>EDIT</strong> untuk mengatur rasio (Portrait atau Square), zoom gambar, dan
                menggeser fokus area artwork agar QR Code dan Nama QR tidak menutupi bagian penting gambar Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CARD EDITOR MODAL */}
      {isEditorOpen && pendingImageUrl && (
        <CustomCardEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          imageUrl={pendingImageUrl}
          initialSettings={customTheme?.customImageSettings}
          currentQrName={qrName}
          onApplyCustomCard={handleApplyCustomCard}
        />
      )}
    </div>
  );
}

const CardThemeSelector = React.memo(CardThemeSelectorComponent);
export default CardThemeSelector;
