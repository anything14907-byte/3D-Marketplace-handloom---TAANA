import banarasiImg from '../assets/images/banarasi_silk_saree_1787498081819.jpg';
import pochampallyImg from '../assets/images/pochampally_ikat_dupatta_1787498098802.jpg';
import chanderiImg from '../assets/images/chanderi_cotton_stole_1787498112468.jpg';
import ajrakhImg from '../assets/images/ajrakh_stole_1787498144285.jpg';
import assamImg from '../assets/images/assam_gamosa_1787498156716.jpg';
import kanjivaramImg from '../assets/images/kanjivaram_silk_runner_1787498127081.jpg';

export const HANDLOOM_IMAGE_MAP: Record<string, string> = {
  banarasi: banarasiImg || '/images/banarasi_silk_saree.jpg',
  pochampally: pochampallyImg || '/images/pochampally_ikat_dupatta.jpg',
  chanderi: chanderiImg || '/images/chanderi_cotton_stole.jpg',
  ajrakh: ajrakhImg || '/images/ajrakh_stole.jpg',
  assam: assamImg || '/images/assam_gamosa.jpg',
  kanjivaram: kanjivaramImg || '/images/kanjivaram_silk_runner.jpg',
};

/**
 * Resolves the accurate high-resolution handloom photograph for any product
 */
export function resolveHandloomImage(name?: string, currentUrl?: string): string {
  const query = (name || '').toLowerCase();
  
  if (query.includes('banarasi') || query.includes('saree') && query.includes('yellow')) {
    return HANDLOOM_IMAGE_MAP.banarasi;
  }
  if (query.includes('pochampally') || query.includes('ikat') || query.includes('dupatta')) {
    return HANDLOOM_IMAGE_MAP.pochampally;
  }
  if (query.includes('chanderi') || query.includes('beige')) {
    return HANDLOOM_IMAGE_MAP.chanderi;
  }
  if (query.includes('ajrakh') || query.includes('indigo') || query.includes('madder')) {
    return HANDLOOM_IMAGE_MAP.ajrakh;
  }
  if (query.includes('gamosa') || query.includes('assam') || query.includes('khadi')) {
    return HANDLOOM_IMAGE_MAP.assam;
  }
  if (query.includes('kanjivaram') || query.includes('kanchipuram') || query.includes('runner') || query.includes('pink') || query.includes('magenta')) {
    return HANDLOOM_IMAGE_MAP.kanjivaram;
  }
  
  if (currentUrl && currentUrl.startsWith('data:') || currentUrl && currentUrl.startsWith('/')) {
    return currentUrl;
  }

  return HANDLOOM_IMAGE_MAP.banarasi;
}
