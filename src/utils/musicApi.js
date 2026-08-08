export const parseMusicLink = (url) => {
  const spotifyPatterns = {
    track: /open\.spotify\.com\/(?:[a-zA-Z-]+\/)?track\/([a-zA-Z0-9]+)/,
    album: /open\.spotify\.com\/(?:[a-zA-Z-]+\/)?album\/([a-zA-Z0-9]+)/,
    artist: /open\.spotify\.com\/(?:[a-zA-Z-]+\/)?artist\/([a-zA-Z0-9]+)/
  };
  const applePatterns = {
    song: /music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/\d+\?i=(\d+)/,
    album: /music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/(\d+)/
  };

  for (const [type, pattern] of Object.entries(spotifyPatterns)) {
    const match = url.match(pattern);
    if (match) return { service: 'spotify', type, id: match[1] };
  }
  for (const [type, pattern] of Object.entries(applePatterns)) {
    const match = url.match(pattern);
    if (match) return { service: 'apple', type, id: match[1] };
  }
  return null;
};

// Fetches a temporary access token for Spotify API using client credentials
const getSpotifyToken = async () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Spotify API keys are missing in .env');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      console.error('Failed to get Spotify token:', response.statusText);
      return null;
    }
  } catch (err) {
    console.error('Error fetching Spotify token:', err);
    return null;
  }
};

const searchSpotifyById = async (type, id) => {
  const token = await getSpotifyToken();
  if (!token) return [];

  try {
    const endpoint = type === 'track' ? `https://api.spotify.com/v1/tracks/${id}` : `https://api.spotify.com/v1/albums/${id}`;
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (type === 'track') {
        return [{
          id: `spotify_track_${data.id}`,
          title: data.name,
          subtitle: data.artists.map(a => a.name).join(', '),
          typeLabel: 'Song',
          genres: 'music',
          overview: `${data.artists[0].name} • ${data.album.name || 'Single'}`,
          image: data.album.images[0]?.url || ''
        }];
      } else if (type === 'album') {
        return [{
          id: `spotify_album_${data.id}`,
          title: data.name,
          subtitle: data.artists.map(a => a.name).join(', '),
          typeLabel: 'Album',
          genres: 'music',
          overview: `${data.artists[0].name} • ${data.total_tracks} tracks`,
          image: data.images[0]?.url || ''
        }];
      }
    }
  } catch (err) {
    console.error('Spotify API search error:', err);
  }
  return [];
};

const searchAppleMusicById = async (type, id) => {
  try {
    const endpoint = type === 'song' 
      ? `https://itunes.apple.com/lookup?id=${id}&entity=song`
      : `https://itunes.apple.com/lookup?id=${id}&entity=album`;
      
    const res = await fetch(endpoint);
    const json = await res.json();
    
    if (json.results && json.results.length > 0) {
      const i = json.results[0];
      if (type === 'song') {
        return [{
          id: `itunes_${i.trackId}`,
          title: i.trackName,
          subtitle: i.artistName,
          typeLabel: 'Song',
          genres: i.primaryGenreName?.toLowerCase() || 'music',
          overview: `${i.artistName} • ${i.collectionName || 'Single'}`,
          image: i.artworkUrl100?.replace('100x100bb', '1000x1000bb') || ''
        }];
      } else {
        return [{
          id: `itunes_album_${i.collectionId}`,
          title: i.collectionName,
          subtitle: i.artistName,
          typeLabel: 'Album',
          genres: i.primaryGenreName?.toLowerCase() || 'music',
          overview: `${i.artistName} • ${i.trackCount} tracks`,
          image: i.artworkUrl100?.replace('100x100bb', '1000x1000bb') || ''
        }];
      }
    }
  } catch (err) {
    console.error('Apple Music lookup error:', err);
  }
  return [];
};

const searchItunesAndDeezer = async (query) => {
  const results = [];
  
  try {
    // 1. iTunes Search
    const [songsRes, albumsRes] = await Promise.all([
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&limit=8`).then(r => r.json()).catch(() => ({ results: [] })),
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=4`).then(r => r.json()).catch(() => ({ results: [] }))
    ]);

    const itunesResults = [
      ...(songsRes.results || []).map(i => ({
        id: `itunes_song_${i.trackId}`,
        title: i.trackName,
        subtitle: i.artistName,
        typeLabel: 'Song',
        genres: i.primaryGenreName?.toLowerCase() || 'music',
        overview: `${i.artistName} • ${i.collectionName || 'Single'}`,
        image: i.artworkUrl100?.replace('100x100bb', '1000x1000bb') || ''
      })),
      ...(albumsRes.results || []).map(i => ({
        id: `itunes_album_${i.collectionId}`,
        title: i.collectionName,
        subtitle: i.artistName,
        typeLabel: 'Album',
        genres: i.primaryGenreName?.toLowerCase() || 'music',
        overview: `${i.artistName} • ${i.trackCount} tracks`,
        image: i.artworkUrl100?.replace('100x100bb', '1000x1000bb') || ''
      }))
    ];
    
    results.push(...itunesResults);
  } catch (e) {
    console.error('iTunes search error:', e);
  }

  try {
    // 2. Deezer Search (via corsproxy to avoid browser CORS blocks)
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`;
    
    const res = await fetch(proxyUrl);
    const data = await res.json();
    
    if (data.data) {
      const deezerResults = data.data.map(i => ({
        id: `deezer_track_${i.id}`,
        title: i.title,
        subtitle: i.artist.name,
        typeLabel: 'Song (Deezer)',
        genres: 'music',
        overview: `${i.artist.name} • ${i.album.title || 'Single'}`,
        image: i.album.cover_xl || i.album.cover_big || ''
      }));
      results.push(...deezerResults);
    }
  } catch (e) {
    console.error('Deezer search error:', e);
  }

  return results;
};

export const searchMusic = async (query) => {
  const parsedLink = parseMusicLink(query.trim());
  
  if (parsedLink) {
    if (parsedLink.service === 'spotify') {
      return await searchSpotifyById(parsedLink.type, parsedLink.id);
    } else if (parsedLink.service === 'apple') {
      return await searchAppleMusicById(parsedLink.type, parsedLink.id);
    }
  }

  // If not a link, do text search across iTunes and Deezer
  return await searchItunesAndDeezer(query);
};
