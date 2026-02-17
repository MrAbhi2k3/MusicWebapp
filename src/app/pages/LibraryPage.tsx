import { useEffect, useMemo, useState } from 'react';
import { Music, Disc, Heart, Clock, Trash2 } from 'lucide-react';
import { SpiderWeb } from '../components/SpiderWeb';
import { getPlayHistory, getSearchHistory, getTopGenresFromHistory, removeSongFromPlayHistory } from '../services/personalization';
import { TrackRow } from '../components/TrackRow';
import { useMusicPlayer } from '../contexts/MusicContext';
import { Song } from '../services/api';

export function LibraryPage() {
  const [history, setHistory] = useState<Song[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const { setQueue, playSong } = useMusicPlayer();

  useEffect(() => {
    const playHistory = getPlayHistory();
    setHistory(playHistory);
    setSearchCount(getSearchHistory().length);
  }, []);

  const genres = useMemo(() => getTopGenresFromHistory(5), [history]);

  const handleRemoveHistory = (songId: string) => {
    removeSongFromPlayHistory(songId);
    setHistory(getPlayHistory());
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 relative">
      <SpiderWeb className="absolute top-10 left-10 w-56 h-56 text-blue-500 opacity-5 pointer-events-none rotate-12" />
      
      <h1 className="text-3xl font-bold text-white mb-8">Your Library</h1>

      {/* Library Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 hover:scale-105 transition-transform cursor-pointer group">
          <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-red-600/50 transition-shadow">
            <Heart className="w-7 h-7 text-white" fill="white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Liked Songs</h3>
          <p className="text-gray-400 text-sm">{history.length} tracked plays</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:scale-105 transition-transform cursor-pointer group">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blue-600/50 transition-shadow">
            <Disc className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Albums</h3>
          <p className="text-gray-400 text-sm">{genres.length} preferred genres</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:scale-105 transition-transform cursor-pointer group">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-600/50 transition-shadow">
            <Music className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Artists</h3>
          <p className="text-gray-400 text-sm">Personalized from your plays</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 hover:scale-105 transition-transform cursor-pointer group">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-green-600/50 transition-shadow">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Recently Played</h3>
          <p className="text-gray-400 text-sm">{history.slice(0, 10).length} tracks</p>
        </div>
      </div>

      {genres.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Top Genre Signals</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-200 text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-3">Searches saved: {searchCount}</p>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your library is empty</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start playing songs to build your history and personalized recommendations.
          </p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-2">
          {history.slice(0, 12).map((song, index) => (
            <TrackRow
              key={`${song.id}-${index}`}
              number={index + 1}
              song={song}
              onPlay={() => {
                setQueue(history);
                playSong(song);
              }}
              trailingAction={
                <button
                  onClick={() => handleRemoveHistory(song.id)}
                  className="p-2 hover:bg-red-500/20 rounded-full transition-all"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4 text-red-300 hover:text-red-200" />
                </button>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
