const API_BASE_URL = 'https://jiosaavn-apix.arcadopredator.workers.dev/api';


// Fixing of HTML erros in API responses
export const decodeHtmlEntities = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

// API Response Types
export interface ApiImage {
  quality: string;
  url: string;
}

export interface ApiArtist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: ApiImage[];
  url: string;
}

// Song endpoints of apis
export interface ApiSongDetail {
  id: string;
  name: string;
  type: string;
  year: string | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: ApiArtist[];
    featured: ApiArtist[];
    all: ApiArtist[];
  };
  image: ApiImage[];
  downloadUrl: { quality: string; url: string }[];
}

// Album endpoints
export interface ApiAlbumDetail {
  id: string;
  name: string;
  description: string;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  artists: {
    primary: ApiArtist[];
    featured: ApiArtist[];
    all: ApiArtist[];
  };
  songCount: number | null;
  url: string;
  image: ApiImage[];
  songs: ApiSongDetail[] | null;
}

// Playlist endpoints
export interface ApiPlaylistDetail {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  songCount: number | null;
  url: string;
  image: ApiImage[];
  songs: ApiSongDetail[] | null;
  artists: ApiArtist[] | null;
}

// Search  from head bar
export interface GlobalSearchSong {
  id: string;
  title: string;
  image: ApiImage[];
  album: string;
  url: string;
  type: string;
  description: string;
  primaryArtists: string;
  singers: string;
  language: string;
}

export interface GlobalSearchAlbum {
  id: string;
  title: string;
  image: ApiImage[];
  artist: string;
  url: string;
  type: string;
  description: string;
  year: string;
  language: string;
}

export interface GlobalSearchArtist {
  id: string;
  title: string;
  image: ApiImage[];
  type: string;
  description: string;
}

export interface GlobalSearchPlaylist {
  id: string;
  title: string;
  image: ApiImage[];
  url: string;
  language: string;
  type: string;
  description: string;
}

// Search results from global /search endpoint
export interface SearchResults {
  topQuery: {
    results: GlobalSearchSong[];
  };
  songs: {
    results: GlobalSearchSong[];
  };
  albums: {
    results: GlobalSearchAlbum[];
  };
  artists: {
    results: GlobalSearchArtist[];
  };
  playlists: {
    results: GlobalSearchPlaylist[];
  };
}

// App types for internal use
export interface Song {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  releaseDate: string;
  duration: number;
  label: string;
  primaryArtists: string;
  primaryArtistsId: string;
  featuredArtists: string;
  explicitContent: boolean;
  playCount: number;
  language: string;
  hasLyrics: boolean;
  url: string;
  copyright: string;
  image: ApiImage[];
  downloadUrl: Array<{ quality: string; url: string }>;
}

export interface Album {
  id: string;
  name: string;
  year: string;
  releaseDate: string;
  songCount: number;
  url: string;
  primaryArtistsId: string;
  primaryArtists: string;
  featuredArtists: string;
  artists: ApiArtist[];
  image: ApiImage[];
  songs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  year: string;
  songCount: number;
  url: string;
  image: ApiImage[];
  songs: Song[];
}

export interface RecommendationBundle {
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
}

// Conversion functions
const convertApiSong = (apiSong: ApiSongDetail): Song => {
  return {
    id: apiSong.id,
    name: decodeHtmlEntities(apiSong.name || ''),
    album: {
      id: apiSong.album?.id || '',
      name: decodeHtmlEntities(apiSong.album?.name || ''),
      url: apiSong.album?.url || '',
    },
    year: apiSong.year || '',
    releaseDate: apiSong.releaseDate || '',
    duration: apiSong.duration || 0,
    label: decodeHtmlEntities(apiSong.label || ''),
    primaryArtists:
      decodeHtmlEntities(apiSong.artists?.primary?.map((a) => a.name).join(', ') || ''),
    primaryArtistsId: apiSong.artists?.primary?.[0]?.id || '',
    featuredArtists:
      decodeHtmlEntities(apiSong.artists?.featured?.map((a) => a.name).join(', ') || ''),
    explicitContent: apiSong.explicitContent || false,
    playCount: apiSong.playCount || 0,
    language: apiSong.language || '',
    hasLyrics: apiSong.hasLyrics || false,
    url: apiSong.url || '',
    copyright: decodeHtmlEntities(apiSong.copyright || ''),
    image: apiSong.image || [],
    downloadUrl: apiSong.downloadUrl || [],
  };
};

const convertApiAlbum = (apiAlbum: ApiAlbumDetail): Album => {
  return {
    id: apiAlbum.id,
    name: decodeHtmlEntities(apiAlbum.name || ''),
    year: apiAlbum.year?.toString() || '',
    releaseDate: '',
    songCount: apiAlbum.songCount || 0,
    url: apiAlbum.url || '',
    primaryArtistsId: '',
    primaryArtists:
      decodeHtmlEntities(apiAlbum.artists?.primary?.map((a) => a.name).join(', ') || ''),
    featuredArtists:
      decodeHtmlEntities(apiAlbum.artists?.featured?.map((a) => a.name).join(', ') || ''),
    artists: apiAlbum.artists?.all || [],
    image: apiAlbum.image || [],
    songs: apiAlbum.songs ? apiAlbum.songs.map(convertApiSong) : [],
  };
};

const convertApiPlaylist = (apiPlaylist: ApiPlaylistDetail): Playlist => {
  return {
    id: apiPlaylist.id,
    name: decodeHtmlEntities(apiPlaylist.name || ''),
    description: decodeHtmlEntities(apiPlaylist.description || ''),
    year: apiPlaylist.year?.toString() || '',
    songCount: apiPlaylist.songCount || 0,
    url: apiPlaylist.url || '',
    image: apiPlaylist.image || [],
    songs: apiPlaylist.songs ? apiPlaylist.songs.map(convertApiSong) : [],
  };
};

// Convert global search song to app Song format
const convertGlobalSearchSong = (apiSong: GlobalSearchSong): Song => {
  return {
    id: apiSong.id,
    name: decodeHtmlEntities(apiSong.title || ''),
    album: {
      id: '',
      name: decodeHtmlEntities(apiSong.album || ''),
      url: apiSong.url || '',
    },
    year: '',
    releaseDate: '',
    duration: 0,
    label: '',
    primaryArtists: decodeHtmlEntities(apiSong.primaryArtists || apiSong.singers || ''),
    primaryArtistsId: '',
    featuredArtists: '',
    explicitContent: false,
    playCount: 0,
    language: apiSong.language || '',
    hasLyrics: false,
    url: apiSong.url || '',
    copyright: '',
    image: apiSong.image || [],
    downloadUrl: [],
  };
};

// Convert global search album to app Album format
const convertGlobalSearchAlbum = (apiAlbum: GlobalSearchAlbum): Album => {
  return {
    id: apiAlbum.id,
    name: decodeHtmlEntities(apiAlbum.title || ''),
    year: apiAlbum.year || '',
    releaseDate: '',
    songCount: 0,
    url: apiAlbum.url || '',
    primaryArtistsId: '',
    primaryArtists: decodeHtmlEntities(apiAlbum.artist || ''),
    featuredArtists: '',
    artists: [],
    image: apiAlbum.image || [],
    songs: [],
  };
};

// Convert global search playlist to app Playlist format
const convertGlobalSearchPlaylist = (apiPlaylist: GlobalSearchPlaylist): Playlist => {
  return {
    id: apiPlaylist.id,
    name: decodeHtmlEntities(apiPlaylist.title || ''),
    description: decodeHtmlEntities(apiPlaylist.description || ''),
    year: '',
    songCount: 0,
    url: apiPlaylist.url || '',
    image: apiPlaylist.image || [],
    songs: [],
  };
};

// Helper functions
export const getImageUrl = (images: ApiImage[], quality: '500x500' | '150x150' | '50x50' = '500x500'): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '';
  }
  
  const image = images.find(img => img.quality === quality) || images[images.length - 1];
  return image?.url || '';
};

export const getAudioUrl = (
  downloadUrl: Array<{ quality: string; url: string }>,
  preferredQuality?: string
): string => {
  if (!downloadUrl || !Array.isArray(downloadUrl) || downloadUrl.length === 0) {
    return '';
  }

  if (preferredQuality) {
    const preferred = downloadUrl.find((url) => url.quality === preferredQuality);
    if (preferred) {
      return preferred.url || '';
    }
  }

  const fallbackPriority = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  for (const quality of fallbackPriority) {
    const item = downloadUrl.find((url) => url.quality === quality);
    if (item?.url) return item.url;
  }

  return downloadUrl[0]?.url || '';
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Global search
export const search = async (query: string): Promise<SearchResults> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Search failed');
    }
    
    return data.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getRecommendationsFromQueries = async (queries: string[]): Promise<RecommendationBundle> => {
  const aggregate: RecommendationBundle = {
    songs: [],
    albums: [],
    playlists: [],
  };

  for (const query of queries) {
    if (!query.trim()) continue;
    try {
      const data = await search(query);
      aggregate.songs.push(...((data.songs?.results || []).map(convertGlobalSearchSong)));
      aggregate.albums.push(...((data.albums?.results || []).map(convertGlobalSearchAlbum)));
      aggregate.playlists.push(...((data.playlists?.results || []).map(convertGlobalSearchPlaylist)));
    } catch (error) {
      console.error(`Recommendation query failed for "${query}":`, error);
    }
  }

  const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    const unique: T[] = [];
    items.forEach((item) => {
      if (!item.id || seen.has(item.id)) return;
      seen.add(item.id);
      unique.push(item);
    });
    return unique;
  };

  return {
    songs: uniqueById(aggregate.songs),
    albums: uniqueById(aggregate.albums),
    playlists: uniqueById(aggregate.playlists),
  };
};

// Get home page data using global search
export const getHomeData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=top%20hits`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch home data');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get home data error:', error);
    throw error;
  }
};

// Get song details by ID
export const getSong = async (id: string): Promise<Song> => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs?ids=${id}`);
    const data = await response.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      throw new Error('Song not found');
    }
    
    return convertApiSong(data.data[0]);
  } catch (error) {
    console.error('Get song error:', error);
    throw error;
  }
};

// Get album details
export const getAlbum = async (id: string): Promise<Album> => {
  try {
    const response = await fetch(`${API_BASE_URL}/albums?id=${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Album not found');
    }
    
    return convertApiAlbum(data.data);
  } catch (error) {
    console.error('Get album error:', error);
    throw error;
  }
};

// Get playlist details
export const getPlaylist = async (id: string): Promise<Playlist> => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists?id=${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Playlist not found');
    }
    
    return convertApiPlaylist(data.data);
  } catch (error) {
    console.error('Get playlist error:', error);
    throw error;
  }
};

// Get trending songs using global search with popular query
export const getTrendingSongs = async (): Promise<Song[]> => {
  try {
    // Use global search with multiple popular queries to get more results
    const queries = ['top songs 2024', 'hindi trending songs', 'popular bollywood songs', 'english top hits'];
    const allSongs: Song[] = [];
    
    for (const query of queries) {
      try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const songs = data.data.topQuery?.results?.map(convertGlobalSearchSong) || [];
          const songResults = data.data.songs?.results?.map(convertGlobalSearchSong) || [];
          allSongs.push(...songs, ...songResults);
        }
      } catch (e) {
        console.error(`Error fetching trending songs for query "${query}":`, e);
      }
    }
    
    // Remove duplicates by ID
    const uniqueSongs = allSongs.filter((song, index, self) => 
      index === self.findIndex((s) => s.id === song.id)
    );
    
    return uniqueSongs;
  } catch (error) {
    console.error('Get trending error:', error);
    throw error;
  }
};

// Get album recommendations using global search
export const getAlbumRecommendations = async (): Promise<Album[]> => {
  try {
    // Use multiple queries to get more album results
    const queries = ['new albums 2024', 'latest bollywood albums', 'english new releases', 'top albums'];
    const allAlbums: Album[] = [];
    
    for (const query of queries) {
      try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const albums = data.data.albums?.results?.map(convertGlobalSearchAlbum) || [];
          allAlbums.push(...albums);
        }
      } catch (e) {
        console.error(`Error fetching albums for query "${query}":`, e);
      }
    }
    
    // Remove duplicates by ID
    const uniqueAlbums = allAlbums.filter((album, index, self) => 
      index === self.findIndex((a) => a.id === album.id)
    );
    
    return uniqueAlbums;
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw error;
  }
};

// Get featured playlists using global search
export const getFeaturedPlaylists = async (): Promise<Playlist[]> => {
  try {
    // Use multiple queries to get more playlist results
    const queries = ['best playlists', 'top playlists', 'curated playlists', 'featured playlists'];
    const allPlaylists: Playlist[] = [];
    
    for (const query of queries) {
      try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const playlists = data.data.playlists?.results?.map(convertGlobalSearchPlaylist) || [];
          allPlaylists.push(...playlists);
        }
      } catch (e) {
        console.error(`Error fetching playlists for query "${query}":`, e);
      }
    }
    
    // Remove duplicates by ID
    const uniquePlaylists = allPlaylists.filter((playlist, index, self) => 
      index === self.findIndex((p) => p.id === playlist.id)
    );
    
    return uniquePlaylists;
  } catch (error) {
    console.error('Get playlists error:', error);
    throw error;
  }
};

// Search for artists using global search
export const searchArtists = async (query: string): Promise<GlobalSearchArtist[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to search artists');
    }
    
    return data.data.artists?.results || [];
  } catch (error) {
    console.error('Search artists error:', error);
    throw error;
  }
};

// Artist details type
export interface ArtistDetails {
  id: string;
  name: string;
  url: string;
  type: string;
  followerCount: number;
  fanCount: string;
  isVerified: boolean | null;
  dominantLanguage: string;
  dominantType: string;
  bio: any[];
  image: ApiImage[];
  topSongs: Song[];
  topAlbums: Album[];
  singles: Album[];
  similarArtists: ApiArtist[];
}

// Get artist details
export const getArtist = async (id: string): Promise<ArtistDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/artists?id=${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Artist not found');
    }
    
    const artist = data.data;
    return {
      id: artist.id,
      name: artist.name,
      url: artist.url,
      type: artist.type,
      followerCount: artist.followerCount || 0,
      fanCount: artist.fanCount || '0',
      isVerified: artist.isVerified,
      dominantLanguage: artist.dominantLanguage || '',
      dominantType: artist.dominantType || '',
      bio: artist.bio || [],
      image: artist.image || [],
      topSongs: (artist.topSongs || []).map(convertApiSong),
      topAlbums: (artist.topAlbums || []).map(convertApiAlbum),
      singles: (artist.singles || []).map(convertApiAlbum),
      similarArtists: artist.similarArtists || [],
    };
  } catch (error) {
    console.error('Get artist error:', error);
    throw error;
  }
};
