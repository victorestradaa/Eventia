export type CategoriaEvento = 'BODA' | 'XV_ANOS' | 'BAUTIZO' | 'FIESTA_INFANTIL' | 'FIESTA_GENERAL' | 'TODOS';

export interface AssetGraphic {
  id: string;
  url: string;
  type: 'background' | 'sticker' | 'shape';
  name: string;
}

export interface FontConfig {
  name: string;
  family: string;
}

export interface AssetsDictionary {
  [key: string]: {
    backgrounds: AssetGraphic[];
    stickers: AssetGraphic[];
    fonts: FontConfig[];
  };
}

export const COMMON_FONTS: FontConfig[] = [
  { name: 'Elegante Serif', family: 'Georgia, serif' },
  { name: 'Moderna Sans', family: 'Arial, sans-serif' },
  { name: 'Impacto', family: 'Impact, sans-serif' },
  { name: 'Cursiva Clásica', family: '"Brush Script MT", cursive' },
  { name: 'Monoespaciada', family: 'monospace' },
];

export const ASSETS_INVITACIONES: AssetsDictionary = {
  'BODA': {
    backgrounds: [
      { id: 'boda-bg-1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Flores Blancas' },
      { id: 'boda-bg-2', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Alianzas Doradas' },
      { id: 'boda-bg-3', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Mármol Elegante' },
    ],
    stickers: [
      { id: 'boda-st-1', url: 'https://cdn-icons-png.flaticon.com/512/1010/1010072.png', type: 'sticker', name: 'Anillos' },
      { id: 'boda-st-2', url: 'https://cdn-icons-png.flaticon.com/512/865/865882.png', type: 'sticker', name: 'Novios' },
      { id: 'boda-st-3', url: 'https://cdn-icons-png.flaticon.com/512/2870/2870836.png', type: 'sticker', name: 'Palomas' },
    ],
    fonts: COMMON_FONTS,
  },
  'XV_ANOS': {
    backgrounds: [
      { id: 'xv-bg-1', url: 'https://images.unsplash.com/photo-1533174000220-43da2d3b2361?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Corona Neon' },
      { id: 'xv-bg-2', url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Destellos Rosa' },
    ],
    stickers: [
      { id: 'xv-st-1', url: 'https://cdn-icons-png.flaticon.com/512/1151/1151240.png', type: 'sticker', name: 'Corona' },
      { id: 'xv-st-2', url: 'https://cdn-icons-png.flaticon.com/512/2618/2618361.png', type: 'sticker', name: 'Tacón' },
    ],
    fonts: COMMON_FONTS,
  },
  'FIESTA_INFANTIL': {
    backgrounds: [
      { id: 'inf-bg-1', url: 'https://images.unsplash.com/photo-1530103862676-de8892ebeea0?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Globos Colores' },
      { id: 'inf-bg-2', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Confetti' },
    ],
    stickers: [
      { id: 'inf-st-1', url: 'https://cdn-icons-png.flaticon.com/512/2618/2618299.png', type: 'sticker', name: 'Pastel' },
      { id: 'inf-st-2', url: 'https://cdn-icons-png.flaticon.com/512/2407/2407186.png', type: 'sticker', name: 'Globo' },
      { id: 'inf-st-3', url: 'https://cdn-icons-png.flaticon.com/512/1904/1904675.png', type: 'sticker', name: 'Regalo' },
    ],
    fonts: COMMON_FONTS,
  },
  'BAUTIZO': {
    backgrounds: [
      { id: 'bau-bg-1', url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Alas y Cielo' },
      { id: 'bau-bg-2', url: 'https://images.unsplash.com/photo-1558281050-8c2cb8ae1e81?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Suave Pastel' },
    ],
    stickers: [
      { id: 'bau-st-1', url: 'https://cdn-icons-png.flaticon.com/512/3673/3673030.png', type: 'sticker', name: 'Ángel' },
      { id: 'bau-st-2', url: 'https://cdn-icons-png.flaticon.com/512/2072/2072125.png', type: 'sticker', name: 'Paloma' },
    ],
    fonts: COMMON_FONTS,
  },
  'FIESTA_GENERAL': {
    backgrounds: [
      { id: 'gen-bg-1', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Club Neón' },
      { id: 'gen-bg-2', url: 'https://images.unsplash.com/photo-1470229722913-7c092bbdd335?auto=format&fit=crop&q=80&w=600&h=1000', type: 'background', name: 'Concierto' },
    ],
    stickers: [
      { id: 'gen-st-1', url: 'https://cdn-icons-png.flaticon.com/512/2407/2407189.png', type: 'sticker', name: 'Copas' },
      { id: 'gen-st-2', url: 'https://cdn-icons-png.flaticon.com/512/2026/2026369.png', type: 'sticker', name: 'Música' },
    ],
    fonts: COMMON_FONTS,
  },
};

export const getAssetsByTipo = (tipo: CategoriaEvento | string) => {
  const tipoAjustado = tipo in ASSETS_INVITACIONES ? tipo : 'FIESTA_GENERAL';
  return ASSETS_INVITACIONES[tipoAjustado];
};
