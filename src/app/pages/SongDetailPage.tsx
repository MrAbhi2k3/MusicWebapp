import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Play, Loader2, Heart, MoreHorizontal, Disc, Clock } from 'lucide-react';
import { getSong, getAlbum, Song, Album, getImageUrl, getAudioUrl, formatDuration } from '../services/api';
import { SpiderWeb } from '../components/SpiderWeb';
import { useMusicPlayer } from '../contexts/MusicContext';
import { likeSong, isSongLiked } from '../services/supabase';

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    if (id) {
      fetchSong(id);
      checkIfLiked(id);
    }
  }, [id]);

  const fetchSong = async (songId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSong(songId);
      setSong(data);
      
      // Fetch album details if album id exists
      if (data.album?.id) {
        const albumData = await getAlbum(data.album.id);
        setAlbum(albumData);
      }
    } catch (err) {
      console.error('Error fetching song:', err);
      setError('Failed to load song details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async (songId: string) => {
    try {
      const liked = await isSongLiked(songId);
      setIsLiked(liked);
    } catch (err) {
      console.error('Error checking liked status:', err);
    }
  };

  const handlePlay = () => {
    if (song) {
      playSong(song);
    }
  };

  const handleLike = async () => {
    if (!song) return;
    
    try {
      if (isLiked) {
        // Unlike - would need unlikeSong function
        setIsLiked(false);
      } else {
        await likeSong({
          id: song.id,
          name: song.name,
          artist: song.primaryArtists,
          image: getImageUrl(song.image),
          url: getAudioUrl(song.downloadUrl),
          duration: song.duration,
        });
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Error liking song:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error || !song) {
    return (
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Song not found'}</p>
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

  const coverUrl = getImageUrl(song.image, '500x500');

  return (
    <main className="flex-1 overflow-y-auto pb-32 relative">
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-red-500 opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/50 via-purple-900/30 to-transparent"></div>
        
        <div className="relative pt-8 px-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <div className="flex items-end gap-8">
            {/* Song Cover */}
            <div className="w-52 h-52 rounded-xl overflow-hidden shadow-2xl shadow-red-600/50 flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt={song.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                  <Disc className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="pb-4">
              <p className="text-sm text-gray-300 uppercase tracking-wider mb-1">Song</p>
              <h1 className="text-4xl font-bold text-white mb-2">{song.name}</h1>
              <p className="text-gray-400 mb-1">{song.primaryArtists}</p>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>{song.year}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(song.duration)}
                </span>
                <span>•</span>
                <span>{song.language}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={handlePlay}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-red-600/50"
            >
              <Play className="w-5 h-5" fill="white" />
              Play
            </button>
            <button 
              onClick={handleLike}
              className={`p-3 rounded-full transition-colors ${
                isLiked 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-6 h-6" fill={isLiked ? 'white' : 'none'} />
            </button>
            <button className="p-3 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Song Details */}
      <div className="px-8 py-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Album</p>
              <p 
                className="text-white cursor-pointer hover:text-red-400 transition-colors"
                onClick={() => album && navigate(`/albums/${album.id}`)}
              >
                {song.album.name || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Artists</p>
              <p className="text-white">{song.primaryArtists || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Released</p>
              <p className="text-white">{song.year || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-white">{formatDuration(song.duration)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Language</p>
              <p className="text-white capitalize">{song.language || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Label</p>
              <p className="text-white">{song.label || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Album Songs if available */}
        {album && album.songs && album.songs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-white mb-4">More from {album.name}</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
              {album.songs.slice(0, 5).map((s, index) => (
                <div 
                  key={s.id}
                  onClick={() => navigate(`/songs/${s.id}`)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="text-gray-400 w-6">{index + 1}</span>
                  <div className="w-10 h-10 rounded overflow-hidden">
                    {s.image?.[0] && (
                      <img src={s.image[0].url} alt={s.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-white truncate ${s.id === song.id ? 'text-red-400' : ''}`}>
                      {s.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">{s.primaryArtists}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatDuration(s.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

