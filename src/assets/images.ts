// Game assets registry with local bundled images and curated external fallbacks
import antarcticOutpostImg from './images/antarctic_outpost_1790152328351.jpg';
import subglacialCavernImg from './images/subglacial_cavern_1790152339746.jpg';
import kodvarosCityImg from './images/kodvaros_city_1790152354608.jpg';
import theInfiniteImg from './images/the_infinite_1790152366924.jpg';

export const GAME_IMAGES = {
  antarcticOutpost: antarcticOutpostImg || '/assets/images/antarctic_outpost_1790152328351.jpg',
  subglacialCavern: subglacialCavernImg || '/assets/images/subglacial_cavern_1790152339746.jpg',
  kodvarosCity: kodvarosCityImg || '/assets/images/kodvaros_city_1790152354608.jpg',
  theInfinite: theInfiniteImg || '/assets/images/the_infinite_1790152366924.jpg',
};

export const FALLBACK_IMAGES: Record<keyof typeof GAME_IMAGES, string> = {
  antarcticOutpost: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
  subglacialCavern: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  kodvarosCity: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  theInfinite: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
};
