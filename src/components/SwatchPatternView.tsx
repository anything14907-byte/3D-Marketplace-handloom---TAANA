import React, { useState } from 'react';
import { ZoomIn, Layers, ShieldCheck, Info } from 'lucide-react';

interface SwatchPatternViewProps {
  material: string;
  productName: string;
  patternKey: string;
  posterImage?: string;
}

export const SwatchPatternView: React.FC<SwatchPatternViewProps> = ({
  material,
  productName,
  patternKey,
  posterImage,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<'warp' | 'weft' | 'composite'>('composite');

  return (
    <div className="w-full rounded-2xl bg-[#FDFBF7] border-2 border-[#D89B2C]/30 shadow-md p-5 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D89B2C]/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#7A2734] text-white flex items-center justify-center text-xs font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#1B2A4A]">
              Artisan Weave Swatch & Texture Lens
            </h4>
            <p className="text-[11px] text-[#1B2A4A]/70">
              Interactive thread matrix ({material})
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-[#1B2A4A]/5 p-1 rounded-lg">
          <button
            onClick={() => setZoomLevel(1)}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              zoomLevel === 1 ? 'bg-[#1B2A4A] text-white' : 'text-[#1B2A4A]/70'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setZoomLevel(2)}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              zoomLevel === 2 ? 'bg-[#1B2A4A] text-white' : 'text-[#1B2A4A]/70'
            }`}
          >
            2x Lens
          </button>
          <button
            onClick={() => setZoomLevel(4)}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              zoomLevel === 4 ? 'bg-[#1B2A4A] text-white' : 'text-[#1B2A4A]/70'
            }`}
          >
            4x Micro-Weave
          </button>
        </div>
      </div>

      {/* Swatch Canvas Box */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#D89B2C]/30 bg-[#1B2A4A] flex items-center justify-center group">
        {posterImage ? (
          <img
            src={posterImage}
            alt={`${productName} weave texture`}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-300"
            style={{
              transform: `scale(${zoomLevel})`,
              backgroundColor: '#1B2A4A',
              backgroundImage:
                activeLayer === 'warp'
                  ? 'repeating-linear-gradient(90deg, #D89B2C 0, #D89B2C 2px, transparent 2px, transparent 8px)'
                  : activeLayer === 'weft'
                  ? 'repeating-linear-gradient(0deg, #7A2734 0, #7A2734 2px, transparent 2px, transparent 8px)'
                  : 'radial-gradient(#D89B2C 1.5px, transparent 1.5px), radial-gradient(#F6F1E7 1px, #1B2A4A 1px)',
              backgroundSize: activeLayer === 'composite' ? '16px 16px' : 'auto',
            }}
          />
        )}

        {/* Floating Weave Metrics */}
        <div className="absolute bottom-3 left-3 bg-[#1B2A4A]/90 backdrop-blur-md text-[#F6F1E7] text-[11px] px-3 py-1.5 rounded-lg border border-[#D89B2C]/30 flex items-center gap-3">
          <span><strong className="text-[#D89B2C]">Taana (Warp):</strong> Handspun</span>
          <span className="text-white/30">•</span>
          <span><strong className="text-[#D89B2C]">Baana (Weft):</strong> Interlocked</span>
          <span className="text-white/30">•</span>
          <span><strong className="text-[#D89B2C]">Loom:</strong> Pit / Throw-Shuttle</span>
        </div>
      </div>

      {/* Layer Toggles & Verification Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#1B2A4A]/80">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#1B2A4A]">Inspect Threads:</span>
          <button
            onClick={() => setActiveLayer('composite')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              activeLayer === 'composite'
                ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#B87B16]'
                : 'bg-white text-[#1B2A4A]/70 border-gray-200'
            }`}
          >
            Full Loom Weave
          </button>
          <button
            onClick={() => setActiveLayer('warp')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              activeLayer === 'warp'
                ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#B87B16]'
                : 'bg-white text-[#1B2A4A]/70 border-gray-200'
            }`}
          >
            Taana (Warp)
          </button>
          <button
            onClick={() => setActiveLayer('weft')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              activeLayer === 'weft'
                ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#B87B16]'
                : 'bg-white text-[#1B2A4A]/70 border-gray-200'
            }`}
          >
            Baana (Weft)
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#7A2734] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GI Authenticity Verified</span>
        </div>
      </div>
    </div>
  );
};
