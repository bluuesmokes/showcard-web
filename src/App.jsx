import React, { useState, useRef, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';
import html2canvas from 'html2canvas';
import { Search, Plus, X, Loader2, AlertCircle, Sparkles, Film, Music, Gamepad2 } from 'lucide-react';

import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

import { TMDB_KEY, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, GENRE_MAP, DEFAULT_CONFIG } from './constants';
import { extractAndApplyColors } from './utils/colorExtractor';
import { getSavedTheme, saveTheme, applyAppTheme, DEFAULT_THEME } from './utils/themeEngine';
import { searchMusic } from './utils/musicApi';
import { searchIgdbGames } from './utils/igdbApi';

import TopBar from './components/TopBar';
import Navigation from './components/Navigation';
import MediaCard from './components/MediaCard';
import CardPreview from './components/CardPreview';
import EditorPanel from './components/EditorPanel';
import { ConfirmDialog, ManualEntrySheet } from './components/Dialog';

// Font Loader helper
const FontLoader = () => {
  useEffect(() => {
    const fontUrls = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap',
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800;900&display=swap'
    ];

    fontUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
};

function ScaledCardPreview({ cardRef, config, posterData, safeImageUrl, isImageLoading }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const cardW = config.canvasW || 380;
      const cardH = config.canvasH || 675;
      const availW = container.clientWidth - 32;
      const availH = container.clientHeight - 32;
      setScale(Math.min(availW / cardW, availH / cardH, 1));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [config.canvasW, config.canvasH]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center pointer-events-none">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
        <CardPreview
          ref={cardRef}
          config={config}
          posterData={posterData}
          safeImageUrl={safeImageUrl}
          isImageLoading={isImageLoading}
        />
      </div>
    </div>
  );
}

function App() {
  const [activeMode, setActiveMode] = useState('movie');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isManual, setIsManual] = useState(false);
  const [editingManual, setEditingManual] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [appTheme, setAppTheme] = useState(() => getSavedTheme());

  const [posterData, setPosterData] = useState({
    title: '',
    subtitle: '',
    typeLabel: 'Movie',
    genres: '',
    image: null,
    overview: ''
  });

  const [safeImageUrl, setSafeImageUrl] = useState(null);
  const isImageLoading = false;

  const [config, setConfig] = useState({ ...DEFAULT_CONFIG });

  const cardRef = useRef(null);
  const hasChanges = JSON.stringify(config) !== JSON.stringify(DEFAULT_CONFIG);
  const editorActive = (selectedItem || editingManual) && !isReplacing;

  // Apply site theme on initial load or when appTheme updates (when not in card editor)
  useEffect(() => {
    if (!editorActive || !posterData.image) {
      applyAppTheme(appTheme);
    }
  }, [appTheme, editorActive, posterData.image]);

  // Restore site theme whenever leaving the editor studio
  useEffect(() => {
    if (!editorActive) {
      applyAppTheme(appTheme);
    }
  }, [editorActive, appTheme]);

  const handleThemeChange = (newTheme) => {
    setAppTheme(newTheme);
    saveTheme(newTheme);
    if (!editorActive || !posterData.image) {
      applyAppTheme(newTheme);
    }
  };

  const handleResetTheme = () => {
    setAppTheme(DEFAULT_THEME);
    saveTheme(DEFAULT_THEME);
    if (!editorActive || !posterData.image) {
      applyAppTheme(DEFAULT_THEME);
    }
  };

  // Process poster image blobs & trigger color extraction
  useEffect(() => {
    if (!posterData.image) {
      setSafeImageUrl(null);
      return;
    }

    let currentBlob = null;

    const processImage = async () => {
      if (posterData.image.startsWith('data:')) {
        setSafeImageUrl(posterData.image);
        extractAndApplyColors(posterData.image);
      } else {
        let proxiedUrl;
        if (
          posterData.image.includes('tmdb.org') ||
          posterData.image.includes('allorigins.win') ||
          posterData.image.includes('corsproxy.io') ||
          posterData.image.includes('igdb.com') ||
          posterData.image.includes('rawg.io') ||
          posterData.image.includes('itunes.apple.com') ||
          posterData.image.includes('mzstatic.com')
        ) {
          proxiedUrl = posterData.image;
        } else {
          proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(posterData.image)}`;
        }

        const blobUrl = await convertToBlobUrl(proxiedUrl);
        currentBlob = blobUrl;
        setSafeImageUrl(blobUrl || proxiedUrl);
        extractAndApplyColors(blobUrl || proxiedUrl);
      }
    };

    processImage();

    return () => {
      if (currentBlob && currentBlob.startsWith('blob:')) {
        URL.revokeObjectURL(currentBlob);
      }
    };
  }, [posterData.image]);

  const convertToBlobUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch {
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch {
        return url;
      }
    }
  };


  // Main search dispatcher
  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setResults([]);

    try {
      if (activeMode === 'movie') {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        const filtered = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv').map(item => ({
          ...item,
          typeLabel: item.media_type === 'movie' ? 'Movie' : 'TV Show'
        }));
        setResults(filtered);
      } else if (activeMode === 'music') {
        const musicResults = await searchMusic(query);
        setResults(musicResults);
      } else if (activeMode === 'game') {
        const gameResults = await searchIgdbGames(query);
        setResults(gameResults);
      }
    } catch {
      // Ignore search error
    } finally {
      setIsSearching(false);
    }
  };

  // Item selection handler
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setEditingManual(false);
    setIsReplacing(false);
    setIsManual(false);

    let title = item.title || item.name || item.collectionName || '';
    let subtitle = item.subtitle || (item.release_date || item.first_air_date || '').split('-')[0] || '';
    let typeLabel = item.typeLabel || (activeMode === 'movie' ? 'Movie' : activeMode === 'music' ? 'Song' : 'Game');
    let genres = item.genres || '';
    let image = item.image || (item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : null);
    let overview = item.overview || item.overview_path || '';

    if (item.genre_ids && item.genre_ids.length > 0) {
      genres = item.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(' • ');
    }

    setPosterData({
      title,
      subtitle,
      typeLabel,
      genres,
      image,
      overview
    });
  };

  const handleManualSubmit = () => {
    setIsManual(false);
    setEditingManual(true);
  };

  const openManualEntry = () => {
    setSelectedItem(null);
    setPosterData({
      title: '',
      subtitle: '',
      typeLabel: activeMode === 'movie' ? 'Movie' : activeMode === 'music' ? 'Song' : 'Game',
      genres: '',
      image: null,
      overview: ''
    });
    setIsManual(true);
  };

  // Upload image handler
  const onUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPosterData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to home state
  const exitToHome = () => {
    setSelectedItem(null);
    setEditingManual(false);
    setIsManual(false);
    setIsReplacing(false);
    setShowExitWarning(false);
    setConfig({ ...DEFAULT_CONFIG });
    setPosterData({
      title: '',
      subtitle: '',
      typeLabel: 'Movie',
      genres: '',
      image: null,
      overview: ''
    });
    applyAppTheme(appTheme);
  };

  // Download / Share Card handler
  const download = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    const cardW = config.canvasW || 380;
    const cardH = config.canvasH || 675;
    const TARGET_HEIGHT = 2160;
    const pixelRatio = TARGET_HEIGHT / cardH;

    try {
      let dataUrl;
      try {
        dataUrl = await domToPng(cardRef.current, {
          width: cardW,
          height: cardH,
          scale: pixelRatio,
          quality: 1.0,
        });
      } catch {
        const canvas = await html2canvas(cardRef.current, {
          width: cardW,
          height: cardH,
          scale: pixelRatio,
          useCORS: true,
          backgroundColor: null,
        });
        dataUrl = canvas.toDataURL('image/png');
      }

      if (Capacitor.isNativePlatform()) {
        const base64Data = dataUrl.split(',')[1];
        const fileName = `ShowCard_${Date.now()}.png`;
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: posterData.title || 'My ShowCard',
          text: `Check out my card for ${posterData.title}!`,
          url: savedFile.uri,
          dialogTitle: 'Share ShowCard'
        });
      } else {
        const link = document.createElement('a');
        link.download = `ShowCard_${posterData.title || 'card'}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // Ignore download errors
    } finally {
      setIsDownloading(false);
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeMode) {
      case 'music': return 'Search songs, albums, or paste link...';
      case 'game': return 'Search games...';
      default: return 'Search movies & TV shows...';
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] flex flex-col font-sans relative selection:bg-[var(--md-sys-color-primary)] selection:text-[var(--md-sys-color-on-primary)] overflow-hidden">
      <FontLoader />

      {/* Top App Bar (Fixed 64px height) */}
      <TopBar
        editorActive={editorActive}
        activeMode={activeMode}
        hasChanges={hasChanges}
        onExit={() => (hasChanges ? setShowExitWarning(true) : exitToHome())}
        onReplace={() => setIsReplacing(true)}
        theme={appTheme}
        onThemeChange={handleThemeChange}
        onResetTheme={handleResetTheme}
      />

      {/* Ambient Theme Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at top, var(--md-dynamic-accent-glow) 0%, transparent 70%)'
        }}
      />

      {/* Main Viewport */}
      {!editorActive ? (
        /* --- 1. SEARCH & MAIN DISCOVERY VIEW --- */
        <main className="flex-1 h-[calc(100dvh-4rem)] overflow-y-auto flex flex-col items-center px-4 pt-6 sm:pt-10 max-w-7xl mx-auto w-full pb-32 z-10 relative">

          {/* Search Header Hero */}
          <div className="w-full max-w-2xl text-center space-y-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)] flex items-center justify-center gap-2">
              <span>Create Beautiful Cards</span>
              <Sparkles size={28} className="text-[var(--md-sys-color-primary)] animate-pulse" />
            </h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Search any movie, TV show, song, album, game, or enter custom details.
            </p>

            {/* Expandable Search Bar */}
            <div className="relative mt-6">
              <div className="flex items-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-full px-4 py-2 shadow-xl focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/20 transition-all">
                <Search size={20} className="text-[var(--md-sys-color-outline)] ml-2 shrink-0" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-outline)]"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!e.target.value) {
                      setResults([]);
                      setHasSearched(false);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setResults([]);
                      setHasSearched(false);
                    }}
                    className="p-2 text-[var(--md-sys-color-outline)] hover:text-white transition rounded-full cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                )}

                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-5 py-2.5 rounded-full font-bold text-xs hover:opacity-90 active:scale-95 transition flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <span>Search</span>}
                </button>
              </div>
            </div>

            {/* Manual Entry Chip Button */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={openManualEntry}
                className="px-5 py-2 rounded-full border border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface-container)] text-xs font-bold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                <span>Custom / Manual Entry</span>
              </button>
            </div>
          </div>

          {/* Search Results Grid */}
          {results.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                  Results ({results.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((item, idx) => (
                  <MediaCard
                    key={item.id || idx}
                    item={item}
                    activeMode={activeMode}
                    onSelect={handleSelectItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty / No Results State */}
          {hasSearched && results.length === 0 && !isSearching && (
            <div className="py-16 text-center space-y-4 bg-[var(--md-sys-color-surface-container-low)] border border-white/5 rounded-[28px] max-w-md w-full my-6">
              <AlertCircle size={40} className="mx-auto text-[var(--md-sys-color-outline)]" />
              <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">No Results Found</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] px-6">
                Try searching with different keywords or create a card using Manual Entry.
              </p>
              <button
                onClick={openManualEntry}
                className="px-6 py-2.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-xs hover:opacity-90 transition cursor-pointer"
              >
                Create Manual Card
              </button>
            </div>
          )}

          {/* Bottom Mode Switcher Navigation */}
          {!isReplacing && (
            <Navigation
              activeMode={activeMode}
              setActiveMode={(id) => {
                setActiveMode(id);
                setResults([]);
                setHasSearched(false);
                setQuery('');
              }}
            />
          )}
        </main>
      ) : (
        /* --- 2. CARD EDITOR STUDIO --- */
        <div className="flex-1 h-[calc(100dvh-4rem)] w-full overflow-hidden flex flex-col md:flex-row z-10 relative">

          {/* Card Preview Screen */}
          <div className="h-[38vh] md:h-full md:flex-1 min-w-0 bg-[var(--md-sys-color-surface-container-lowest)] relative overflow-hidden flex items-center justify-center border-b md:border-b-0 border-white/10 shadow-xl z-20">
            <ScaledCardPreview
              cardRef={cardRef}
              config={config}
              posterData={posterData}
              safeImageUrl={safeImageUrl}
              isImageLoading={isImageLoading}
            />
          </div>

          {/* Editor Options Panel */}
          <EditorPanel
            config={config}
            setConfig={setConfig}
            posterData={posterData}
            setPosterData={setPosterData}
            isDownloading={isDownloading}
            onDownload={download}
            safeImageUrl={safeImageUrl}
          />
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExitWarning}
        title="Discard Card Changes?"
        message="Your customized card edits will be reset if you exit to search."
        confirmText="Exit Studio"
        cancelText="Keep Editing"
        isDanger={true}
        onConfirm={exitToHome}
        onCancel={() => setShowExitWarning(false)}
      />

      {/* Manual Entry Sheet */}
      <ManualEntrySheet
        isOpen={isManual}
        onClose={() => setIsManual(false)}
        onSubmit={handleManualSubmit}
        posterData={posterData}
        setPosterData={setPosterData}
        onUpload={onUpload}
      />
    </div>
  );
}

export default App;
