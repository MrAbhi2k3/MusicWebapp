import type { Album, Playlist, Song } from './api';

const PLAY_HISTORY_KEY = 'spiderbeats_play_history';
const SEARCH_HISTORY_KEY = 'spiderbeats_search_history';
const MAX_PLAY_HISTORY = 50;
const MAX_SEARCH_HISTORY = 30;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeQuery = (query: string): string => query.trim().toLowerCase();

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
};

const extractGenreSignals = (song: Song): string[] => {
  const genres = new Set<string>();
  const haystack = [
    song.language,
    song.name,
    song.album?.name,
    song.primaryArtists,
    song.featuredArtists,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes('hindi')) genres.add('hindi');
  if (haystack.includes('punjabi')) genres.add('punjabi');
  if (haystack.includes('tamil')) genres.add('tamil');
  if (haystack.includes('telugu')) genres.add('telugu');
  if (haystack.includes('english')) genres.add('english');
  if (haystack.includes('lofi') || haystack.includes('chill')) genres.add('chill');
  if (haystack.includes('rock')) genres.add('rock');
  if (haystack.includes('pop')) genres.add('pop');
  if (haystack.includes('rap') || haystack.includes('hip hop')) genres.add('hip hop');
  if (haystack.includes('romantic') || haystack.includes('love')) genres.add('romantic');

  if (genres.size === 0 && song.language) {
    genres.add(song.language.toLowerCase());
  }

  return Array.from(genres);
};

export const addSongToPlayHistory = (song: Song) => {
  const existing = getPlayHistory();
  const next = [
    song,
    ...existing.filter((item) => item.id !== song.id),
  ].slice(0, MAX_PLAY_HISTORY);

  localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(next));
};

export const getPlayHistory = (): Song[] => {
  return safeParse<Song[]>(localStorage.getItem(PLAY_HISTORY_KEY), []);
};

export const removeSongFromPlayHistory = (songId: string) => {
  const next = getPlayHistory().filter((song) => song.id !== songId);
  localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(next));
};

export const getTopGenresFromHistory = (limit = 3): string[] => {
  const history = getPlayHistory();
  const counts = new Map<string, number>();

  history.forEach((song) => {
    extractGenreSignals(song).forEach((genre) => {
      counts.set(genre, (counts.get(genre) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre);
};

export const addSearchToHistory = (query: string) => {
  const clean = normalizeQuery(query);
  if (!clean) return;

  const existing = getSearchHistory();
  const next: SearchHistoryItem[] = [
    { query: clean, timestamp: Date.now() },
    ...existing.filter((item) => item.query !== clean),
  ].slice(0, MAX_SEARCH_HISTORY);

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  return safeParse<SearchHistoryItem[]>(localStorage.getItem(SEARCH_HISTORY_KEY), []);
};

export const removeSearchHistoryItem = (query: string) => {
  const clean = normalizeQuery(query);
  const next = getSearchHistory().filter((item) => item.query !== clean);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
};

export const clearSearchHistory = () => {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
};

export const getSearchRecommendationQueries = (limit = 4): string[] => {
  return getSearchHistory()
    .slice(0, limit)
    .map((item) => `${item.query} songs`);
};

export const getGenreRecommendationQueries = (limit = 3): string[] => {
  return getTopGenresFromHistory(limit).map((genre) => `${genre} top songs`);
};

export const dedupeRecommendationBundle = (bundle: {
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
}) => {
  return {
    songs: dedupeById(bundle.songs),
    albums: dedupeById(bundle.albums),
    playlists: dedupeById(bundle.playlists),
  };
};
