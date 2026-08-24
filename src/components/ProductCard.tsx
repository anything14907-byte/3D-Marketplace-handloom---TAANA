import React from 'react';
import { MapPin, Eye, ShoppingBag, Box, Camera } from 'lucide-react';
import { Product } from '../types';
import { resolveHandloomImage } from '../utils/handloomImages';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenTryOn?: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onOpenTryOn,
}) => {
  const weaverName = product.weavers?.name || 'Master Weaver';
  const region = product.weavers?.region || 'Traditional Weaving Cluster';
  const displayImage = resolveHandloomImage(product.name, product.image_url);

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#D89B2C]/25 hover:border-[#D89B2C] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[#1B2A4A]/5">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="eager"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = resolveHandloomImage(product.name);
          }}
        />

        {/* 3D AR Badge if available */}
        {product.glb_url || product.sketchfab_id ? (
          <div className="absolute top-3 right-3 bg-[#1B2A4A]/90 backdrop-blur-md text-[#D89B2C] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#D89B2C]/40 flex items-center gap-1 shadow">
            <Box className="w-3 h-3 text-[#D89B2C]" />
            <span>3D Drape</span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-[#F6F1E7]/90 backdrop-blur-md text-[#1B2A4A] text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#1B2A4A]/15 flex items-center gap-1">
            <span>Handloom</span>
          </div>
        )}

        {/* Maroon Handloom Tag */}
        <div className="absolute bottom-3 left-3 bg-[#7A2734] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md shadow-sm">
          {product.material.split('&')[0].trim()}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Weaver & Region info */}
          <div className="flex items-center gap-1.5 text-xs text-[#1B2A4A]/75 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D89B2C] shrink-0" />
            <span className="font-medium text-[#1B2A4A] truncate">{weaverName}</span>
            <span className="text-[#1B2A4A]/40">•</span>
            <span className="truncate text-[#1B2A4A]/65">{region}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg font-bold text-[#1B2A4A] line-clamp-1 group-hover:text-[#7A2734] transition-colors">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#1B2A4A]/70 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#D89B2C]/15 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#1B2A4A]/60 font-semibold">
              Artisan Price
            </div>
            <div className="text-lg font-serif font-bold text-[#1B2A4A]">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onAddToCart(product, e)}
              className="p-2.5 rounded-lg bg-[#D89B2C] text-[#1B2A4A] hover:bg-[#F5CE7B] transition-colors shadow-sm active:scale-95 flex items-center justify-center"
              title="Add to Cart"
              aria-label={`Add ${product.name} to cart`}
              id={`add-to-cart-btn-${product.id}`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelect(product)}
              className="p-2.5 rounded-lg bg-[#1B2A4A] text-[#F6F1E7] hover:bg-[#253966] transition-colors text-xs font-medium flex items-center gap-1"
              id={`view-detail-btn-${product.id}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
