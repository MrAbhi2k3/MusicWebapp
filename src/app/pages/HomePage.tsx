import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlbumCard } from '../components/AlbumCard';
import { TrackRow } from '../components/TrackRow';
import { PlaylistCard } from '../components/PlaylistCard';
import { SpiderWeb } from '../components/SpiderWeb';
import { TrendingUp, Loader2, History, Sparkles, X } from 'lucide-react';
import { Album, Song, Playlist, decodeHtmlEntities, getAlbumRecommendations, getTrendingSongs, getFeaturedPlaylists, getAlbum, getSong, getRecommendationsFromQueries } from '../services/api';
import { useMusicPlayer } from '../contexts/MusicContext';
import {
  dedupeRecommendationBundle,
  getGenreRecommendationQueries,
  getPlayHistory,
  getSearchRecommendationQueries,
} from '../services/personalization';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { AppTheme, getSavedSettings } from '../services/settings';
import battyLogo from '../components/figma/batty.png';
import spideyLogo from '../components/figma/spidey.png';

export function HomePage() {
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [genreRecommendations, setGenreRecommendations] = useState<Song[]>([]);
  const [languageRecommendations, setLanguageRecommendations] = useState<Song[]>([]);
  const [searchRecommendations, setSearchRecommendations] = useState<Album[]>([]);
  const [profileName, setProfileName] = useState('Hero');
  const [theme, setTheme] = useState<AppTheme>(getSavedSettings().theme);
  const [showHero, setShowHero] = useState(() => localStorage.getItem('spiderbeats_hero_hidden') !== '1');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [albums, songs, lists] = await Promise.all([
          getAlbumRecommendations(),
          getTrendingSongs(),
          getFeaturedPlaylists()
        ]);

        setFeaturedAlbums(albums);
        setTrendingSongs(songs);
        setPlaylists(lists);
        setRecentlyPlayed(getPlayHistory().slice(0, 8));

        const languageQueries = (getSavedSettings().preferredLanguages || [])
          .slice(0, 6)
          .map((language) => `${language} top songs`);

        const [genreBundle, searchBundle, languageBundle] = await Promise.all([
          getRecommendationsFromQueries(getGenreRecommendationQueries()),
          getRecommendationsFromQueries(getSearchRecommendationQueries()),
          getRecommendationsFromQueries(languageQueries),
        ]);

        const dedupedGenreBundle = dedupeRecommendationBundle(genreBundle);
        const dedupedSearchBundle = dedupeRecommendationBundle(searchBundle);
        const dedupedLanguageBundle = dedupeRecommendationBundle(languageBundle);

        setGenreRecommendations(dedupedGenreBundle.songs.slice(0, 10));
        setLanguageRecommendations(dedupedLanguageBundle.songs.slice(0, 10));
        setSearchRecommendations(dedupedSearchBundle.albums.slice(0, 8));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const syncTheme = () => setTheme(getSavedSettings().theme);
    window.addEventListener('spiderbeats:settings-updated', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('spiderbeats:settings-updated', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const fullName = session?.user?.user_metadata?.full_name || '';
      setProfileName(decodeHtmlEntities(fullName || session?.user?.email?.split('@')[0] || 'Hero'));
    });
  }, []);

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

const handlePlaySong = async (song: Song) => {
    try {
      // Check if song has downloadUrl, if not fetch full song details
      if (!song.downloadUrl || song.downloadUrl.length === 0) {
        const fullSong = await getSong(song.id);
        const resolvedQueue = await Promise.all(
          trendingSongs.map(async (track) => {
            if (track.downloadUrl && track.downloadUrl.length > 0) return track;
            if (track.id === song.id) return fullSong;
            try {
              return await getSong(track.id);
            } catch {
              return track;
            }
          })
        );
        setQueue(resolvedQueue);
        playSong(fullSong);
      } else {
        setQueue(trendingSongs);
        playSong(song);
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8 pb-32 relative">
      {/* Spider web decorations */}
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-blue-500 opacity-5 pointer-events-none" />
      <SpiderWeb className="absolute bottom-20 left-10 w-48 h-48 text-red-500 opacity-5 pointer-events-none rotate-45" />

      {/* Hero Banner */}
      {showHero && (
      <div className={`relative rounded-3xl p-8 mb-8 overflow-hidden border ${
        theme === 'classic'
          ? 'bg-gradient-to-br from-amber-600/25 via-yellow-500/15 to-black border-amber-500/40'
          : 'bg-gradient-to-br from-red-600/30 via-purple-600/20 to-blue-600/30 border-red-500/30'
      }`}>
        {/* Animated web pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            theme === 'classic'
              ? `radial-gradient(circle at 20% 50%, transparent 10%, #fbbf24 11%, transparent 12%),
                 radial-gradient(circle at 80% 80%, transparent 10%, #f59e0b 11%, transparent 12%),
                 radial-gradient(circle at 40% 20%, transparent 10%, #facc15 11%, transparent 12%)`
              : `radial-gradient(circle at 20% 50%, transparent 10%, #00D4FF 11%, transparent 12%),
                 radial-gradient(circle at 80% 80%, transparent 10%, #DC143C 11%, transparent 12%),
                 radial-gradient(circle at 40% 20%, transparent 10%, #00D4FF 11%, transparent 12%)`,
          backgroundSize: '200px 200px',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        
        {/* Glowing orbs */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${theme === 'classic' ? 'bg-amber-500/20' : 'bg-red-500/20'}`}></div>
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${theme === 'classic' ? 'bg-yellow-500/15' : 'bg-blue-500/20'}`}></div>

        <button
          onClick={() => {
            setShowHero(false);
            localStorage.setItem('spiderbeats_hero_hidden', '1');
          }}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white"
          title="Close hero banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex items-center gap-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${
            theme === 'classic'
              ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-500/40'
              : 'bg-gradient-to-br from-red-600 to-blue-600 shadow-red-600/50'
          }`}>
            <img
              src={theme === 'classic' ? battyLogo : spideyLogo}
              alt="Theme Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome Back, {profileName}
            </h1>
            <p className="text-gray-300 text-lg">
              {theme === 'classic'
                ? 'Ready to rule the night with your beats?'
                : 'Ready to swing into your favorite beats?'}
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Trending Tracks */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-red-600 to-transparent rounded-full"></div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
          {trendingSongs.map((song, index) => (
            <TrackRow 
              key={song.id} 
              number={index + 1} 
              song={song}
              onPlay={() => handlePlaySong(song)}
              onClick={() => handlePlaySong(song)}
            />
          ))}
        </div>
      </section>

      {/* Featured Albums */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Albums</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {featuredAlbums.map((album) => (
            <AlbumCard 
              key={album.id} 
              album={album}
              onPlay={() => handlePlayAlbum(album)}
              onClick={() => navigate(`/albums/${album.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Recently Played</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
            {recentlyPlayed.map((song, index) => (
              <TrackRow
                key={`${song.id}-${index}`}
                number={index + 1}
                song={song}
                onPlay={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Genre Recommendations */}
      {genreRecommendations.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Genre Picks For You</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500 to-transparent rounded-full"></div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
            {genreRecommendations.map((song, index) => (
              <TrackRow
                key={`${song.id}-genre-${index}`}
                number={index + 1}
                song={song}
                onPlay={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Language Recommendations */}
      {languageRecommendations.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Based On Your Languages</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
            {languageRecommendations.map((song, index) => (
              <TrackRow
                key={`${song.id}-language-${index}`}
                number={index + 1}
                song={song}
                onPlay={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search-Based Recommendations */}
      {searchRecommendations.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-fuchsia-400" />
            <h2 className="text-2xl font-bold text-white">Based On Your Searches</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-fuchsia-500 to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {searchRecommendations.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onPlay={() => handlePlayAlbum(album)}
                onClick={() => navigate(`/albums/${album.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Curated Playlists */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Made For You</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
