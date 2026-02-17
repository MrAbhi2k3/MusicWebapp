import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Play, Loader2, Heart, MoreHorizontal, Disc, Clock } from 'lucide-react';
import { getAlbum, Album, getImageUrl, formatDuration } from '../services/api';
import { SpiderWeb } from '../components/SpiderWeb';
import { TrackRow } from '../components/TrackRow';
import { useMusicPlayer } from '../contexts/MusicContext';
import { likeSong, isSongLiked } from '../services/supabase';

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    if (id) {
      fetchAlbum(id);
    }
  }, [id]);

  const fetchAlbum = async (albumId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAlbum(albumId);
      setAlbum(data);
    } catch (err) {
      console.error('Error fetching album:', err);
      setError('Failed to load album');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (index: number) => {
    if (album?.songs && album.songs.length > 0) {
      setQueue(album.songs);
      playSong(album.songs[index]);
    }
  };

  const handlePlayAll = () => {
    if (album?.songs && album.songs.length > 0) {
      setQueue(album.songs);
      playSong(album.songs[0]);
    }
  };

  const handleShuffle = () => {
    if (album?.songs && album.songs.length > 0) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
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

  if (error || !album) {
    return (
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Album not found'}</p>
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

  const coverUrl = getImageUrl(album.image, '500x500');

  return (
    <main className="flex-1 overflow-y-auto pb-32 relative">
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-red-500 opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-purple-900/30 to-transparent"></div>
        
        <div className="relative pt-8 px-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <div className="flex items-end gap-8">
            {/* Album Cover */}
            <div className="w-52 h-52 rounded-xl overflow-hidden shadow-2xl shadow-blue-600/50 flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt={album.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Disc className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Album Info */}
            <div className="pb-4">
              <p className="text-sm text-gray-300 uppercase tracking-wider mb-1">Album</p>
              <h1 className="text-4xl font-bold text-white mb-2">{album.name}</h1>
              <p className="text-gray-400 mb-1">{album.primaryArtists}</p>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>{album.year}</span>
                <span>•</span>
                <span>{album.songCount} songs</span>
                <span>•</span>
                <span>{album.songs?.[0]?.language || 'Music'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={handlePlayAll}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-blue-600/50"
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
        {album.songs && album.songs.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
            {album.songs.map((song, index) => (
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
            <p className="text-gray-400">No songs available in this album</p>
          </div>
        )}
      </div>
    </main>
  );
}

