import { Play } from 'lucide-react';
import { Playlist, getImageUrl } from '../services/api';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: () => void;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, onPlay, onClick }: PlaylistCardProps) {
  const coverUrl = getImageUrl(playlist.image, '500x500');
  
  return (
    <div 
      className="group relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:scale-105 overflow-hidden"
      onClick={onClick}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-blue-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

      <div className="relative flex items-center gap-4">
        {/* Cover Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
          <img 
            src={coverUrl} 
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={onPlay}
              className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50"
            >
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1 truncate group-hover:text-red-400 transition-colors">
            {playlist.name}
          </h3>
          <p className="text-sm text-gray-400 truncate mb-1 line-clamp-2">
            {playlist.description || 'Curated playlist'}
          </p>
          <p className="text-xs text-gray-500">{playlist.songCount} tracks</p>
        </div>
      </div>
    </div>
  );
}
