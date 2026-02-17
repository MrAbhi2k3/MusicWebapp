import { useEffect, useState } from 'react';
import { Disc, Loader2 } from 'lucide-react';
import { AlbumCard } from '../components/AlbumCard';
import { SpiderWeb } from '../components/SpiderWeb';
import { getAlbumRecommendations, getAlbum, Album } from '../services/api';
import { useMusicPlayer } from '../contexts/MusicContext';

export function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAlbumRecommendations();
      setAlbums(data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
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

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 relative">
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-blue-500 opacity-5 pointer-events-none" />
      <SpiderWeb className="absolute bottom-20 left-10 w-48 h-48 text-purple-500 opacity-5 pointer-events-none rotate-45" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Disc className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Albums</h1>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Albums Grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {albums.map((album) => (
            <AlbumCard 
              key={album.id} 
              album={album}
              onPlay={() => handlePlayAlbum(album)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && albums.length === 0 && (
        <div className="text-center py-20">
          <Disc className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No albums found</h3>
          <p className="text-gray-500">No albums available</p>
        </div>
      )}
    </main>
  );
}
