import React from 'react';
import { Feather, ShieldCheck, Heart } from 'lucide-react';
import { ThreadClusterIcon } from './ThreadClusterIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1B2A4A] text-[#F6F1E7] border-t border-[#D89B2C]/30 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#F6F1E7]/10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#D89B2C] flex items-center justify-center text-[#1B2A4A]">
                <Feather className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-wider text-[#F6F1E7]">
                TAANA <span className="font-serif italic text-sm text-[#D89B2C]">ताना</span>
              </span>
            </div>
            <p className="text-[#F6F1E7]/75 text-sm leading-relaxed max-w-md font-sans">
              Taana (warp) and Baana (weft) form the sacred geometry of Indian handlooms. 
              We empower generational artisan families across Varanasi, Pochampally, Chanderi, 
              Kashmir, and Bengal by delivering uncompromised hand-woven textiles straight to you.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D89B2C] pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Artisan Co-operative Network & Verified Handlooms</span>
            </div>
          </div>

          {/* Handloom Clusters */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#D89B2C] tracking-wide mb-3">
              Weaving Clusters
            </h4>
            <ul className="space-y-2 text-sm text-[#F6F1E7]/70">
              <li>Varanasi (Banarasi Katan Silk)</li>
              <li>Pochampally (Double Ikat)</li>
              <li>Chanderi (Gossamer Silk Cotton)</li>
              <li>Kashmir (Sozni Pashmina)</li>
              <li>Phulia / Shantipur (Jamdani)</li>
              <li>Kanchipuram (Korvai Silk)</li>
            </ul>
          </div>

          {/* Craft Promise */}
          <div>
            <h4 className="font-serif text-base font-semibold text-[#D89B2C] tracking-wide mb-3">
              Direct Weaver Promise
            </h4>
            <p className="text-xs text-[#F6F1E7]/75 leading-relaxed">
              90% of every sale goes directly to the weaver's bank account. 
              No middlemen, no powerloom counterfeits.
            </p>
            <div className="mt-4 p-3 bg-white/5 rounded border border-[#D89B2C]/20 text-[11px] text-[#F6F1E7]/80 flex items-start gap-2">
              <ThreadClusterIcon className="w-4 h-4 text-[#D89B2C] shrink-0 mt-0.5" />
              <span>Experience handloom textures in true 3D Augmented Reality before checkout.</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F6F1E7]/60 gap-3">
          <p>© {new Date().getFullYear()} Taana Indian Handloom Marketplace. Crafted with reverence for Indian artisans.</p>
          <div className="flex items-center gap-1 text-[#F6F1E7]/70">
            <span>Preserving Indian textile heritage</span>
            <Heart className="w-3.5 h-3.5 text-[#7A2734] fill-[#7A2734]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
