export interface Weaver {
  id: string;
  name: string;
  region: string;
  bio?: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  weaver_id: string;
  name: string;
  material: string;
  price: number;
  description: string;
  image_url: string;
  glb_url: string | null;
  sketchfab_id?: string | null;
  model_type?: 'saree' | 'stole' | 'shawl' | 'dupatta' | string;
  swatch_pattern: string | null;
  created_at?: string;
  weavers?: Weaver | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
