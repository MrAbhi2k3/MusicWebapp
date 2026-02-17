import { Play, MoreHorizontal } from 'lucide-react';
import { Song, getImageUrl, formatDuration } from '../services/api';
import type { ReactNode } from 'react';

interface TrackRowProps {
  number: number;
  song: Song;
  onPlay: () => void;
  onClick?: () => void;
  trailingAction?: ReactNode;
}

export function TrackRow({ number, song, onPlay, onClick, trailingAction }: TrackRowProps) {
  const coverUrl = getImageUrl(song.image, '150x150');
  
  return (
    <div 
      className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-500/30"
      onClick={() => (onClick ? onClick() : onPlay())}
    >
      {/* Number / Play Button */}
      <div className="w-8 flex items-center justify-center">
        <span className="text-gray-400 group-hover:hidden">{number}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="hidden group-hover:flex items-center justify-center w-8 h-8 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
        >
          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
        </button>
      </div>

      {/* Album Cover */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <img src={coverUrl} alt={song.name} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
          {song.name}
        </h4>
        <p className="text-sm text-gray-400 truncate">{song.primaryArtists}</p>
      </div>

      {/* Album */}
      <div className="hidden lg:block flex-1 min-w-0">
        <p className="text-sm text-gray-400 truncate">{song.album.name}</p>
      </div>

      {/* Duration */}
      <div className="text-sm text-gray-400 w-16 text-right">
        {formatDuration(song.duration)}
      </div>

      {/* More Options */}
      {trailingAction ? (
        <div
          className="opacity-0 group-hover:opacity-100 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {trailingAction}
        </div>
      ) : (
        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all">
          <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        </button>
      )}
    </div>
  );
}
