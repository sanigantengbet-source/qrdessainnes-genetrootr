'use client';

import React, { useState, useRef } from 'react';
import { CardTheme, CustomImageSettings } from '@/types/cardTheme';
import { X, ZoomIn, ZoomOut, Move, Check, RefreshCw, Eye, Layers } from 'lucide-react';

interface CustomCardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialSettings?: CustomImageSettings;
  currentQrName?: string;
  onApplyCustomCard: (theme: CardTheme) => void;
}

export default function CustomCardEditorModal({
  isOpen,
  onClose,
  imageUrl,
  initialSettings,
  currentQrName = 'SANN STORE',
  onApplyCustomCard,
}: CustomCardEditorModalProps) {
  const [ratio, setRatio] = useState<'portrait' | 'square'>(initialSettings?.ratio || 'portrait');
  const [zoom, setZoom] = useState<number>(initialSettings?.zoom || 1.15);
  const [cropX, setCropX] = useState<number>(initialSettings?.cropX ?? 50);
  const [cropY, setCropY] = useState<number>(initialSettings?.cropY ?? 50);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(initialSettings?.overlayOpacity ?? 0.15);
  const [overlayColor, setOverlayColor] = useState<string>(initialSettings?.overlayColor || '#000000');
  const [showQROverlay, setShowQROverlay] = useState(true);
  const [borderColor, setBorderColor] = useState('#000000');
  const [cardTitleColor, setCardTitleColor] = useState('#000000');

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialCropX: 50, initialCropY: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  // Handle Drag / Pan with mouse or touch
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialCropX: cropX,
      initialCropY: cropY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Movement speed proportional to zoom
    const sensitivityX = (100 / rect.width) * (1 / Math.max(0.5, zoom - 0.8));
    const sensitivityY = (100 / rect.height) * (1 / Math.max(0.5, zoom - 0.8));

    const nextX = Math.min(100, Math.max(0, dragStartRef.current.initialCropX - dx * sensitivityX * 0.4));
    const nextY = Math.min(100, Math.max(0, dragStartRef.current.initialCropY - dy * sensitivityY * 0.4));

    setCropX(nextX);
    setCropY(nextY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Build and emit full CardTheme
  const handleApply = () => {
    const isPortrait = ratio === 'portrait';
    const cardWidth = 640;
    const cardHeight = isPortrait ? 880 : 640;

    const customTheme: CardTheme = {
      id: `custom-card-${Date.now()}`,
      name: 'My Custom Card',
      category: 'Modern',
      description: 'Custom uploaded card template with user artwork background',
      layout: 'center-standard',
      isCustom: true,
      customBackgroundImage: imageUrl,
      customImageSettings: {
        ratio,
        zoom,
        cropX,
        cropY,
        overlayOpacity,
        overlayColor,
      },
      dimensions: {
        width: cardWidth,
        height: cardHeight,
      },
      cardBg: '#FFFFFF',
      cardBorder: {
        color: borderColor,
        width: borderColor === 'transparent' ? 0 : 3,
        radius: 20,
      },
      cardShadow: {
        color: '#000000',
        offsetX: 6,
        offsetY: 6,
        blur: 0,
      },
      qrContainer: {
        bg: '#FFFFFF',
        border: '#000000',
        borderWidth: 3,
        radius: 16,
        padding: 24,
        size: 380,
        yOffset: isPortrait ? 190 : 130,
      },
      header: {
        badgeText: 'CUSTOM CARD',
        badgeBg: '#FFE600',
        badgeTextColor: '#000000',
        badgeBorderColor: '#000000',
        titleColor: cardTitleColor,
        subtitleColor: cardTitleColor === '#FFFFFF' ? '#E5E7EB' : '#4B5563',
        fontSize: 28,
        align: 'center',
      },
      footer: {
        ctaText: 'SCAN ME',
        ctaBg: '#FFE600',
        ctaTextColor: '#000000',
        ctaBorderColor: '#000000',
        ctaRadius: 25,
        hintText: 'POINT CAMERA AT QR CODE',
        hintColor: cardTitleColor === '#FFFFFF' ? '#F3F4F6' : '#374151',
        showSecurityBadge: isPortrait,
      },
      decoration: {
        type: 'none',
      },
    };

    onApplyCustomCard(customTheme);
    onClose();
  };

  if (!isOpen) return null;

  const isPortrait = ratio === 'portrait';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#FFE600] border-b-[3px] border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-black text-[#FFE600] border border-black shadow-[1px_1px_0px_0px_#000]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase text-black font-mono tracking-wide">
                CUSTOM CARD EDITOR
              </h3>
              <p className="text-[11px] font-bold text-neutral-800">
                Sesuaikan area gambar, rasio card, zoom, dan posisi agar pas di atas kartu QR.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-black text-white hover:bg-[#FF5E5B] hover:text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 bg-[#FFFDF8]">
          {/* LEFT: Live Interactive Preview Stage (cols 7) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-between w-full max-w-[340px]">
              <span className="text-xs font-black uppercase font-mono text-black flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-neutral-600" />
                Drag / Pan Preview Stage
              </span>
              <button
                type="button"
                onClick={() => setShowQROverlay((prev) => !prev)}
                className={`text-[11px] font-black font-mono px-2 py-0.5 border-2 border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1 ${
                  showQROverlay ? 'bg-[#FFE600] text-black' : 'bg-white text-neutral-600'
                }`}
              >
                <Eye className="w-3 h-3" />
                {showQROverlay ? 'Hide QR Overlay' : 'Show QR Overlay'}
              </button>
            </div>

            {/* Draggable Stage Container */}
            <div
              ref={stageRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`w-full max-w-[340px] relative border-[3px] border-black shadow-[5px_5px_0px_0px_#000] cursor-grab active:cursor-grabbing select-none overflow-hidden bg-neutral-900 rounded-[16px] transition-all duration-200 ${
                isPortrait ? 'aspect-[640/880]' : 'aspect-square'
              }`}
            >
              {/* Background Image with Zoom & Pan */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Custom Card Artwork"
                draggable={false}
                style={{
                  width: `${zoom * 100}%`,
                  height: `${zoom * 100}%`,
                  objectFit: 'cover',
                  transform: `translate(${-(cropX / 100) * (zoom - 1) * 100}%, ${-(cropY / 100) * (zoom - 1) * 100}%)`,
                  transformOrigin: 'top left',
                }}
                className="absolute inset-0 pointer-events-none transition-transform duration-75 max-w-none"
              />

              {/* Tint / Contrast Overlay */}
              {overlayOpacity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
                />
              )}

              {/* QR Elements Overlay (Shows actual card composition) */}
              {showQROverlay && (
                <div className="absolute inset-0 p-4 flex flex-col justify-between items-center pointer-events-none">
                  {/* Top: Header Badge & QR Name */}
                  <div className="flex flex-col items-center space-y-1 mt-1 text-center">
                    <span className="px-3 py-0.5 bg-[#FFE600] text-black text-[9px] font-black uppercase font-mono border-2 border-black shadow-[1px_1px_0px_0px_#000]">
                      CUSTOM CARD
                    </span>
                    <h4
                      className="text-base sm:text-lg font-black tracking-wider uppercase drop-shadow font-sans max-w-[260px] truncate"
                      style={{ color: cardTitleColor }}
                    >
                      {currentQrName}
                    </h4>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wide opacity-80"
                      style={{ color: cardTitleColor }}
                    >
                      SCANNABLE PRESENTATION CARD
                    </span>
                  </div>

                  {/* Center: QR Container Mockup */}
                  <div className="w-[58%] aspect-square bg-white border-[3px] border-black rounded-[12px] p-2 flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                    <div className="w-full h-full border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[10px] font-mono font-black text-black">[ QR CODE ]</span>
                      <span className="text-[8px] font-bold text-neutral-500">Live QR Sits Here</span>
                    </div>
                  </div>

                  {/* Bottom: CTA Button */}
                  <div className="flex flex-col items-center space-y-1 mb-1">
                    <div className="px-5 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase font-mono border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]">
                      SCAN ME
                    </div>
                    {isPortrait && (
                      <span
                        className="text-[8px] font-mono font-bold opacity-80"
                        style={{ color: cardTitleColor }}
                      >
                        POINT CAMERA HERE
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Drag instruction overlay badge */}
              <div className="absolute top-2 left-2 pointer-events-none bg-black/75 text-white px-2 py-0.5 text-[9px] font-mono font-bold rounded">
                Pan: {Math.round(cropX)}% , {Math.round(cropY)}%
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 font-mono text-center">
              💡 Klik & geser gambar di preview atau gunakan kontrol slider di sebelah kanan.
            </p>
          </div>

          {/* RIGHT: Controls & Settings (cols 5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Ratio Selector */}
            <div className="bg-white p-3.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
              <label className="text-xs font-black uppercase font-mono text-black">
                1. Pilih Rasio Card
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRatio('portrait')}
                  className={`py-2 px-3 border-2 border-black text-xs font-black font-mono flex flex-col items-center gap-1 transition-all ${
                    ratio === 'portrait'
                      ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>Portrait Standee</span>
                  <span className="text-[10px] opacity-75">640 × 880 (Stand)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatio('square')}
                  className={`py-2 px-3 border-2 border-black text-xs font-black font-mono flex flex-col items-center gap-1 transition-all ${
                    ratio === 'square'
                      ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>Square Card</span>
                  <span className="text-[10px] opacity-75">640 × 640 (1:1)</span>
                </button>
              </div>
            </div>

            {/* 2. Zoom & Crop Controls */}
            <div className="bg-white p-3.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase font-mono text-black">
                  2. Zoom & Reposisi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.15);
                    setCropX(50);
                    setCropY(50);
                  }}
                  className="text-[10px] font-black font-mono text-neutral-600 hover:text-black flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Zoom Level</span>
                  <span className="font-mono">{zoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(1.0, +(prev - 0.1).toFixed(2)))}
                    className="p-1 border border-black bg-neutral-100 hover:bg-neutral-200"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={1.0}
                    max={3.0}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-black cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(3.0, +(prev + 0.1).toFixed(2)))}
                    className="p-1 border border-black bg-neutral-100 hover:bg-neutral-200"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Posisi Horizontal (X)</span>
                  <span className="font-mono">{Math.round(cropX)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Vertical Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Posisi Vertikal (Y)</span>
                  <span className="font-mono">{Math.round(cropY)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Contrast & Readability Tint */}
            <div className="bg-white p-3.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2.5">
              <label className="text-xs font-black uppercase font-mono text-black">
                3. Tint / Overlay Keterbacaan
              </label>
              <p className="text-[10px] text-neutral-600">
                Beri sedikit lapisan gelap atau terang agar teks dan QR terlihat kontras.
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'None', opacity: 0, color: '#000000' },
                  { label: 'Dark 15%', opacity: 0.15, color: '#000000' },
                  { label: 'Dark 30%', opacity: 0.3, color: '#000000' },
                  { label: 'Light 15%', opacity: 0.15, color: '#FFFFFF' },
                  { label: 'Light 30%', opacity: 0.3, color: '#FFFFFF' },
                ].map((tint, idx) => {
                  const isSelected =
                    overlayOpacity === tint.opacity && overlayColor === tint.color;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setOverlayOpacity(tint.opacity);
                        setOverlayColor(tint.color);
                      }}
                      className={`py-1.5 px-1 text-[10px] font-black border-2 border-black font-mono transition-all text-center ${
                        isSelected
                          ? 'bg-black text-[#FFE600]'
                          : 'bg-[#FFFDF8] text-black hover:bg-neutral-100'
                      }`}
                    >
                      {tint.label}
                    </button>
                  );
                })}
              </div>

              {/* Title text color toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-black/10">
                <span className="text-xs font-bold text-neutral-800">Warna Teks Judul</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCardTitleColor('#000000')}
                    className={`px-2.5 py-0.5 text-xs font-black border-2 border-black font-mono ${
                      cardTitleColor === '#000000' ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    Hitam
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTitleColor('#FFFFFF')}
                    className={`px-2.5 py-0.5 text-xs font-black border-2 border-black font-mono ${
                      cardTitleColor === '#FFFFFF' ? 'bg-black text-[#FFE600]' : 'bg-white text-black'
                    }`}
                  >
                    Putih
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-black uppercase font-mono bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2.5 px-4 text-xs font-black uppercase font-mono bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Terapkan Custom Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
