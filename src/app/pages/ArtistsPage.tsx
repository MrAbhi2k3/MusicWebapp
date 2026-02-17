import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Loader2 } from 'lucide-react';
import { ArtistCard } from '../components/ArtistCard';
import { SpiderWeb } from '../components/SpiderWeb';
import { search, GlobalSearchArtist } from '../services/api';

export function ArtistsPage() {
  const [artists, setArtists] = useState<GlobalSearchArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const queries = ['popular singers', 'top artists', 'bollywood artists', 'indie artists', 'global artists'];
      const allArtists: GlobalSearchArtist[] = [];

      for (const query of queries) {
        try {
          const data = await search(query);
          allArtists.push(...(data.artists?.results || []));
        } catch (e) {
          console.error(`Error fetching artists for "${query}":`, e);
        }
      }

      const unique = allArtists.filter(
        (artist, index, self) => index === self.findIndex((a) => a.id === artist.id)
      );
      setArtists(unique);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 relative">
      <SpiderWeb className="absolute top-10 right-10 w-64 h-64 text-purple-500 opacity-5 pointer-events-none" />
      <SpiderWeb className="absolute bottom-20 left-10 w-48 h-48 text-pink-500 opacity-5 pointer-events-none rotate-45" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Artists</h1>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Artists Grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {artists.map((artist) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist}
              onClick={() => navigate(`/artists/${artist.id}`)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && artists.length === 0 && (
        <div className="text-center py-20">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No artists found</h3>
          <p className="text-gray-500">No artists available</p>
        </div>
      )}
    </main>
  );
}
