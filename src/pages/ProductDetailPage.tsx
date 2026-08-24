import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, MapPin, Feather, Box, Check, MessageCircle, Heart, Share2, Camera, Sparkles } from 'lucide-react';
import { ThreadClusterIcon } from '../components/ThreadClusterIcon';
import { Product } from '../types';
import { ModelViewer3D } from '../components/ModelViewer3D';
import { resolveHandloomImage } from '../utils/handloomImages';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenChatWithProduct: (product: Product) => void;
  onOpenTryOn?: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onOpenChatWithProduct,
  onOpenTryOn,
}) => {
  const [detailTab, setDetailTab] = useState<'photo' | '3d' | 'swatch'>('photo');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const weaver = product.weavers;
  const weaverName = weaver?.name || 'Master Weaver Collective';
  const region = weaver?.region || 'Traditional Weaving Cluster, India';
  const bio = weaver?.bio || 'Generational handloom master artisan practicing authentic pit-loom weaving.';

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} | Taana Indian Handloom`,
        text: `Check out this authentic handloom piece by ${weaverName} on Taana: ${product.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B2A4A] hover:text-[#7A2734] transition-colors bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 px-3.5 py-2 rounded-lg"
          id="back-to-weaves-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Weaves</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-[#D89B2C]/30 text-[#1B2A4A] hover:bg-white text-xs flex items-center gap-1.5 transition-colors"
            title="Share Textile"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = 3D Viewer / Swatch Box / Image, Right = Details & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Interactive 3D Model Viewer & Photos (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Primary View: 3D AR Model or Swatch View or High Res Photograph */}
          <ModelViewer3D
            glbUrl={product.glb_url}
            sketchfabId={product.sketchfab_id}
            modelType={product.model_type}
            product={product}
            productName={product.name}
            material={product.material}
            swatchPattern={product.swatch_pattern}
            posterImage={product.image_url}
            activeTab={detailTab}
            onTabChange={setDetailTab}
            onAddToCart={onAddToCart}
            onOpenTryOn={onOpenTryOn ? () => onOpenTryOn(product) : undefined}
          />

          {/* Secondary Interactive Gallery Switcher */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDetailTab('photo')}
              className={`rounded-xl p-1.5 border-2 text-left transition-all flex items-center gap-2.5 ${
                detailTab === 'photo'
                  ? 'border-[#D89B2C] bg-white shadow-md'
                  : 'border-transparent bg-[#FDFBF7] hover:border-[#D89B2C]/50'
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#1B2A4A]/5">
                <img
                  src={resolveHandloomImage(product.name, product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = resolveHandloomImage(product.name);
                  }}
                />
              </div>
              <div className="min-w-0 pr-1">
                <span className="block text-[11px] font-bold text-[#1B2A4A] truncate">Artisan Photo</span>
                <span className="block text-[9px] text-[#1B2A4A]/60">Studio View</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setDetailTab('3d')}
              className={`rounded-xl p-2.5 border-2 text-center transition-all flex flex-col justify-center items-center ${
                detailTab === '3d'
                  ? 'border-[#D89B2C] bg-[#1B2A4A] text-[#F6F1E7] shadow-md'
                  : 'border-transparent bg-[#FDFBF7] text-[#1B2A4A] hover:border-[#D89B2C]/50'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold ${detailTab === '3d' ? 'text-[#D89B2C]' : 'text-[#7A2734]'}`}>
                3D Drape
              </span>
              <span className="font-serif font-bold text-xs mt-0.5">
                360° Cloth View
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDetailTab('swatch')}
              className={`rounded-xl p-2.5 border-2 text-center transition-all flex flex-col justify-center items-center ${
                detailTab === 'swatch'
                  ? 'border-[#D89B2C] bg-[#1B2A4A] text-[#F6F1E7] shadow-md'
                  : 'border-transparent bg-[#FDFBF7] text-[#1B2A4A] hover:border-[#D89B2C]/50'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold ${detailTab === 'swatch' ? 'text-[#D89B2C]' : 'text-[#D89B2C]'}`}>
                Thread Swatch
              </span>
              <span className="font-serif text-xs mt-0.5">
                Macro Weave
              </span>
            </button>
          </div>

        </div>

        {/* Right Column: Textile Story & Artisan Direct Purchase (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tag & Region */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#7A2734] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Authentic Handloom
              </span>
              <span className="bg-[#D89B2C]/20 text-[#1B2A4A] border border-[#D89B2C]/40 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D89B2C]" />
                100% Pit-Loom Weave
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#1B2A4A]/80 pt-1">
              <MapPin className="w-4 h-4 text-[#D89B2C] shrink-0" />
              <span>Weaving Cluster: <strong>{region}</strong></span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-indigo-loom text-[#F6F1E7] border border-[#D89B2C]/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#D89B2C] font-semibold">
                Direct Artisan Price
              </span>
              <div className="font-serif text-3xl font-bold text-[#F6F1E7]">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-emerald-400 font-semibold block">
                ✓ 90% Direct to Weaver
              </span>
              <span className="text-[10px] text-[#F6F1E7]/70">Includes all craft taxes</span>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
              The Craft & The Weave
            </h3>
            <p className="text-sm text-[#1B2A4A]/85 leading-relaxed font-sans bg-[#FDFBF7] p-4 rounded-xl border border-[#D89B2C]/20">
              {product.description}
            </p>
          </div>

          {/* Material & Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Material</span>
              <span className="font-semibold text-[#1B2A4A]">{product.material}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Loom Origin</span>
              <span className="font-semibold text-[#1B2A4A]">{region}</span>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-3 pt-2">
            {onOpenTryOn && (
              <button
                onClick={() => onOpenTryOn(product)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#142038] to-[#1B2A4A] hover:from-[#1B2A4A] hover:to-[#253966] text-[#F6F1E7] border-2 border-[#D89B2C] text-xs font-bold flex items-center justify-center gap-2.5 shadow-md transition-all group"
                id="product-detail-tryon-studio-btn"
              >
                <Camera className="w-4 h-4 text-[#D89B2C] group-hover:scale-110 transition-transform" />
                <span className="font-serif tracking-wide text-sm text-[#F6F1E7]">
                  Try On with Your Photo (3D-AR Studio)
                </span>
                <span className="bg-[#D89B2C] text-[#1B2A4A] text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                  Upload Photo
                </span>
              </button>
            )}

            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-[#D89B2C]/50 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-lg font-bold text-[#1B2A4A] hover:bg-gray-100 rounded-lg"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#1B2A4A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-lg font-bold text-[#1B2A4A] hover:bg-gray-100 rounded-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#D89B2C] hover:bg-[#F5CE7B] text-[#1B2A4A] font-serif font-bold text-base shadow-lg hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 border border-[#B87B16]"
                id="product-detail-add-cart-btn"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart (₹{(product.price * quantity).toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>

            {/* Ask AI Button */}
            <button
              onClick={() => onOpenChatWithProduct(product)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B2A4A] hover:bg-[#253966] text-[#F6F1E7] text-xs font-semibold flex items-center justify-center gap-2 border border-[#D89B2C]/40 transition-colors shadow-sm"
              id="ask-ai-about-product-btn"
            >
              <ThreadClusterIcon className="w-4 h-4 text-[#D89B2C]" />
              <span>Ask Taana Sutra AI about this Weave & Drape</span>
            </button>
          </div>

          {/* Meet the Master Weaver Card */}
          <div className="p-5 rounded-2xl bg-[#FDFBF7] border-2 border-[#D89B2C]/40 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#7A2734] text-white flex items-center justify-center font-serif text-lg font-bold">
                <Feather className="w-5 h-5 text-[#D89B2C]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A2734]">
                  Master Weaver Profile
                </span>
                <h4 className="font-serif font-bold text-base text-[#1B2A4A]">
                  {weaverName}
                </h4>
              </div>
            </div>

            <p className="text-xs text-[#1B2A4A]/80 leading-relaxed italic">
              "{bio}"
            </p>

            <div className="pt-2 border-t border-[#D89B2C]/20 flex items-center justify-between text-[11px] text-[#1B2A4A]/70">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D89B2C]" /> {region}
              </span>
              <span className="text-[#7A2734] font-medium">Registered Artisan Partner</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
