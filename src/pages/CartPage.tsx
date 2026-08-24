import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Feather,
  Heart,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';
import { ThreadClusterIcon } from '../components/ThreadClusterIcon';
import { CartItem } from '../types';
import { resolveHandloomImage } from '../utils/handloomImages';

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigateHome: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateHome,
}) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const artisanDirectShare = Math.round(subtotal * 0.9); // 90% direct to weaver
  const qualityVerification = Math.round(subtotal * 0.05);
  const welfareLoomFund = Math.round(subtotal * 0.05);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-[#1B2A4A]/5 border-2 border-[#D89B2C]/30 rounded-full flex items-center justify-center mx-auto text-[#D89B2C]">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#1B2A4A]">
            Your Handloom Bag is Empty
          </h2>
          <p className="text-sm text-[#1B2A4A]/70 max-w-md mx-auto">
            Discover exquisite pit-loom handlooms directly from Indian master weavers in Varanasi, Pochampally, and Chanderi.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 bg-[#1B2A4A] text-[#F6F1E7] hover:bg-[#253966] text-sm font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          id="cart-empty-explore-btn"
        >
          <Feather className="w-4 h-4 text-[#D89B2C]" />
          <span>Explore Handloom Weaves</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D89B2C]/20 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1B2A4A]">
            Your Handloom Collection
          </h1>
          <p className="text-xs text-[#1B2A4A]/70 font-sans mt-0.5">
            {cart.length} authentic handcrafted textile item{cart.length > 1 ? 's' : ''} in bag
          </p>
        </div>

        <button
          onClick={onClearCart}
          className="text-xs text-[#7A2734] hover:underline flex items-center gap-1 font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Bag</span>
        </button>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-[#FDFBF7] rounded-2xl border border-[#D89B2C]/30 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between"
              id={`cart-item-${item.product.id}`}
            >
              {/* Image & Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#1B2A4A]/10 shrink-0 border border-[#D89B2C]/30">
                  <img
                    src={resolveHandloomImage(item.product.name, item.product.image_url)}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = resolveHandloomImage(item.product.name);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#1B2A4A]/70">
                    <MapPin className="w-3 h-3 text-[#D89B2C]" />
                    <span>{item.product.weavers?.name || 'Master Artisan'}</span>
                    <span>•</span>
                    <span>{item.product.weavers?.region || 'India'}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#1B2A4A] line-clamp-1">
                    {item.product.name}
                  </h3>

                  <div className="text-xs text-[#7A2734] font-medium">
                    {item.product.material}
                  </div>

                  <div className="text-sm font-serif font-bold text-[#1B2A4A] pt-1">
                    ₹{item.product.price.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-gray-500 font-sans font-normal">/ unit</span>
                  </div>
                </div>
              </div>

              {/* Quantity & Remove */}
              <div className="flex sm:flex-col items-center justify-between sm:items-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#D89B2C]/20">
                <div className="flex items-center border border-[#D89B2C]/40 rounded-lg bg-white p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-[#1B2A4A] hover:bg-gray-100 rounded"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#1B2A4A]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-[#1B2A4A] hover:bg-gray-100 rounded"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="text-right flex items-center sm:flex-col gap-3">
                  <div className="font-serif font-bold text-base text-[#1B2A4A]">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-xs text-[#7A2734] hover:text-red-700 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={onNavigateHome}
            className="text-xs font-semibold text-[#1B2A4A] hover:text-[#7A2734] transition-colors inline-flex items-center gap-1.5 pt-2"
          >
            ← Add more handcrafted textiles from Indian weavers
          </button>
        </div>

        {/* Order Summary & Transparent Weaver Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FDFBF7] rounded-2xl border-2 border-[#D89B2C]/40 p-6 shadow-md space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#1B2A4A] border-b border-[#D89B2C]/20 pb-3">
            Fair-Trade Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#1B2A4A]/80">
              <span>Handloom Subtotal</span>
              <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Direct Artisan Breakdown */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex justify-between text-emerald-900 font-bold">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  Direct Artisan Payout (90%):
                </span>
                <span className="font-mono">₹{artisanDirectShare.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-emerald-800/80">
                100% of this amount goes straight to the master weaver's family bank account.
              </p>
            </div>

            <div className="flex justify-between text-[#1B2A4A]/70 text-[11px]">
              <span>Quality Inspection & Loom Check (5%)</span>
              <span className="font-mono">₹{qualityVerification.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-[#1B2A4A]/70 text-[11px]">
              <span>Artisan Loom Welfare Fund (5%)</span>
              <span className="font-mono">₹{welfareLoomFund.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-emerald-700 text-xs font-semibold">
              <span>Domestic Handloom Shipping</span>
              <span>FREE (Insured Silk Dispatch)</span>
            </div>
          </div>

          {/* Running Total */}
          <div className="pt-4 border-t-2 border-[#1B2A4A] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-[#1B2A4A]/70">Running Total</span>
              <div className="font-serif text-2xl font-bold text-[#1B2A4A]">
                ₹{subtotal.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[10px] text-gray-500">Transparent Fair-Trade Pricing</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="w-full py-4 px-6 rounded-xl bg-[#D89B2C] hover:bg-[#F5CE7B] text-[#1B2A4A] font-serif font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 border border-[#B87B16] active:scale-98"
            id="checkout-coming-soon-btn"
          >
            <span>Proceed to Artisan Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#1B2A4A]/60">
            <ShieldCheck className="w-4 h-4 text-[#D89B2C]" />
            <span>Fair-Trade & Quality Guaranteed</span>
          </div>
        </div>

      </div>

      {/* Checkout Coming Soon Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FDFBF7] rounded-2xl max-w-md w-full border-2 border-[#D89B2C] shadow-2xl p-6 space-y-5 text-center relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#1B2A4A] text-[#D89B2C] rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-[#D89B2C]">
              <ThreadClusterIcon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#7A2734] bg-[#7A2734]/10 px-3 py-1 rounded-full">
                Hackathon Prototype Notice
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1B2A4A]">
                Direct Artisan Payment in Development
              </h3>
              <p className="text-xs text-[#1B2A4A]/80 leading-relaxed font-sans">
                Thank you for honoring Indian textile craftsmanship. 
                Our student project model is built to enable direct instant UPI settlement rails with handloom co-operatives in Varanasi, Pochampally, and Chanderi.
              </p>
            </div>

            <div className="p-4 bg-[#1B2A4A]/5 rounded-xl border border-[#D89B2C]/30 text-xs text-left space-y-1.5 text-[#1B2A4A]">
              <div className="font-bold flex items-center gap-1.5 text-[#1B2A4A]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What happens during launch:</span>
              </div>
              <p className="text-[11px] text-[#1B2A4A]/75 pl-5">
                • 100% insured delivery directly from the village loom pit
              </p>
              <p className="text-[11px] text-[#1B2A4A]/75 pl-5">
                • Video signature certificate from the master weaver who crafted your cloth
              </p>
            </div>

            <button
              onClick={() => setShowCheckoutModal(false)}
              className="w-full py-3 bg-[#1B2A4A] text-[#F6F1E7] text-xs font-bold rounded-xl hover:bg-[#253966] transition-colors"
            >
              Got it, continue exploring!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
