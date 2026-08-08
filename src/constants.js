export const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || "29af5f2ba5c0de94314786fd4aa268cf";
export const RAWG_KEY = import.meta.env.VITE_RAWG_KEY || "ea7054ad2f3f4ce58bc6302629a87d47";

export const GENRE_MAP = { 28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western" };

export const DEFAULT_CONFIG = {
  scale: 1.3, x: 0, y: 0, 
  cardRoundness: 40, posterRoundness: 24, windowCorner: 30,
  textPos: 'bottom', showText: true, textAlign: 'left',
  categoryAlign: 'left', genresAlign: 'left',
  titleSize: 30, titleColor: '#ffffff', useGradientText: false, gradientStart: '#ff0000', gradientEnd: '#0000ff',
  subtitleSize: 12, categorySize: 10, genresSize: 10,
  showDesc: false, descSize: 12, showCategoryLine: true,
  customCanvas: false, canvasW: 380, canvasH: 675,
  imageHeight: 300, showBgImage: true, bgBlur: 60, bgZoom: 1.5, bgOpacity: 0.4, bgType: 'blur', solidBgColor: '#000000', bgGradientStart: '#000000', bgGradientEnd: '#2c2c2c',
  fontFamily: 'Inter', customFont: null,
  titleLetterSpacing: 0, subtitleLetterSpacing: 0, categoryLetterSpacing: 0, genresLetterSpacing: 0,
  lineHeight: 1.2
};

export const FONT_FAMILIES = [
  { name: 'Inter', value: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { name: 'Roboto', value: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { name: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
  { name: 'Oswald', value: 'Oswald, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { name: 'Raleway', value: 'Raleway, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { name: 'Bebas Neue', value: '"Bebas Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { name: 'Space Mono', value: '"Space Mono", "Courier New", Courier, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' }
];
