import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Language } from '../utils/language';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
  lang?: Language;
}

export const ImageLightboxModal: React.FC<Props> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  subtitle,
  lang = 'bn',
}) => {
  const isBangla = lang === 'bn';
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter valid image strings
  const validImages = images.filter((img) => Boolean(img && img.trim().length > 0));

  useEffect(() => {
    if (isOpen) {
      const idx = Math.min(Math.max(initialIndex, 0), Math.max(validImages.length - 1, 0));
      setCurrentIndex(idx);
      setZoomLevel(1);
    }
  }, [isOpen, initialIndex, validImages.length]);

  const handleNext = useCallback(() => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
    setZoomLevel(1);
  }, [validImages.length]);

  const handlePrev = useCallback(() => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setZoomLevel(1);
  }, [validImages.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    },
    [isOpen, onClose, handleNext, handlePrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || validImages.length === 0) return null;

  const currentImage = validImages[currentIndex];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = `admin_photo_${currentIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-black/50 border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">
              {title || (isBangla ? 'পূর্ণাঙ্গ ছবি প্রিভিউ' : 'Full Image Preview')}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Counter & Action Controls */}
        <div className="flex items-center gap-2">
          {validImages.length > 1 && (
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/10">
              {isBangla ? `ছবি ${currentIndex + 1} / ${validImages.length}` : `${currentIndex + 1} of ${validImages.length}`}
            </span>
          )}

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10 text-white">
            <button
              onClick={handleZoomOut}
              title={isBangla ? 'ছোট করুন' : 'Zoom Out'}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title={isBangla ? 'রিসেট' : 'Reset'}
              className="px-2 py-1 text-[11px] font-mono hover:bg-white/20 rounded-lg transition-colors"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              title={isBangla ? 'বড় করুন' : 'Zoom In'}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            title={isBangla ? 'ছবি ডাউনলোড করুন' : 'Download Photo'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title={isBangla ? 'বন্ধ করুন' : 'Close'}
            className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors shadow-lg active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div
        className="flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden relative cursor-default"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Prev Button */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-emerald-600 text-white transition-all transform hover:scale-110 active:scale-95 border border-white/20 shadow-2xl backdrop-blur-sm"
            title={isBangla ? 'পূর্ববর্তী ছবি' : 'Previous Photo'}
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* The Full Image */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={currentImage}
            alt={title || 'Preview'}
            className="max-w-[92vw] max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none animate-scale-up"
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-emerald-600 text-white transition-all transform hover:scale-110 active:scale-95 border border-white/20 shadow-2xl backdrop-blur-sm"
            title={isBangla ? 'পরবর্তী ছবি' : 'Next Photo'}
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="w-full py-3 px-4 bg-black/60 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto shrink-0 z-10">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex
                  ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400/50'
                  : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
