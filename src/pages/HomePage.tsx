import React, { useState, useMemo } from 'react';
import { Search, MapPin, Box, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { ThreadClusterIcon } from '../components/ThreadClusterIcon';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { resolveHandloomImage } from '../utils/handloomImages';

interface HomePageProps {
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onRefresh: () => void;
  isSupabaseLive: boolean;
}

const MATERIAL_FILTERS = [
  'All Materials',
  'Pure Mulberry Silk',
  'Double Ikat Silk',
  'Chanderi Silk & Zari',
  'Pashmina Cashmere',
  'Phulia Organic Cotton',
  'Kanchipuram Silk',
];

const REGION_FILTERS = [
  'All Regions',
  'Varanasi',
  'Telangana',
  'Madhya Pradesh',
  'Kashmir',
  'West Bengal',
  'Tamil Nadu',
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  isLoading,
  onSelectProduct,
  onAddToCart,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [only3D, setOnly3D] = useState(false);

  // Filter products based on search, material, region, and 3D filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search text query matching
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.weavers?.name &&
          product.weavers.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.weavers?.region &&
          product.weavers.region.toLowerCase().includes(searchQuery.toLowerCase()));

      // Material filter
      const matchesMaterial =
        selectedMaterial === 'All Materials' ||
        product.material.toLowerCase().includes(selectedMaterial.toLowerCase().replace('all ', ''));

      // Region filter
      const matchesRegion =
        selectedRegion === 'All Regions' ||
        (product.weavers?.region &&
          product.weavers.region.toLowerCase().includes(selectedRegion.toLowerCase()));

      // 3D availability
      const matches3D = !only3D || !!product.glb_url || !!product.sketchfab_id;

      return matchesSearch && matchesMaterial && matchesRegion && matches3D;
    });
  }, [products, searchQuery, selectedMaterial, selectedRegion, only3D]);

  return (
    <div className="space-y-8 pb-16">
      {/* Artisanal Heritage Hero Banner */}
      <section className="bg-gradient-to-b from-[#1B2A4A] to-[#142038] text-[#F6F1E7] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D89B2C]/30 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D89B2C]/20 border border-[#D89B2C]/50 text-xs font-semibold text-[#D89B2C]">
            <ThreadClusterIcon className="w-4 h-4" />
            <span>Fair-Trade Indian Handloom Cluster Platform</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F6F1E7]">
            Empowering Master Weavers Across India
          </h1>

          <p className="text-sm sm:text-base text-[#F6F1E7]/85 max-w-2xl mx-auto leading-relaxed font-sans">
            Directly connect with certified handloom clusters from Varanasi, Telangana, Kashmir, Chanderi, Phulia, and Kanchipuram. 100% genuine pit-loom textiles with digital provenance.
          </p>

          {/* Search Input Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-[#F6F1E7] rounded-xl shadow-xl p-1.5 border border-[#D89B2C]/40">
              <div className="pl-3 pr-2 text-[#1B2A4A]/60">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by weave, material, or weaver (e.g. Banarasi, Ikat, Chanderi)..."
                className="w-full bg-transparent px-2 py-2 text-sm text-[#1B2A4A] placeholder-[#1B2A4A]/50 focus:outline-none"
                id="home-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#7A2734] px-2 font-medium hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Key Value Props */}
          <div className="pt-4 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center border-t border-white/10">
            <div>
              <div className="font-serif font-bold text-lg sm:text-xl text-[#D89B2C]">6+</div>
              <div className="text-[11px] text-[#F6F1E7]/70 uppercase tracking-wider">Master Clusters</div>
            </div>
            <div>
              <div className="font-serif font-bold text-lg sm:text-xl text-[#D89B2C]">100%</div>
              <div className="text-[11px] text-[#F6F1E7]/70 uppercase tracking-wider">Direct to Weaver</div>
            </div>
            <div>
              <div className="font-serif font-bold text-lg sm:text-xl text-[#D89B2C]">GI Tagged</div>
              <div className="text-[11px] text-[#F6F1E7]/70 uppercase tracking-wider">Pit-Loom Certified</div>
            </div>
          </div>

          {/* Quick-Access Handloom Swatches Bar */}
          <div className="pt-4 flex items-center justify-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {products.slice(0, 6).map((p) => {
              const img = resolveHandloomImage(p.name, p.image_url);
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="group flex flex-col items-center gap-1.5 shrink-0 bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-[#D89B2C]/30 hover:border-[#D89B2C] transition-all"
                  title={`View ${p.name}`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#D89B2C]/40 group-hover:scale-105 transition-transform bg-black/20">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = resolveHandloomImage(p.name);
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#F6F1E7] font-medium max-w-[70px] truncate group-hover:text-[#D89B2C]">
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Filter & Controls Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#D89B2C]/30 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Material Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]/70 shrink-0">
                Material:
              </span>
              {MATERIAL_FILTERS.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                    selectedMaterial === mat
                      ? 'bg-[#1B2A4A] text-[#D89B2C] shadow-sm font-semibold'
                      : 'bg-white text-[#1B2A4A]/75 border border-gray-200 hover:border-[#D89B2C]'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>

            {/* 3D / AR Toggle & Refresh */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setOnly3D(!only3D)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  only3D
                    ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#B87B16] font-bold shadow-md'
                    : 'bg-white text-[#1B2A4A]/80 border-gray-200 hover:border-[#D89B2C]'
                }`}
                id="filter-3d-toggle"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Drape Ready</span>
              </button>

              <button
                onClick={onRefresh}
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-[#1B2A4A]/70 border border-gray-200 transition-colors"
                title="Refresh Collection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Region Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#D89B2C]/15 no-scrollbar">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]/70 shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#D89B2C]" /> Cluster:
            </span>
            {REGION_FILTERS.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 transition-all ${
                  selectedRegion === reg
                    ? 'bg-[#7A2734] text-white font-semibold'
                    : 'bg-transparent text-[#1B2A4A]/70 hover:bg-[#7A2734]/10'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Product Catalog Grid */}
      <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
              Authentic Handloom Collection
            </h2>
            <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1 font-sans">
              Showing {filteredProducts.length} certified artisan weaves
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#D89B2C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-base text-[#1B2A4A]">
              Connecting to artisan pit-looms...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#FDFBF7] rounded-2xl p-12 text-center border border-dashed border-[#D89B2C] max-w-lg mx-auto space-y-3">
            <ThreadClusterIcon className="w-10 h-10 text-[#D89B2C] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1B2A4A]">
              No Handlooms Matched Your Filter
            </h3>
            <p className="text-xs text-[#1B2A4A]/70">
              Try clearing your search query or selecting a different material or region.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMaterial('All Materials');
                setSelectedRegion('All Regions');
                setOnly3D(false);
              }}
              className="px-4 py-2 bg-[#D89B2C] text-[#1B2A4A] font-semibold text-xs rounded-lg hover:bg-[#F5CE7B]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={(p, e) => onAddToCart(p, e)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
