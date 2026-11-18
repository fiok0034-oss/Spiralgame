// Bundled local game illustration assets with inline SVG data-URI fallback
import antarcticOutpostImg from './images/antarctic_outpost_1790152328351.jpg';
import subglacialCavernImg from './images/subglacial_cavern_1790152339746.jpg';
import kodvarosCityImg from './images/kodvaros_city_1790152354608.jpg';
import theInfiniteImg from './images/the_infinite_1790152366924.jpg';

const makeSvgFallback = (label: string, accent: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640">
      <defs>
        <radialGradient id="g" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#050811" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="640" fill="#050811"/>
      <rect width="1200" height="640" fill="url(#g)"/>
      <circle cx="600" cy="300" r="180" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="1.5"/>
      <circle cx="600" cy="300" r="110" fill="none" stroke="${accent}" stroke-opacity="0.55" stroke-width="1"/>
      <text x="600" y="310" fill="#e2e8f0" font-family="serif" font-size="26" text-anchor="middle" letter-spacing="6">${label}</text>
    </svg>`
  )}`;

export const GAME_IMAGES = {
  antarcticOutpost: antarcticOutpostImg,
  subglacialCavern: subglacialCavernImg,
  kodvarosCity: kodvarosCityImg,
  theInfinite: theInfiniteImg,
};

export const FALLBACK_IMAGES: Record<keyof typeof GAME_IMAGES, string> = {
  antarcticOutpost: makeSvgFallback('ANTARKTISZ · 82°16’S', '#38bdf8'),
  subglacialCavern: makeSvgFallback('SUBGLACIÁLIS KAMRA · Δ–T1', '#22d3ee'),
  kodvarosCity: makeSvgFallback('KÓDVÁROS · A HÁROM KÖR', '#a855f7'),
  theInfinite: makeSvgFallback('A VÉGTELEN SZEME', '#f59e0b'),
};
