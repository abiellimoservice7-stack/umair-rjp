
import { WallpaperStyle } from './types';

export const WALLPAPER_STYLES: WallpaperStyle[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    promptSuffix: 'minimalist style, clean lines, simple geometric shapes, high-end design, elegant, negative space',
    icon: 'fa-vector-square',
    preview: 'https://picsum.photos/id/10/400/300'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    promptSuffix: 'cyberpunk aesthetic, neon lights, futuristic city, rainy night, synthwave colors, high tech low life, detailed',
    icon: 'fa-microchip',
    preview: 'https://picsum.photos/id/20/400/300'
  },
  {
    id: 'nature',
    name: 'Ethereal Nature',
    promptSuffix: 'ethereal nature scene, majestic mountains, magical lighting, photorealistic, 8k resolution, serene, atmospheric',
    icon: 'fa-leaf',
    preview: 'https://picsum.photos/id/15/400/300'
  },
  {
    id: 'abstract',
    name: 'Abstract Art',
    promptSuffix: 'abstract flowing colors, liquid marble texture, vibrant palette, modern art, intricate patterns, flowing energy',
    icon: 'fa-palette',
    preview: 'https://picsum.photos/id/24/400/300'
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi World',
    promptSuffix: 'sci-fi concept art, alien landscape, space station, celestial bodies, epic scale, cinematic lighting, detailed tech',
    icon: 'fa-rocket',
    preview: 'https://picsum.photos/id/28/400/300'
  },
  {
    id: 'anime',
    name: 'Studio Ghibli',
    promptSuffix: 'vibrant anime style, studio ghibli aesthetic, hand-painted texture, beautiful scenery, whimsical, lush greenery',
    icon: 'fa-brush',
    preview: 'https://picsum.photos/id/40/400/300'
  }
];

export const ASPECT_RATIOS: { label: string; value: string; icon: string }[] = [
  { label: 'Square', value: '1:1', icon: 'fa-square' },
  { label: 'Mobile (Vertical)', value: '9:16', icon: 'fa-mobile-screen' },
  { label: 'Desktop (Wide)', value: '16:9', icon: 'fa-desktop' },
  { label: 'Classic', value: '4:3', icon: 'fa-tv' }
];
