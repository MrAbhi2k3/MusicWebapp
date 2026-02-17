import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Play, Loader2, Music, Disc } from 'lucide-react';
import { getArtist, ArtistDetails, getImageUrl, formatDuration, Song } from '../services/api';
import { TrackRow } from '../components/TrackRow';
import { AlbumCard } from '../components/AlbumCard';
import { SpiderWeb } from '../components/SpiderWeb';
import { useMusicPlayer } from '../contexts/MusicContext';

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<ArtistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    if (id) {
      fetchArtist(id);
    }
  }, [id]);

  const fetchArtist = async (artistId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArtist(artistId);
      setArtist(data);
    } catch (err) {
      console.error('Error fetching artist:', err);
      setError('Failed to load artist details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    if (artist?.topSongs) {
      setQueue(artist.topSongs);
      playSong(song);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Artist not found'}</p>
          <button 
            onClick={() => navigate('/artists')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-500"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const coverUrl = getImageUrl(artist.image, '500x500');

  return (
    <main className="flex-1 overflow-y-auto pb-32 relative">
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-purple-500 opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-red-900/30 to-transparent"></div>
        
        <div className="relative pt-8 px-8">
          <button 
            onClick={() => navigate('/artists')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Artists</span>
          </button>

          <div className="flex items-end gap-8">
            {/* Artist Image */}
            <div className="w-52 h-52 rounded-full overflow-hidden shadow-2xl shadow-purple-600/50 flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">{artist.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="pb-4">
              <p className="text-sm text-gray-300 uppercase tracking-wider mb-1">Artist</p>
              <h1 className="text-5xl font-bold text-white mb-2">{artist.name}</h1>
              <p className="text-gray-400">{artist.followerCount.toLocaleString()} followers</p>
            </div>
          </div>

          {/* Play All Button */}
          {artist.topSongs && artist.topSongs.length > 0 && (
            <div className="mt-8 flex items-center gap-4">
              <button 
                onClick={() => handlePlaySong(artist.topSongs[0])}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-red-600/50"
              >
                <Play className="w-5 h-5" fill="white" />
                Play All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 mt-8">
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('songs')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'songs' 
                ? 'border-red-500 text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-5 h-5" />
            Top Songs
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'albums' 
                ? 'border-red-500 text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Disc className="w-5 h-5" />
            Albums
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {activeTab === 'songs' && (
          <>
            {artist.topSongs && artist.topSongs.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
                {artist.topSongs.map((song, index) => (
                  <TrackRow
                    key={song.id}
                    number={index + 1}
                    song={song}
                    onPlay={() => handlePlaySong(song)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No songs available
              </div>
            )}
          </>
        )}

        {activeTab === 'albums' && (
          <>
            {artist.topAlbums && artist.topAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {artist.topAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onPlay={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No albums available
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

