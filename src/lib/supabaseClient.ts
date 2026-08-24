import { createClient } from '@supabase/supabase-js';
import { Product, Weaver } from '../types';
import { INITIAL_PRODUCTS, INITIAL_WEAVERS } from '../data/initialHandlooms';
import { resolveHandloomImage } from '../utils/handloomImages';

// Target Supabase project configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ssguyeevpcehrvgttnqo.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase Client
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

const LOCAL_STORAGE_KEY_PRODUCTS = 'taana_custom_products';
const LOCAL_STORAGE_KEY_WEAVERS = 'taana_custom_weavers';

// Local storage helpers for prototype persistence & offline resilience
function getLocalCustomProducts(): Product[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCustomProduct(product: Product) {
  try {
    const current = getLocalCustomProducts();
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify([product, ...current]));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

/**
 * Fetch all products joined with their weaver details
 */
export async function fetchProducts(): Promise<{ data: Product[]; isSupabaseLive: boolean }> {
  try {
    if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          weaver_id,
          name,
          material,
          price,
          description,
          image_url,
          glb_url,
          swatch_pattern,
          created_at,
          weavers (
            id,
            name,
            region,
            bio,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Successfully pulled live from Supabase
        const formatted = data.map((item: any) => ({
          ...item,
          weavers: Array.isArray(item.weavers) ? item.weavers[0] : item.weavers,
        }));
        return { data: formatted, isSupabaseLive: true };
      }
    }
  } catch (err) {
    console.warn('Supabase fetch failed or table empty, loading handloom catalog:', err);
  }

  // Combine initial handlooms with any newly created user products (excluding old default IDs)
  const customProducts = getLocalCustomProducts().filter(
    (p) => !p.id.startsWith('prod-')
  );
  
  // Build product list with the authentic handloom products
  const allProducts = [
    ...customProducts,
    ...INITIAL_PRODUCTS.map((initProd) => ({
      ...initProd,
      image_url: resolveHandloomImage(initProd.name, initProd.image_url),
    })),
  ];
  
  return { data: allProducts, isSupabaseLive: false };
}

/**
 * Fetch single product by ID with weaver details
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          weaver_id,
          name,
          material,
          price,
          description,
          image_url,
          glb_url,
          swatch_pattern,
          created_at,
          weavers (
            id,
            name,
            region,
            bio,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          ...data,
          weavers: Array.isArray(data.weavers) ? data.weavers[0] : data.weavers,
        };
      }
    }
  } catch (err) {
    console.warn('Supabase single fetch failed, looking up in local catalog:', err);
  }

  // Look in custom products and initial data
  const custom = getLocalCustomProducts().find((p) => p.id === id);
  if (custom) return custom;

  const found = INITIAL_PRODUCTS.find((p) => p.id === id);
  if (found) {
    return {
      ...found,
      image_url: resolveHandloomImage(found.name, found.image_url),
    };
  }
  return null;
}

/**
 * Upload an image file to Supabase storage bucket 'product-images'
 */
export async function uploadProductImage(file: File): Promise<string> {
  try {
    if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20) {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `handloom-uploads/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload returned error (falling back to DataURL preview):', error);
      }
    }
  } catch (err) {
    console.warn('Storage upload exception:', err);
  }

  // Fallback to FileReader DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop');
    };
    reader.readAsDataURL(file);
  });
}

export interface CreateProductInput {
  name: string;
  weaver_name: string;
  region: string;
  material: string;
  price: number;
  description: string;
  image_url: string;
  glb_url?: string | null;
  sketchfab_id?: string | null;
  model_type?: string;
  swatch_pattern?: string | null;
}

/**
 * Submit a new product to Supabase:
 * 1. Checks if weaver exists or creates a new row in 'weavers'
 * 2. Inserts new row into 'products' with the weaver_id
 */
export async function createProductWithWeaver(input: CreateProductInput): Promise<Product> {
  let weaverId = `w-${Date.now()}`;
  let createdWeaver: Weaver = {
    id: weaverId,
    name: input.weaver_name.trim(),
    region: input.region.trim(),
    bio: `Artisan weaver from ${input.region}. Preserving authentic generational handloom weaving traditions.`,
    created_at: new Date().toISOString(),
  };

  // Try live Supabase insert
  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20) {
    try {
      // Step 1: Look for existing weaver by name and region
      const { data: existingWeavers } = await supabase
        .from('weavers')
        .select('id, name, region, bio, created_at')
        .ilike('name', input.weaver_name.trim())
        .ilike('region', input.region.trim())
        .limit(1);

      if (existingWeavers && existingWeavers.length > 0) {
        weaverId = existingWeavers[0].id;
        createdWeaver = existingWeavers[0];
      } else {
        // Create new weaver row
        const { data: newWeaverData, error: weaverErr } = await supabase
          .from('weavers')
          .insert([
            {
              name: input.weaver_name.trim(),
              region: input.region.trim(),
              bio: `Artisan weaver from ${input.region}. Preserving authentic generational handloom weaving traditions.`,
            },
          ])
          .select()
          .single();

        if (!weaverErr && newWeaverData) {
          weaverId = newWeaverData.id;
          createdWeaver = newWeaverData;
        }
      }

      // Step 2: Insert into products
      const { data: newProductData, error: productErr } = await supabase
        .from('products')
        .insert([
          {
            weaver_id: weaverId,
            name: input.name.trim(),
            material: input.material.trim(),
            price: Number(input.price),
            description: input.description.trim(),
            image_url: input.image_url,
            glb_url: input.glb_url || null,
            swatch_pattern: input.swatch_pattern || null,
          },
        ])
        .select(`
          id,
          weaver_id,
          name,
          material,
          price,
          description,
          image_url,
          glb_url,
          swatch_pattern,
          created_at
        `)
        .single();

      if (!productErr && newProductData) {
        const fullProduct: Product = {
          ...newProductData,
          sketchfab_id: input.sketchfab_id || null,
          model_type: input.model_type || 'saree',
          weavers: createdWeaver,
        };
        saveLocalCustomProduct(fullProduct);
        return fullProduct;
      } else {
        console.warn('Supabase product insertion error:', productErr);
      }
    } catch (err) {
      console.warn('Live Supabase creation exception, saving locally:', err);
    }
  }

  // Local fallback creation
  const localProduct: Product = {
    id: `prod-${Date.now()}`,
    weaver_id: weaverId,
    name: input.name.trim(),
    material: input.material.trim(),
    price: Number(input.price),
    description: input.description.trim(),
    image_url: input.image_url,
    glb_url: input.glb_url || null,
    sketchfab_id: input.sketchfab_id || null,
    model_type: input.model_type || 'saree',
    swatch_pattern: input.swatch_pattern || 'custom-weave',
    created_at: new Date().toISOString(),
    weavers: createdWeaver,
  };

  saveLocalCustomProduct(localProduct);
  return localProduct;
}
