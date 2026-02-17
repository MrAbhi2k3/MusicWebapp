import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Play, Loader2, Heart, MoreHorizontal, Disc, Clock, ListMusic } from 'lucide-react';
import { getPlaylist, Playlist, getImageUrl, formatDuration } from '../services/api';
import { SpiderWeb } from '../components/SpiderWeb';
import { TrackRow } from '../components/TrackRow';
import { useMusicPlayer } from '../contexts/MusicContext';

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    if (id) {
      fetchPlaylist(id);
    }
  }, [id]);

  const fetchPlaylist = async (playlistId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlaylist(playlistId);
      setPlaylist(data);
    } catch (err) {
      console.error('Error fetching playlist:', err);
      setError('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (index: number) => {
    if (playlist?.songs && playlist.songs.length > 0) {
      setQueue(playlist.songs);
      playSong(playlist.songs[index]);
    }
  };

  const handlePlayAll = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      setQueue(playlist.songs);
      playSong(playlist.songs[0]);
    }
  };

  const handleShuffle = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      playSong(shuffled[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Playlist not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-500"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const coverUrl = getImageUrl(playlist.image, '500x500');

  return (
    <main className="flex-1 overflow-y-auto pb-32 relative">
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-purple-500 opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-pink-900/30 to-transparent"></div>
        
        <div className="relative pt-8 px-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <div className="flex items-end gap-8">
            {/* Playlist Cover */}
            <div className="w-52 h-52 rounded-xl overflow-hidden shadow-2xl shadow-purple-600/50 flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <ListMusic className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="pb-4">
              <p className="text-sm text-gray-300 uppercase tracking-wider mb-1">Playlist</p>
              <h1 className="text-4xl font-bold text-white mb-2">{playlist.name}</h1>
              <p className="text-gray-400 mb-1">{playlist.description || 'Curated playlist'}</p>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>{playlist.songCount} songs</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={handlePlayAll}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-purple-600/50"
            >
              <Play className="w-5 h-5" fill="white" />
              Play
            </button>
            <button 
              onClick={handleShuffle}
              className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full text-white font-semibold hover:bg-white/20 transition-colors"
            >
              Shuffle
            </button>
            <button className="p-3 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-8 py-6">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
            {playlist.songs.map((song, index) => (
              <TrackRow 
                key={song.id}
                number={index + 1}
                song={song}
                onPlay={() => handlePlaySong(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No songs available in this playlist</p>
          </div>
        )}
      </div>
    </main>
  );
}

