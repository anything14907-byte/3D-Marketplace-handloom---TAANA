import React from 'react';
import { ShoppingBag, Feather, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import { ThreadClusterIcon } from './ThreadClusterIcon';
import { CartItem } from '../types';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  cart: CartItem[];
  isSupabaseLive?: boolean;
  onOpenTryOn?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  cart,
  onOpenTryOn,
}) => {
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#1B2A4A] text-[#F6F1E7] border-b border-[#D89B2C]/30 shadow-md">
      {/* Top artisanal ticker */}
      <div className="bg-[#142038] py-1.5 px-4 text-xs text-center border-b border-[#D89B2C]/15 flex items-center justify-center gap-4 text-[#F6F1E7]/80">
        <span className="flex items-center gap-1.5 text-[#D89B2C] font-medium">
          <ThreadClusterIcon className="w-3.5 h-3.5" /> Direct Pit-Loom to Wardrobe
        </span>
        <span className="hidden sm:inline text-white/30">•</span>
        <span className="hidden sm:inline">Fair-Trade Indian Handloom Weavers Platform</span>
        <span className="hidden md:inline text-white/30">•</span>
        <span className="hidden md:inline text-[#F6F1E7]/80 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#D89B2C]" />
          Direct Artisan Payouts
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="brand-logo"
        >
          <div className="w-11 h-11 rounded-md bg-gradient-to-br from-[#D89B2C] to-[#B87B16] flex items-center justify-center text-[#1B2A4A] font-bold shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Feather className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold tracking-wider text-[#F6F1E7]">
                TAANA
              </span>
              <span className="text-xs font-serif italic text-[#D89B2C] tracking-wide">ताना</span>
            </div>
            <p className="text-[11px] text-[#F6F1E7]/70 font-sans tracking-tight">
              Indian Handloom Marketplace
            </p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentRoute === '/' 
                ? 'bg-[#D89B2C]/20 text-[#D89B2C] border border-[#D89B2C]/40' 
                : 'text-[#F6F1E7]/85 hover:text-[#F6F1E7] hover:bg-white/5'
            }`}
            id="nav-explore"
          >
            Explore Weaves
          </button>

          <button
            onClick={() => navigate('/try-on')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentRoute === '/try-on'
                ? 'bg-[#D89B2C]/20 text-[#D89B2C] border border-[#D89B2C]/40'
                : 'text-[#F6F1E7]/85 hover:text-[#F6F1E7] hover:bg-white/5'
            }`}
            id="nav-tryon-studio-btn"
          >
            <Camera className="w-4 h-4 text-[#D89B2C]" />
            <span>3D Virtual Try-On</span>
          </button>

          <button
            onClick={() => navigate('/sell')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentRoute === '/sell'
                ? 'bg-[#D89B2C]/20 text-[#D89B2C] border border-[#D89B2C]/40'
                : 'text-[#F6F1E7]/85 hover:text-[#F6F1E7] hover:bg-white/5'
            }`}
            id="nav-sell"
          >
            <ThreadClusterIcon className="w-4 h-4 text-[#D89B2C]" />
            Artisan Sell Portal
          </button>
        </nav>

        {/* Right side CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/try-on')}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D89B2C]/20 text-[#D89B2C] border border-[#D89B2C]/40"
            title="3D Virtual Try-On"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Try-On</span>
          </button>

          <button
            onClick={() => navigate('/sell')}
            className="hidden sm:flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white/10 text-[#F6F1E7] hover:bg-white/20 border border-white/20"
          >
            <ThreadClusterIcon className="w-3.5 h-3.5 text-[#D89B2C]" /> List
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={() => navigate('/cart')}
            className={`relative p-2.5 rounded-full border transition-all ${
              currentRoute === '/cart'
                ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#D89B2C]'
                : 'bg-white/5 border-[#D89B2C]/30 text-[#F6F1E7] hover:bg-white/10 hover:border-[#D89B2C]'
            }`}
            aria-label="View Cart"
            id="nav-cart-btn"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#7A2734] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1B2A4A] animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
