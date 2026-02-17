import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search as SearchIcon, Music, Disc, ListMusic, Loader2, User, X, Trash2 } from 'lucide-react';
import { search, SearchResults, Album, Song, Playlist, decodeHtmlEntities, getAlbum, getSong, GlobalSearchSong, GlobalSearchAlbum, GlobalSearchPlaylist } from '../services/api';
import { AlbumCard } from '../components/AlbumCard';
import { TrackRow } from '../components/TrackRow';
import { PlaylistCard } from '../components/PlaylistCard';
import { SpiderWeb } from '../components/SpiderWeb';
import { useMusicPlayer } from '../contexts/MusicContext';
import { ArtistCard } from '../components/ArtistCard';
import { addSearchToHistory, clearSearchHistory, getSearchHistory, removeSearchHistoryItem } from '../services/personalization';
import { saveSearchHistory } from '../services/supabase';

// Helper to convert GlobalSearchSong to Song
const toSong = (apiSong: GlobalSearchSong): Song => ({
  id: apiSong.id,
  name: decodeHtmlEntities(apiSong.title || ''),
  album: { 
    id: '', 
    name: decodeHtmlEntities(apiSong.album || ''), 
    url: apiSong.url || '' 
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
});

// Helper to convert GlobalSearchAlbum to Album
const toAlbum = (apiAlbum: GlobalSearchAlbum): Album => ({
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
});

// Helper to convert GlobalSearchPlaylist to Playlist
const toPlaylist = (apiPlaylist: GlobalSearchPlaylist): Playlist => ({
  id: apiPlaylist.id,
  name: decodeHtmlEntities(apiPlaylist.title || ''),
  description: decodeHtmlEntities(apiPlaylist.description || ''),
  year: '',
  songCount: 0,
  url: apiPlaylist.url || '',
  image: apiPlaylist.image || [],
  songs: [],
});

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'playlists' | 'artists'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    setRecentSearches(getSearchHistory().map((item) => item.query).slice(0, 8));
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const data = await search(query);
      setResults(data);
      addSearchToHistory(query);
      saveSearchHistory(query).catch((error) => {
        console.error('Failed to sync search history:', error);
      });
      setRecentSearches(getSearchHistory().map((item) => item.query).slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handlePlayAlbum = async (album: Album) => {
    try {
      const fullAlbum = await getAlbum(album.id);
      if (fullAlbum.songs && fullAlbum.songs.length > 0) {
        setQueue(fullAlbum.songs);
        playSong(fullAlbum.songs[0]);
      }
    } catch (error) {
      console.error('Error playing album:', error);
    }
  };

  const handleSongClick = async (song: GlobalSearchSong) => {
    try {
      const fullSong = await getSong(song.id);
      const allSongs = await Promise.all(
        (results?.songs.results || []).slice(0, 10).map(async (item) => {
          try {
            return await getSong(item.id);
          } catch {
            return toSong(item);
          }
        })
      );
      setQueue(allSongs);
      playSong(fullSong);
    } catch (error) {
      console.error('Error playing song:', error);
      const convertedSong = toSong(song);
      setQueue((results?.songs.results || []).map(toSong));
      playSong(convertedSong);
    }
  };

  const handleAlbumClick = (album: GlobalSearchAlbum) => {
    navigate(`/albums/${album.id}`);
  };

  const handlePlaylistClick = (playlist: GlobalSearchPlaylist) => {
    navigate(`/playlists/${playlist.id}`);
  };

  const tabs = [
    { id: 'all', label: 'All', icon: SearchIcon },
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
  ];

  const showSongs = activeTab === 'all' || activeTab === 'songs';
  const showAlbums = activeTab === 'all' || activeTab === 'albums';
  const showArtists = activeTab === 'all' || activeTab === 'artists';
  const showPlaylists = activeTab === 'all' || activeTab === 'playlists';

  // Convert results to Song arrays for playback
  return (
    <main className="flex-1 overflow-y-auto p-8 pb-32 relative">
      <SpiderWeb className="absolute top-20 right-20 w-72 h-72 text-red-500 opacity-5 pointer-events-none" />

      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
        
        <form onSubmit={handleSearch} className="max-w-3xl">
          <div className="relative group">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-red-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-white/10 border-2 border-gray-700/50 rounded-2xl pl-16 pr-6 py-4 text-white text-lg placeholder-gray-400 
                       focus:outline-none focus:border-red-500/50 focus:bg-white/15 transition-all duration-300
                       hover:bg-white/12"
            />
          </div>
        </form>

        {!results && recentSearches.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm uppercase tracking-wider text-gray-400">Recent Searches</h2>
              <button
                onClick={() => {
                  clearSearchHistory();
                  setRecentSearches([]);
                }}
                className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <div key={item} className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300">
                  <button
                    onClick={() => {
                      setSearchQuery(item);
                      setSearchParams({ q: item });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {item}
                  </button>
                  <button
                    onClick={() => {
                      removeSearchHistoryItem(item);
                      setRecentSearches(getSearchHistory().map((h) => h.query).slice(0, 8));
                    }}
                    className="text-gray-400 hover:text-red-300 transition-colors"
                    title="Delete search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {results && (
          <div className="flex gap-3 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-10">
          {/* Songs */}
          {showSongs && results.songs?.results?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Music className="w-6 h-6 text-red-500" />
                Songs
              </h2>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
                {results.songs.results.slice(0, 10).map((song, index) => (
                  <TrackRow
                    key={song.id}
                    number={index + 1}
                    song={toSong(song)}
                    onPlay={() => handleSongClick(song)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {showAlbums && results.albums?.results?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Disc className="w-6 h-6 text-blue-500" />
                Albums
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.albums.results.slice(0, 12).map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={toAlbum(album)}
                    onPlay={() => handlePlayAlbum(toAlbum(album))}
                    onClick={() => handleAlbumClick(album)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {showArtists && results.artists?.results?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <User className="w-6 h-6 text-purple-500" />
                Artists
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {results.artists.results.slice(0, 10).map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onClick={() => navigate(`/artists/${artist.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {showPlaylists && results.playlists?.results?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <ListMusic className="w-6 h-6 text-purple-500" />
                Playlists
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.playlists.results.slice(0, 9).map((playlist) => (
                  <PlaylistCard 
                    key={playlist.id} 
                    playlist={toPlaylist(playlist)}
                    onClick={() => handlePlaylistClick(playlist)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && results && 
       !results.songs?.results?.length && 
       !results.albums?.results?.length && 
       !results.artists?.results?.length &&
       !results.playlists?.results?.length && (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No results found</h3>
          <p className="text-gray-500">Try searching with different keywords</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !results && (
        <div className="text-center py-20">
          <SearchIcon className="w-20 h-20 text-gray-700 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-400 mb-2">Start searching</h3>
          <p className="text-gray-500">Find your favorite songs, albums, and playlists</p>
        </div>
      )}
    </main>
  );
}
