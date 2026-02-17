import { Play } from 'lucide-react';
import { GlobalSearchArtist, decodeHtmlEntities, getImageUrl } from '../services/api';

interface ArtistCardProps {
  artist: GlobalSearchArtist;
  onClick?: () => void;
  onPlay?: () => void;
}

export function ArtistCard({ artist, onClick, onPlay }: ArtistCardProps) {
  const imageUrl = getImageUrl(artist.image, '500x500');
  const artistName = decodeHtmlEntities(artist.title || '');
  
  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:scale-105"
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      
      <div className="relative">
        {/* Artist Image */}
        <div className="relative aspect-square rounded-full overflow-hidden mb-4">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={artist.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {artistName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/50 transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="font-semibold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
            {artistName}
          </h3>
          <p className="text-sm text-gray-400 capitalize">{artist.type || 'Artist'}</p>
        </div>
      </div>
    </div>
  );
}
