import { Play, Heart } from 'lucide-react';
import { Album, getImageUrl } from '../services/api';

interface AlbumCardProps {
  album: Album;
  onPlay?: () => void;
  onClick?: () => void;
}

export function AlbumCard({ album, onPlay, onClick }: AlbumCardProps) {
  const coverUrl = getImageUrl(album.image, '500x500');
  
  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:bg-white/10 hover:scale-105"
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      
      <div className="relative">
        {/* Album Cover */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
          <img 
            src={coverUrl} 
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Play button */}
          <button 
            onClick={onPlay}
            className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-red-600/70"
          >
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </button>

          {/* Heart button */}
          <button className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600">
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold text-white mb-1 truncate group-hover:text-red-400 transition-colors">
            {album.name}
          </h3>
          <p className="text-sm text-gray-400 truncate">{album.primaryArtists}</p>
          <p className="text-xs text-gray-500 mt-1">{album.songCount} songs • {album.year}</p>
        </div>
      </div>
    </div>
  );
}
