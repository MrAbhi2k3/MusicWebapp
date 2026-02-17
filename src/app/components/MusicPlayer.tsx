import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Maximize2, Minimize2, Shuffle, Repeat, Repeat1, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMusicPlayer } from '../contexts/MusicContext';
import { decodeHtmlEntities, getImageUrl, getAudioUrl, formatDuration } from '../services/api';
import { getSavedSettings, type AppTheme } from '../services/settings';
import { toast } from 'sonner';

export function MusicPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    progress, 
    duration,
    shuffle,
    repeatMode,
    togglePlay, 
    setVolume, 
    seekTo,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeatMode,
  } = useMusicPlayer();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [theme, setTheme] = useState<AppTheme>(getSavedSettings().theme);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const syncTheme = () => setTheme(getSavedSettings().theme);
    window.addEventListener('spiderbeats:settings-updated', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('spiderbeats:settings-updated', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  if (!currentSong) {
    return null;
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const coverImage = getImageUrl(currentSong.image, '150x150');
  const preferredDownloadQuality = getSavedSettings().downloadQuality;
  const audioUrl = getAudioUrl(currentSong.downloadUrl, preferredDownloadQuality);

  const fileSafe = (value: string) => value.replace(/[\\/:*?"<>|]/g, '').trim();
  const downloadFileName = `${fileSafe(decodeHtmlEntities(currentSong.name))} - ${fileSafe(
    decodeHtmlEntities(currentSong.primaryArtists || 'Unknown Artist')
  )}.mp3`;
  const accent = theme === 'classic' ? 'amber' : 'red';
  const accentGradientClass =
    theme === 'classic'
      ? 'from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500'
      : 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600';
  const accentRingClass = theme === 'classic' ? 'border-amber-500/30' : 'border-red-600/30';

  if (isMinimized || isMobile) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t px-4 py-2 z-50 ${accentRingClass}`}>
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={coverImage} alt={currentSong.name} className="w-10 h-10 rounded-md object-cover" />
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{currentSong.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentSong.primaryArtists}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${accentGradientClass}`}>
              {isPlaying ? <Pause className="w-5 h-5 text-white" fill="white" /> : <Play className="w-5 h-5 text-white ml-0.5" fill="white" />}
            </button>
            {!isMobile && (
              <button onClick={() => setIsMinimized(false)} className="p-2 text-gray-300 hover:text-white">
                <Maximize2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t px-3 md:px-6 py-3 md:py-4 z-50 ${accentRingClass}`}>
      {/* Web pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 10% 50%, transparent 20%, #00D4FF 21%, transparent 22%),
                          radial-gradient(circle at 90% 50%, transparent 20%, #DC143C 21%, transparent 22%)`,
        backgroundSize: '100px 100px'
      }}></div>

      <div className="relative z-10 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-6">
          {/* Current Track Info */}
          <div className="hidden md:flex items-center gap-4 w-80">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative group">
              <img 
                src={coverImage} 
                alt={currentSong.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate">{currentSong.name}</h4>
              <p className="text-sm text-gray-400 truncate">{currentSong.primaryArtists}</p>
            </div>

            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-white/10 rounded-full transition-all group"
            >
              <Heart 
                className={`w-6 h-6 transition-all ${
                  isLiked
                    ? theme === 'classic'
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-red-500 fill-red-500'
                    : theme === 'classic'
                      ? 'text-gray-400 group-hover:text-amber-300'
                      : 'text-gray-400 group-hover:text-red-400'
                }`}
              />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              <button onClick={toggleShuffle} className="p-2 text-gray-400 hover:text-white transition-colors">
                <Shuffle className={`w-5 h-5 ${shuffle ? (theme === 'classic' ? 'text-amber-400' : 'text-red-400') : ''}`} />
              </button>

              <button 
                onClick={playPrevious}
                className="p-2 text-gray-400 hover:text-white transition-colors hover:scale-110"
              >
                <SkipBack className="w-6 h-6" fill="currentColor" />
              </button>

              <button 
                onClick={togglePlay}
                className={`w-14 h-14 bg-gradient-to-br rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${accentGradientClass} ${theme === 'classic' ? 'shadow-amber-500/50 hover:shadow-amber-500/70' : 'shadow-red-600/50 hover:shadow-red-600/70'}`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" fill="white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                )}
              </button>

              <button 
                onClick={playNext}
                className="p-2 text-gray-400 hover:text-white transition-colors hover:scale-110"
              >
                <SkipForward className="w-6 h-6" fill="currentColor" />
              </button>

              <button onClick={cycleRepeatMode} className="p-2 text-gray-400 hover:text-white transition-colors">
                {repeatMode === 'one' ? (
                  <Repeat1 className={`w-5 h-5 ${theme === 'classic' ? 'text-amber-400' : 'text-red-400'}`} />
                ) : (
                  <Repeat className={`w-5 h-5 ${repeatMode === 'all' ? (theme === 'classic' ? 'text-amber-400' : 'text-red-400') : ''}`} />
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl flex items-center gap-3">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatDuration(progress)}
              </span>
              
              <div className="flex-1 group">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={progress}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                           [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-red-600/50
                           [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100
                           [&::-webkit-slider-thumb]:transition-opacity
                           [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                           [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
                           [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-red-600/50
                           relative"
                  style={{
                    background:
                      accent === 'amber'
                        ? `linear-gradient(to right, #f59e0b 0%, #f59e0b ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`
                        : `linear-gradient(to right, #DC143C 0%, #DC143C ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`
                  }}
                />
              </div>

              <span className="text-xs text-gray-400 w-10">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-3 w-40">
            <Volume2 className="w-6 h-6 text-gray-400" />
            <div className="flex-1 group">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                         [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-600/50
                         [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100
                         [&::-webkit-slider-thumb]:transition-opacity
                         [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                         [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-blue-600/50"
                style={{
                  background: `linear-gradient(to right, #00A3FF 0%, #00A3FF ${volume}%, #374151 ${volume}%, #374151 100%)`
                }}
              />
            </div>
            {audioUrl && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(audioUrl);
                    if (!response.ok) {
                      throw new Error('Download failed');
                    }
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = objectUrl;
                    a.download = downloadFileName;
                    a.click();
                    URL.revokeObjectURL(objectUrl);
                    toast.success(`Downloading ${downloadFileName}`);
                  } catch (error) {
                    console.error('Download error:', error);
                    toast.error('Unable to download this track right now');
                  }
                }}
                className="p-2 text-gray-400 hover:text-white"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setIsMinimized(true)} className="p-2 text-gray-400 hover:text-white" title="Minimize player">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
