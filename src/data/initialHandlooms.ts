import { Product, Weaver } from '../types';
import banarasiImg from '../assets/images/banarasi_silk_saree_1787498081819.jpg';
import pochampallyImg from '../assets/images/pochampally_ikat_dupatta_1787498098802.jpg';
import chanderiImg from '../assets/images/chanderi_cotton_stole_1787498112468.jpg';
import ajrakhImg from '../assets/images/ajrakh_stole_1787498144285.jpg';
import assamImg from '../assets/images/assam_gamosa_1787498156716.jpg';
import kanjivaramImg from '../assets/images/kanjivaram_silk_runner_1787498127081.jpg';

export const HANDLOOM_PHOTOS = {
  banarasi: banarasiImg || '/images/banarasi_silk_saree.jpg',
  pochampally: pochampallyImg || '/images/pochampally_ikat_dupatta.jpg',
  chanderi: chanderiImg || '/images/chanderi_cotton_stole.jpg',
  ajrakh: ajrakhImg || '/images/ajrakh_stole.jpg',
  assam: assamImg || '/images/assam_gamosa.jpg',
  kanjivaram: kanjivaramImg || '/images/kanjivaram_silk_runner.jpg',
};

export const INITIAL_WEAVERS: Weaver[] = [
  {
    id: 'w-1',
    name: 'Ramkishan & Brothers',
    region: 'Varanasi, Uttar Pradesh',
    bio: '5th generation master weavers specializing in pure mulberry Katan silk and hand-drawn Kadwa motifs with real gold zari.',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'w-2',
    name: 'Kalamkari & Ikat Guild',
    region: 'Pochampally, Telangana',
    bio: 'Pioneers of Telangana Double Ikat (Pagdu Bandhu) using heritage pit looms and herbal root dyes.',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'w-3',
    name: 'Meenakshi Devi Weavers Collective',
    region: 'Chanderi, Madhya Pradesh',
    bio: 'Specialists in featherlight gossamer silk-cotton with traditional botanical prints and rich woven borders.',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'w-4',
    name: 'Khatri Artisan Guild',
    region: 'Ajrakhpur, Kutch, Gujarat',
    bio: 'Master block-printers executing 14-stage natural indigo and madder root resistive printing on fine handwoven modal.',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'w-5',
    name: 'Sualkuchi Silk & Cotton Guild',
    region: 'Kamrup, Assam',
    bio: 'Traditional handloom artisans preserving the sacred red-and-white motif heritage of the Assamese Gamosa and Paat silk.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'w-6',
    name: 'Thanjavur Silk Loom Trust',
    region: 'Kanchipuram, Tamil Nadu',
    bio: 'Traditional Korvai interlock weaving with pure 3-ply mulberry silk and temple Gopuram borders with gold medallions.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export interface SketchfabModelInfo {
  id: string;
  sketchfabId: string;
  shortUrl: string;
  name: string;
  category: string;
  craftStyle: string;
  description: string;
  thumbnail: string;
  defaultDrapeStyle: 'pallu' | 'stole' | 'shawl' | 'wrap';
  productId: string;
}

export const SKETCHFAB_MODELS: SketchfabModelInfo[] = [
  {
    id: 'skfb-1',
    sketchfabId: '16dabb458c474062a5237bf745a678cf',
    shortUrl: 'https://skfb.ly/6QVX9',
    name: 'Rajasthani Royal Saree Drape',
    category: 'Royal Saree',
    craftStyle: 'Marwar Leheriya & Bandhani',
    description: 'Authentic 3D Rajasthani royal drape featuring pleated pallu and fluid silk cascade.',
    thumbnail: HANDLOOM_PHOTOS.kanjivaram,
    defaultDrapeStyle: 'pallu',
    productId: 'prod-6',
  },
  {
    id: 'skfb-2',
    sketchfabId: '8feb98c26c16459a867d7a01ec9a0601',
    shortUrl: 'https://skfb.ly/6ASCQ',
    name: 'Indian Handloom Silk Saree Drape',
    category: 'Classic Silk Saree',
    craftStyle: 'Banarasi Kadwa Katan Silk',
    description: 'Classic 3D Indian saree with traditional pleats, golden zari border, and shoulder pallu fall.',
    thumbnail: HANDLOOM_PHOTOS.banarasi,
    defaultDrapeStyle: 'pallu',
    productId: 'prod-1',
  },
  {
    id: 'skfb-3',
    sketchfabId: '4923c6d767f84055868c456a8f4c267b',
    shortUrl: 'https://skfb.ly/oHtFw',
    name: 'Traditional Cloth Stole & Dupatta Drape',
    category: 'Stole & Dupatta',
    craftStyle: 'Pochampally Double Ikat & Ajrakh',
    description: 'Dynamic cloth simulation 3D mesh showcasing over-the-shoulder drape and chest cross.',
    thumbnail: HANDLOOM_PHOTOS.pochampally,
    defaultDrapeStyle: 'stole',
    productId: 'prod-2',
  },
  {
    id: 'skfb-4',
    sketchfabId: 'a7b833445be3427088eead52d4178672',
    shortUrl: 'https://skfb.ly/oyBJ7',
    name: 'Handloom Gossamer & Cotton Weave',
    category: 'Featherlight Weave',
    craftStyle: 'Chanderi Handloom & Assam Gamosa',
    description: '3D articulated drape model capturing translucent weave drape and handcrafted textile patterns.',
    thumbnail: HANDLOOM_PHOTOS.chanderi,
    defaultDrapeStyle: 'wrap',
    productId: 'prod-3',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    weaver_id: 'w-1',
    name: 'Royal Kadwa Banarasi Silk Saree',
    material: 'Pure Mulberry Katan Silk & Golden Zari',
    price: 18500,
    description: 'Woven on a traditional pit loom over 28 days, this heirloom golden yellow Banarasi masterpiece features hand-embossed floral Kadwa motifs and a regal pleated pallu.',
    image_url: HANDLOOM_PHOTOS.banarasi,
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    sketchfab_id: '8feb98c26c16459a867d7a01ec9a0601',
    model_type: 'saree',
    swatch_pattern: 'antique-zari-kadwa',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    weavers: INITIAL_WEAVERS[0],
  },
  {
    id: 'prod-2',
    weaver_id: 'w-2',
    name: 'Pochampally Ikat Silk Dupatta',
    material: 'Handspun Natural Mulberry Silk',
    price: 6400,
    description: 'Precision warp-and-weft resist-dyed before weaving, featuring a striking two-tone crimson red and navy blue geometric Ikat pattern with finished fringe tassels.',
    image_url: HANDLOOM_PHOTOS.pochampally,
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    sketchfab_id: '4923c6d767f84055868c456a8f4c267b',
    model_type: 'stole',
    swatch_pattern: 'ikat-diamond-indigo',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    weavers: INITIAL_WEAVERS[1],
  },
  {
    id: 'prod-3',
    weaver_id: 'w-3',
    name: 'Chanderi Cotton Handcrafted Stole',
    material: 'Fine Cotton-Silk Blend with Heritage Block Prints',
    price: 3800,
    description: 'Featherlight breathable Chanderi cotton stole in warm beige cream, adorned with earthy terracotta floral tree motifs and a rich indigo decorative border.',
    image_url: HANDLOOM_PHOTOS.chanderi,
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    sketchfab_id: 'a7b833445be3427088eead52d4178672',
    model_type: 'stole',
    swatch_pattern: 'chanderi-gold-tissue',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    weavers: INITIAL_WEAVERS[2],
  },
  {
    id: 'prod-4',
    weaver_id: 'w-4',
    name: 'Imperial Ajrakh Block-Printed Stole',
    material: 'Natural Indigo & Madder Dyed Fine Modal Cotton',
    price: 4900,
    description: 'Traditional 14-stage resist hand-block printed Ajrakh stole in deep indigo and madder red, featuring timeless geometric star jaal patterns and intricate borders.',
    image_url: HANDLOOM_PHOTOS.ajrakh,
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    sketchfab_id: '4923c6d767f84055868c456a8f4c267b',
    model_type: 'stole',
    swatch_pattern: 'kashmiri-pashmina-sozni',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    weavers: INITIAL_WEAVERS[3],
  },
  {
    id: 'prod-5',
    weaver_id: 'w-5',
    name: 'Traditional Handwoven Assam Gamosa',
    material: 'Organic Handspun White Khadi Cotton & Red Weft',
    price: 1850,
    description: 'Authentic symbol of Assamese respect and craftsmanship, handwoven on traditional throw-shuttle looms in pristine white cotton with intricate red floral motifs on the border.',
    image_url: HANDLOOM_PHOTOS.assam,
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    sketchfab_id: 'a7b833445be3427088eead52d4178672',
    model_type: 'stole',
    swatch_pattern: 'jamdani-floral-muslin',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    weavers: INITIAL_WEAVERS[4],
  },
  {
    id: 'prod-6',
    weaver_id: 'w-6',
    name: 'Kanjivaram Silk Runner & Temple Saree',
    material: 'Heavy Pure Mulberry Silk with Gold Zari Medallions',
    price: 22000,
    description: 'Opulent magenta pink Kanjivaram silk fabric embellished with intricately woven circular gold zari medallions (ashrafi) and authentic South Indian temple borders.',
    image_url: HANDLOOM_PHOTOS.kanjivaram,
    glb_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    sketchfab_id: '16dabb458c474062a5237bf745a678cf',
    model_type: 'saree',
    swatch_pattern: 'kanjeevaram-korvai-temple',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    weavers: INITIAL_WEAVERS[5],
  },
];
