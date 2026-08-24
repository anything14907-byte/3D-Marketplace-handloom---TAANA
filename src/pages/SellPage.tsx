import React, { useState } from 'react';
import {
  Mic,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Feather,
  Box,
  MapPin,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { ThreadClusterIcon } from '../components/ThreadClusterIcon';
import { Product } from '../types';
import { uploadProductImage, createProductWithWeaver, CreateProductInput } from '../lib/supabaseClient';
import { VoiceDictationModal } from '../components/VoiceDictationModal';

interface SellPageProps {
  onProductCreated: (newProduct: Product) => void;
  onNavigateHome: () => void;
}

const PRESET_3D_MODELS = [
  { 
    label: 'None (Use 2D Swatch)', 
    sketchfab_id: '', 
    glb_url: '',
    model_type: 'saree' 
  },
  { 
    label: 'Traditional Stole & Dupatta Drape (Pochampally / Pashmina)', 
    sketchfab_id: '4923c6d767f84055868c456a8f4c267b', 
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    model_type: 'stole' 
  },
  { 
    label: 'Indian Silk Saree Drape (Banarasi / Katan)', 
    sketchfab_id: '8feb98c26c16459a867d7a01ec9a0601', 
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    model_type: 'saree' 
  },
  { 
    label: 'Rajasthani Leheriya Bandhani Saree Drape', 
    sketchfab_id: '16dabb458c474062a5237bf745a678cf', 
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    model_type: 'saree' 
  },
  { 
    label: 'Handloom Chanderi & Jamdani Saree Drape', 
    sketchfab_id: 'a7b833445be3427088eead52d4178672', 
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    model_type: 'saree' 
  },
];

export const SellPage: React.FC<SellPageProps> = ({ onProductCreated, onNavigateHome }) => {
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    weaver_name: '',
    region: '',
    material: '',
    price: 6500,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    sketchfab_id: '8feb98c26c16459a867d7a01ec9a0601',
    model_type: 'saree',
    swatch_pattern: 'antique-zari-kadwa',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'
  );
  const [isGeneratingDesc, setIsGeneratingDesc] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successProduct, setSuccessProduct] = useState<Product | null>(null);

  // Handle Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  // Feature 1: Generate description with Claude Haiku AI
  const handleGenerateDescription = async () => {
    if (!formData.name && !formData.material && !formData.region) {
      setErrorMsg('Please enter at least the Product Name, Material, or Region first.');
      return;
    }

    setErrorMsg(null);
    setIsGeneratingDesc(true);

    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          material: formData.material,
          region: formData.region,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI description');
      }

      const json = await res.json();
      if (json.description) {
        setFormData((prev) => ({
          ...prev,
          description: json.description,
        }));
      }
    } catch (err: any) {
      console.warn('AI Description generation error:', err);
      // Fallback
      setFormData((prev) => ({
        ...prev,
        description: `Woven on traditional pit-looms in ${formData.region || 'India'}, this exquisite ${formData.name || 'handloom textile'} is handcrafted from ${formData.material || 'pure natural yarn'}. It boasts an opulent, authentic drape with generational craftsmanship embedded in every warp and weft.`,
      }));
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Apply parsed Voice Dictation data
  const handleApplyVoiceData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      name: data.name || prev.name,
      weaver_name: data.weaver_name || prev.weaver_name,
      region: data.region || prev.region,
      material: data.material || prev.material,
      price: data.price ? Number(data.price) : prev.price,
      description: data.description || prev.description,
    }));
  };

  // Submit to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.weaver_name.trim() || !formData.region.trim()) {
      setErrorMsg('Please fill in Product Name, Weaver Name, and Region.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalImageUrl = formData.image_url;

      // 1. Upload photo to Supabase storage bucket 'product-images' if file selected
      if (selectedFile) {
        finalImageUrl = await uploadProductImage(selectedFile);
      }

      // 2. Save into Supabase 'weavers' and 'products'
      const newProduct = await createProductWithWeaver({
        ...formData,
        image_url: finalImageUrl,
      });

      setSuccessProduct(newProduct);
      onProductCreated(newProduct);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg('Could not save product listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="bg-[#1B2A4A] text-[#F6F1E7] p-8 rounded-2xl border-2 border-[#D89B2C] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D89B2C]/20 border border-[#D89B2C]/50 text-xs text-[#D89B2C]">
              <ThreadClusterIcon className="w-3.5 h-3.5" />
              <span>Artisan Listing Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F6F1E7]">
              List Your Handloom Masterpiece
            </h1>
            <p className="text-xs sm:text-sm text-[#F6F1E7]/80 leading-relaxed">
              Empower your craft. List directly into the Taana marketplace. 
              Weavers can type or use <strong>Voice Dictation in vernacular Indian languages</strong>.
            </p>
          </div>

          {/* Quick Voice Dictation CTA */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-[#D89B2C] to-[#B87B16] text-[#1B2A4A] hover:brightness-110 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-transform active:scale-95 shrink-0"
            id="open-voice-modal-btn"
          >
            <Mic className="w-5 h-5 text-[#1B2A4A]" />
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">Artisan Voice Dictation</div>
              <div className="text-[10px] text-[#1B2A4A]/80 font-normal">बोलकर लिस्ट करें (Hindi, Tamil, Bengali...)</div>
            </div>
          </button>
        </div>
      </div>

      {/* Success Dialog */}
      {successProduct && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-lg text-emerald-950 space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-serif text-lg font-bold">
                Handloom Listed Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                "{successProduct.name}" is now live in the catalog under artisan {formData.weaver_name}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 bg-[#1B2A4A] text-[#F6F1E7] text-xs font-semibold rounded-lg hover:bg-[#253966]"
            >
              View on Home Catalog
            </button>
            <button
              onClick={() => {
                setSuccessProduct(null);
                setFormData({
                  name: '',
                  weaver_name: formData.weaver_name,
                  region: formData.region,
                  material: '',
                  price: 6500,
                  description: '',
                  image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
                  glb_url: '',
                  swatch_pattern: 'antique-zari-kadwa',
                });
              }}
              className="px-4 py-2 bg-white text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg hover:bg-emerald-100"
            >
              List Another Textile
            </button>
          </div>
        </div>
      )}

      {/* Form & Live Card Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form (7 Cols) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-[#FDFBF7] p-6 sm:p-8 rounded-2xl border-2 border-[#D89B2C]/30 shadow-md space-y-6"
        >
          {errorMsg && (
            <div className="p-4 bg-[#7A2734]/10 border border-[#7A2734]/30 rounded-xl text-xs text-[#7A2734] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
              Handloom Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Royal Kadwa Banarasi Katan Silk Saree"
              className="w-full p-3 text-sm rounded-xl border border-[#D89B2C]/40 bg-white focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A]"
              id="sell-product-name-input"
            />
          </div>

          {/* Row 2: Weaver Name & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
                Weaver / Artisan Name *
              </label>
              <input
                type="text"
                required
                value={formData.weaver_name}
                onChange={(e) => setFormData({ ...formData, weaver_name: e.target.value })}
                placeholder="e.g. Ramkishan Master Weaver"
                className="w-full p-3 text-sm rounded-xl border border-[#D89B2C]/40 bg-white focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A]"
                id="sell-weaver-name-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
                Region / Cluster *
              </label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="e.g. Varanasi, Uttar Pradesh"
                className="w-full p-3 text-sm rounded-xl border border-[#D89B2C]/40 bg-white focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A]"
                id="sell-region-input"
              />
            </div>
          </div>

          {/* Row 3: Material & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
                Material & Yarn *
              </label>
              <input
                type="text"
                required
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. Pure Mulberry Katan Silk & Antique Zari"
                className="w-full p-3 text-sm rounded-xl border border-[#D89B2C]/40 bg-white focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A]"
                id="sell-material-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
                Artisan Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={500}
                max={500000}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-3 text-sm rounded-xl border border-[#D89B2C]/40 bg-white focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A] font-mono font-bold"
                id="sell-price-input"
              />
            </div>
          </div>

          {/* Row 4: Description with AI Storytelling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A]">
                Craft Description *
              </label>
              
              {/* Feature 1: AI Assistant Button */}
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDesc}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1B2A4A] text-[#D89B2C] hover:bg-[#253966] disabled:opacity-50 transition-colors shadow-sm"
                id="generate-description-ai-btn"
              >
                {isGeneratingDesc ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Story...</span>
                  </>
                ) : (
                  <>
                    <ThreadClusterIcon className="w-3.5 h-3.5 text-[#D89B2C]" />
                    <span>Generate description with AI</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the weaving technique, motif significance, and drape..."
              className="w-full p-3 text-sm rounded-xl border border-[#D89B2C]/40 bg-white focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A]"
              id="sell-description-input"
            />
            <p className="text-[11px] text-[#1B2A4A]/60">
              Tip: Click "Generate description with AI" to formulate an authentic 2-sentence poetic craft summary.
            </p>
          </div>

          {/* Row 5: Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A]">
              Product Photo *
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-[#D89B2C] hover:border-[#B87B16] rounded-xl text-xs font-medium text-[#1B2A4A] transition-colors shadow-sm">
                <Upload className="w-4 h-4 text-[#D89B2C]" />
                <span>Choose Photo File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="sell-photo-file-input"
                />
              </label>
              <span className="text-xs text-[#1B2A4A]/70 truncate max-w-xs">
                {selectedFile ? selectedFile.name : 'Or keep sample photo'}
              </span>
            </div>
          </div>

          {/* Row 6: 3D AR Drape & Sketchfab Model (Optional) */}
          <div className="space-y-2 pt-2 border-t border-[#D89B2C]/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-[#D89B2C]" />
                <span>3D AR Drape Model & Virtual Try-On</span>
              </label>
              <span className="text-[10px] text-gray-500">Auto-swatch fallback if empty</span>
            </div>

            {/* Quick 3D presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {PRESET_3D_MODELS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      glb_url: p.glb_url,
                      sketchfab_id: p.sketchfab_id,
                      model_type: p.model_type,
                    })
                  }
                  className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                    formData.sketchfab_id === p.sketchfab_id
                      ? 'bg-[#1B2A4A] text-[#D89B2C] border-[#D89B2C] font-semibold shadow-sm'
                      : 'bg-white text-[#1B2A4A]/80 border-gray-200 hover:border-[#D89B2C]'
                  }`}
                >
                  <div className="font-medium truncate">{p.label}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {p.sketchfab_id ? `3D ID: ${p.sketchfab_id.slice(0, 8)}...` : '2D Swatch'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-[#D89B2C] hover:bg-[#F5CE7B] text-[#1B2A4A] font-serif font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 border border-[#B87B16]"
              id="sell-submit-product-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing Handloom Listing...</span>
                </>
              ) : (
                <>
                  <Feather className="w-5 h-5" />
                  <span>Publish Handloom to Taana Marketplace</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right: Live Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1B2A4A]/70 flex items-center gap-1.5">
            <ThreadClusterIcon className="w-3.5 h-3.5 text-[#D89B2C]" />
            <span>Real-Time Marketplace Card Preview</span>
          </div>

          {/* Mock Product Card */}
          <div className="bg-[#FDFBF7] rounded-2xl overflow-hidden border-2 border-[#D89B2C] shadow-lg flex flex-col">
            <div className="relative aspect-[4/3] bg-[#1B2A4A]/10 overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {formData.glb_url ? (
                <div className="absolute top-3 right-3 bg-[#1B2A4A]/90 text-[#D89B2C] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#D89B2C]/40 flex items-center gap-1">
                  <Box className="w-3 h-3" />
                  <span>3D AR Ready</span>
                </div>
              ) : (
                <div className="absolute top-3 right-3 bg-[#F6F1E7]/90 text-[#1B2A4A] text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#1B2A4A]/20 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#D89B2C]" />
                  <span>Swatch Lens</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-[#7A2734] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                {formData.material ? formData.material.split('&')[0].trim() : 'Handloom Fabric'}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[#1B2A4A]/75">
                <MapPin className="w-3.5 h-3.5 text-[#D89B2C]" />
                <span className="font-semibold">{formData.weaver_name || 'Your Weaver Name'}</span>
                <span>•</span>
                <span>{formData.region || 'Your Weaving Cluster'}</span>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#1B2A4A]">
                {formData.name || 'Your Handloom Product Title'}
              </h3>

              <p className="text-xs text-[#1B2A4A]/80 line-clamp-2 leading-relaxed">
                {formData.description || 'Your 2-sentence artisan craft description will appear here.'}
              </p>

              <div className="pt-3 border-t border-[#D89B2C]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1B2A4A]/60 block">Price</span>
                  <span className="font-serif text-lg font-bold text-[#1B2A4A]">
                    ₹{Number(formData.price || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-md">
                  100% Authentic
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#D89B2C]/30 text-xs space-y-2 text-[#1B2A4A]/80">
            <h4 className="font-serif font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <ThreadClusterIcon className="w-3.5 h-3.5 text-[#D89B2C]" />
              Direct Weaver Guarantee
            </h4>
            <p className="text-[11px] leading-relaxed">
              When buyers purchase your textile, 90% is settled directly to your UPI/bank. 
              Optical weave inspection and fair-trade craft standards are supported by the Taana collective.
            </p>
          </div>
        </div>

      </div>

      {/* Voice Dictation Modal */}
      <VoiceDictationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyParsedData={handleApplyVoiceData}
      />
    </div>
  );
};
