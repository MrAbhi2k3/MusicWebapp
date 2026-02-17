import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song, getAudioUrl } from '../services/api';
import { addSongToPlayHistory } from '../services/personalization';
import { savePlayHistory } from '../services/supabase';
import { getSavedSettings } from '../services/settings';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playSong: (song: Song) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (progress: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const PLAYER_STATE_KEY = 'spiderbeats_player_state';

interface PersistedPlayerState {
  currentSong: Song | null;
  queue: Song[];
  volume: number;
  progress: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

const getPersistedPlayerState = (): PersistedPlayerState => {
  try {
    const raw = localStorage.getItem(PLAYER_STATE_KEY);
    if (!raw) {
      return {
        currentSong: null,
        queue: [],
        volume: 70,
        progress: 0,
        shuffle: false,
        repeatMode: 'off',
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedPlayerState>;
    return {
      currentSong: parsed.currentSong || null,
      queue: parsed.queue || [],
      volume: typeof parsed.volume === 'number' ? parsed.volume : 70,
      progress: typeof parsed.progress === 'number' ? parsed.progress : 0,
      shuffle: Boolean(parsed.shuffle),
      repeatMode: parsed.repeatMode === 'all' || parsed.repeatMode === 'one' ? parsed.repeatMode : 'off',
    };
  } catch {
    return {
      currentSong: null,
      queue: [],
      volume: 70,
      progress: 0,
      shuffle: false,
      repeatMode: 'off',
    };
  }
};

export const useMusicPlayer = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const persisted = getPersistedPlayerState();
  const [currentSong, setCurrentSong] = useState<Song | null>(persisted.currentSong);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(persisted.volume);
  const [progress, setProgress] = useState(persisted.progress);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>(persisted.queue);
  const [shuffle, setShuffle] = useState(persisted.shuffle);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>(persisted.repeatMode);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const restoredProgressRef = useRef(persisted.progress);
  const lastProgressSaveRef = useRef(0);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
          if (restoredProgressRef.current > 0) {
            audioRef.current.currentTime = Math.min(restoredProgressRef.current, audioRef.current.duration || restoredProgressRef.current);
            setProgress(audioRef.current.currentTime);
            restoredProgressRef.current = 0;
          }
        }
      });

      if (currentSong) {
        const preferredQuality = getSavedSettings().downloadQuality;
        const restoredAudioUrl = getAudioUrl(currentSong.downloadUrl, preferredQuality);
        if (restoredAudioUrl) {
          audioRef.current.src = restoredAudioUrl;
        }
      }

    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.onended = () => {
      if (repeatMode === 'one' && currentSong) {
        playSong(currentSong);
        return;
      }
      playNext(true);
    };
  }, [currentSong, queue, shuffle, repeatMode]);

  useEffect(() => {
    const payload: PersistedPlayerState = {
      currentSong,
      queue,
      volume,
      progress,
      shuffle,
      repeatMode,
    };
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(payload));
  }, [currentSong, queue, volume, shuffle, repeatMode]);

  useEffect(() => {
    const now = Date.now();
    if (now - lastProgressSaveRef.current < 1500) return;
    lastProgressSaveRef.current = now;
    const payload: PersistedPlayerState = {
      currentSong,
      queue,
      volume,
      progress,
      shuffle,
      repeatMode,
    };
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(payload));
  }, [progress]);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    if (audioRef.current) {
      // Get best quality audio URL using the helper function
      const preferredQuality = getSavedSettings().downloadQuality;
      const audioUrl = getAudioUrl(song.downloadUrl, preferredQuality);
      
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((error) => {
          console.error('Audio play failed:', error);
        });
        setIsPlaying(true);
        addSongToPlayHistory(song);
        savePlayHistory({
          id: song.id,
          name: song.name,
          artist: song.primaryArtists,
          image: song.image?.[0]?.url,
          url: audioUrl,
          duration: song.duration,
          language: song.language,
        }).catch((error) => {
          console.error('Failed to sync play history:', error);
        });
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const seekTo = (newProgress: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
      setProgress(newProgress);
    }
  };

  const getCurrentIndex = () => {
    if (!currentSong || queue.length === 0) return -1;
    return queue.findIndex((song) => song.id === currentSong.id);
  };

  const playNext = (isAuto = false) => {
    if (!currentSong || queue.length === 0) return;

    const currentIndex = getCurrentIndex();
    if (currentIndex < 0) return;

    if (shuffle && queue.length > 1) {
      let randomIndex = currentIndex;
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * queue.length);
      }
      playSong(queue[randomIndex]);
      return;
    }

    if (currentIndex === queue.length - 1 && repeatMode === 'off' && isAuto) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const nextIndex = currentIndex === queue.length - 1 ? 0 : currentIndex + 1;
    playSong(queue[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentSong || queue.length === 0) return;

    const currentIndex = getCurrentIndex();
    if (currentIndex < 0) return;

    if (shuffle && queue.length > 1) {
      let randomIndex = currentIndex;
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * queue.length);
      }
      playSong(queue[randomIndex]);
      return;
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    playSong(queue[prevIndex]);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const toggleShuffle = () => {
    setShuffle((prev) => !prev);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        volume,
        progress,
        duration,
        queue,
        shuffle,
        repeatMode,
        playSong,
        togglePlay,
        setVolume,
        seekTo,
        playNext,
        playPrevious,
        addToQueue,
        setQueue,
        toggleShuffle,
        cycleRepeatMode,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
