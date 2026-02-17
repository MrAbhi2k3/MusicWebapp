/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.placeholder';
const LOCAL_PLAYLISTS_KEY = 'spiderbeats_local_playlists';
const LOCAL_PLAYLIST_SONGS_KEY = 'spiderbeats_local_playlist_songs';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : FALLBACK_URL,
  isSupabaseConfigured ? supabaseAnonKey : FALLBACK_ANON_KEY
);

export const ensureSupabaseConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }
};

type LocalPlaylist = {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
};

type LocalPlaylistSong = {
  id: string;
  playlist_id: string;
  song_id: string;
  song_name: string;
  song_artist: string;
  song_image: string | null;
  song_url: string | null;
  song_duration: number;
  position: number;
  created_at: string;
};

const readLocal = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
};

const writeLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const shouldFallbackToLocal = (error: any) => {
  const message = (error?.message || '').toLowerCase();
  return (
    error?.code === 'PGRST205' ||
    message.includes("could not find the table") ||
    message.includes('schema cache')
  );
};

// Types for our database
export interface Database {
  public: {
    Tables: {
      playlists: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_image: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_image?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_image?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      playlist_songs: {
        Row: {
          id: string;
          playlist_id: string;
          song_id: string;
          song_name: string;
          song_artist: string;
          song_image: string | null;
          song_url: string | null;
          song_duration: number;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          playlist_id: string;
          song_id: string;
          song_name: string;
          song_artist: string;
          song_image?: string | null;
          song_url?: string | null;
          song_duration?: number;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          playlist_id?: string;
          song_id?: string;
          song_name?: string;
          song_artist?: string;
          song_image?: string | null;
          song_url?: string | null;
          song_duration?: number;
          position?: number;
          created_at?: string;
        };
      };
      liked_songs: {
        Row: {
          id: string;
          song_id: string;
          song_name: string;
          song_artist: string;
          song_image: string | null;
          song_url: string | null;
          song_duration: number;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          song_id: string;
          song_name: string;
          song_artist: string;
          song_image?: string | null;
          song_url?: string | null;
          song_duration?: number;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          song_id?: string;
          song_name?: string;
          song_artist?: string;
          song_image?: string | null;
          song_url?: string | null;
          song_duration?: number;
          user_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Playlist functions
export const createPlaylist = async (name: string, description?: string, coverImage?: string) => {
  const localCreate = () => {
    const now = new Date().toISOString();
    const playlists = readLocal<LocalPlaylist>(LOCAL_PLAYLISTS_KEY);
    const playlist: LocalPlaylist = {
      id: crypto.randomUUID(),
      name,
      description: description || null,
      cover_image: coverImage || null,
      created_at: now,
    };
    writeLocal(LOCAL_PLAYLISTS_KEY, [playlist, ...playlists]);
    return playlist;
  };

  if (!isSupabaseConfigured) {
    return localCreate();
  }
  const { data, error } = await supabase
    .from('playlists')
    .insert({
      name,
      description: description || null,
      cover_image: coverImage || null,
    })
    .select()
    .single();

  if (error) {
    if (shouldFallbackToLocal(error)) return localCreate();
    throw error;
  }
  return data;
};

export const getUserPlaylists = async () => {
  if (!isSupabaseConfigured) {
    return readLocal<LocalPlaylist>(LOCAL_PLAYLISTS_KEY);
  }
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (shouldFallbackToLocal(error)) return readLocal<LocalPlaylist>(LOCAL_PLAYLISTS_KEY);
    throw error;
  }
  return data;
};

export const deletePlaylist = async (playlistId: string) => {
  const localDelete = () => {
    const playlists = readLocal<LocalPlaylist>(LOCAL_PLAYLISTS_KEY).filter((p) => p.id !== playlistId);
    const songs = readLocal<LocalPlaylistSong>(LOCAL_PLAYLIST_SONGS_KEY).filter((s) => s.playlist_id !== playlistId);
    writeLocal(LOCAL_PLAYLISTS_KEY, playlists);
    writeLocal(LOCAL_PLAYLIST_SONGS_KEY, songs);
  };

  if (!isSupabaseConfigured) {
    localDelete();
    return;
  }
  ensureSupabaseConfigured();
  // First delete all songs in the playlist
  await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId);

  // Then delete the playlist
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  if (error) {
    if (shouldFallbackToLocal(error)) {
      localDelete();
      return;
    }
    throw error;
  }
};

export const addSongToPlaylist = async (
  playlistId: string,
  song: {
    id: string;
    name: string;
    artist: string;
    image?: string;
    url?: string;
    duration: number;
  }
) => {
  const localAdd = () => {
    const songs = readLocal<LocalPlaylistSong>(LOCAL_PLAYLIST_SONGS_KEY);
    const playlistSongs = songs.filter((s) => s.playlist_id === playlistId);
    const maxPosition = playlistSongs.length ? Math.max(...playlistSongs.map((s) => s.position)) : -1;
    const playlistSong: LocalPlaylistSong = {
      id: crypto.randomUUID(),
      playlist_id: playlistId,
      song_id: song.id,
      song_name: song.name,
      song_artist: song.artist,
      song_image: song.image || null,
      song_url: song.url || null,
      song_duration: song.duration,
      position: maxPosition + 1,
      created_at: new Date().toISOString(),
    };
    writeLocal(LOCAL_PLAYLIST_SONGS_KEY, [...songs, playlistSong]);
    return playlistSong;
  };

  if (!isSupabaseConfigured) {
    return localAdd();
  }
  ensureSupabaseConfigured();
  // Get the current max position
  const { data: existingSongs } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);

  const newPosition = existingSongs && existingSongs.length > 0 
    ? existingSongs[0].position + 1 
    : 0;

  const { data, error } = await supabase
    .from('playlist_songs')
    .insert({
      playlist_id: playlistId,
      song_id: song.id,
      song_name: song.name,
      song_artist: song.artist,
      song_image: song.image || null,
      song_url: song.url || null,
      song_duration: song.duration,
      position: newPosition,
    })
    .select()
    .single();

  if (error) {
    if (shouldFallbackToLocal(error)) return localAdd();
    throw error;
  }
  return data;
};

export const getPlaylistSongs = async (playlistId: string) => {
  if (!isSupabaseConfigured) {
    return readLocal<LocalPlaylistSong>(LOCAL_PLAYLIST_SONGS_KEY)
      .filter((s) => s.playlist_id === playlistId)
      .sort((a, b) => a.position - b.position);
  }
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });

  if (error) {
    if (shouldFallbackToLocal(error)) {
      return readLocal<LocalPlaylistSong>(LOCAL_PLAYLIST_SONGS_KEY)
        .filter((s) => s.playlist_id === playlistId)
        .sort((a, b) => a.position - b.position);
    }
    throw error;
  }
  return data;
};

export const removeSongFromPlaylist = async (playlistSongId: string) => {
  const localRemove = () => {
    const songs = readLocal<LocalPlaylistSong>(LOCAL_PLAYLIST_SONGS_KEY).filter((s) => s.id !== playlistSongId);
    writeLocal(LOCAL_PLAYLIST_SONGS_KEY, songs);
  };

  if (!isSupabaseConfigured) {
    localRemove();
    return;
  }
  ensureSupabaseConfigured();
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('id', playlistSongId);

  if (error) {
    if (shouldFallbackToLocal(error)) {
      localRemove();
      return;
    }
    throw error;
  }
};

// Liked songs functions
export const likeSong = async (song: {
  id: string;
  name: string;
  artist: string;
  image?: string;
  url?: string;
  duration: number;
}) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('liked_songs')
    .insert({
      song_id: song.id,
      song_name: song.name,
      song_artist: song.artist,
      song_image: song.image || null,
      song_url: song.url || null,
      song_duration: song.duration,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unlikeSong = async (songId: string) => {
  ensureSupabaseConfigured();
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('song_id', songId);

  if (error) throw error;
};

export const getLikedSongs = async () => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('liked_songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const isSongLiked = async (songId: string) => {
  ensureSupabaseConfigured();
  const { data, error } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('song_id', songId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

export const saveSearchHistory = async (query: string) => {
  if (!isSupabaseConfigured || !query.trim()) return;

  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from('search_history').insert({
    query: query.trim().toLowerCase(),
    user_id: session?.user?.id ?? null,
  });
};

export const savePlayHistory = async (song: {
  id: string;
  name: string;
  artist: string;
  image?: string;
  url?: string;
  duration: number;
  language?: string;
}) => {
  if (!isSupabaseConfigured) return;

  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from('play_history').insert({
    song_id: song.id,
    song_name: song.name,
    song_artist: song.artist,
    song_image: song.image || null,
    song_url: song.url || null,
    song_duration: song.duration || 0,
    song_language: song.language || null,
    user_id: session?.user?.id ?? null,
  });
};
