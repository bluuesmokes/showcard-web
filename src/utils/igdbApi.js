/**
 * IGDB (Internet Game Database) API Service
 * Handles Twitch OAuth2 authentication and IGDB game searching.
 */

import { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } from '../constants';

let cachedToken = null;
let tokenExpiry = 0;

export const getIgdbToken = async () => {
  const clientId = import.meta.env.VITE_IGDB_CLIENT_ID || IGDB_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_IGDB_CLIENT_SECRET || IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
    let response;
    try {
      response = await fetch(authUrl, { method: 'POST' });
    } catch {
      // Fallback via CORS proxy if browser blocks direct OAuth fetch
      response = await fetch(`https://corsproxy.io/?${encodeURIComponent(authUrl)}`, { method: 'POST' });
    }

    if (response.ok) {
      const data = await response.json();
      cachedToken = data.access_token;
      // Expire 5 minutes before actual token expiry
      tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
      return cachedToken;
    }
  } catch (err) {
    console.error('Error fetching IGDB token:', err);
  }
  return null;
};

export const searchIgdbGames = async (query) => {
  if (!query.trim()) return [];

  const clientId = import.meta.env.VITE_IGDB_CLIENT_ID || IGDB_CLIENT_ID;
  const token = await getIgdbToken();

  const igdbEndpoint = 'https://api.igdb.com/v4/games';
  const bodyQuery = `search "${query.replace(/"/g, '\\"').replace(/\\/g, '')}"; fields name, summary, rating, first_release_date, genres.name, platforms.name, cover.url, cover.image_id; limit 20;`;

  const headers = {
    'Client-ID': clientId,
    'Content-Type': 'text/plain',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response;
    try {
      response = await fetch(igdbEndpoint, {
        method: 'POST',
        headers,
        body: bodyQuery
      });
    } catch {
      // Fallback via corsproxy if browser blocks direct CORS POST
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(igdbEndpoint)}`;
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers,
        body: bodyQuery
      });
    }

    if (response.ok) {
      const games = await response.json();
      if (Array.isArray(games)) {
        return games.map(g => {
          let releaseYear = '';
          if (g.first_release_date) {
            releaseYear = new Date(g.first_release_date * 1000).getFullYear().toString();
          }

          let imageUrl = null;
          if (g.cover && g.cover.url) {
            const rawUrl = g.cover.url.startsWith('//') ? `https:${g.cover.url}` : g.cover.url;
            imageUrl = rawUrl.replace('/t_thumb/', '/t_1080p/');
          } else if (g.cover && g.cover.image_id) {
            imageUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${g.cover.image_id}.jpg`;
          }

          const genres = g.genres ? g.genres.map(gn => gn.name).join(', ') : '';
          const platforms = g.platforms ? g.platforms.map(p => p.name).slice(0, 3).join(', ') : '';
          const ratingScore = g.rating ? (g.rating / 20).toFixed(1) : null;

          let overviewParts = [];
          if (ratingScore) overviewParts.push(`Rating: ${ratingScore} / 5`);
          if (platforms) overviewParts.push(`Platforms: ${platforms}`);
          if (g.summary && overviewParts.length === 0) overviewParts.push(g.summary);

          return {
            id: `igdb_${g.id}`,
            title: g.name,
            subtitle: releaseYear,
            typeLabel: 'Game',
            genres: genres,
            overview: overviewParts.join(' • ') || g.summary || '',
            image: imageUrl
          };
        });
      }
    }
  } catch (err) {
    console.error('IGDB search error:', err);
  }

  return [];
};
