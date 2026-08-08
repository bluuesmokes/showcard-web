# ShowCard Web

ShowCard is a web application for creating beautiful, shareable media cards for your favorite movies, TV shows, music, and games. It brings the same card customization experience as the Android app straight to the browser, with dynamic color extraction, custom fonts, background effects, and high-res PNG exporting.

## Features

- **Multi-Media Search**: Search for movies and TV shows (TMDB), music (iTunes/Apple Music/Spotify), and games (RAWG).
- **Custom Entry**: Create cards from scratch with your own titles, descriptions, genres, and artwork.
- **Dynamic Color Extraction**: Automatically pulls color palettes from poster artwork for adaptive theming.
- **Background Effects**: Blurred image backgrounds with adjustable blur/opacity/zoom, solid colors, or two-tone gradients.
- **Typography & Fonts**: Built-in Google Fonts selection, plus upload your own custom font files (`.ttf`, `.otf`, `.woff`, `.woff2`). Fine-grained control over title, subtitle, category, genre, and description sizing.
- **Aspect Ratio Presets**: Story (9:16), Square (1:1), Portrait (4:5), Vertical (3:4), Classic (2:3), and Compact (1:2).
- **Card Editor**: Adjust corner roundness, poster framing, zoom, offset positioning, category underline toggle, and more.
- **High-Res Export**: Save cards as crisp PNG images.

## Tech Stack

- **Framework**: React 19, Vite 7
- **Styling**: Vanilla CSS + Tailwind CSS v4
- **Icons**: Lucide React
- **Export Engine**: modern-screenshot & html2canvas
- **Mobile Support**: Capacitor (Share & Filesystem plugins)

## Setup & Build

1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your API keys:
   - [TMDB API Key](https://www.themoviedb.org/documentation/api)
   - [RAWG API Key](https://rawg.io/apidocs)
   - [Spotify API](https://developer.spotify.com/dashboard)
4. Run the dev server: `npm run dev`
5. Build for production: `npm run build`

## Android App

- Check out the native Android version at [showcard-android](https://github.com/bluuesmokes/showcard-android).

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
