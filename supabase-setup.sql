-- SpiderBeats Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_songs table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_name TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_image TEXT,
  song_url TEXT,
  song_duration INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create liked_songs table
CREATE TABLE IF NOT EXISTS liked_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id TEXT NOT NULL UNIQUE,
  song_name TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_image TEXT,
  song_url TEXT,
  song_duration INTEGER DEFAULT 0,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create play_history table
CREATE TABLE IF NOT EXISTS play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id TEXT NOT NULL,
  song_name TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_image TEXT,
  song_url TEXT,
  song_duration INTEGER DEFAULT 0,
  song_language TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for anonymous users)
CREATE POLICY "Enable all access for playlists" ON playlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for playlist_songs" ON playlist_songs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for liked_songs" ON liked_songs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for search_history" ON search_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for play_history" ON play_history FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_liked_songs_song_id ON liked_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_play_history_song_id ON play_history(song_id);

-- Insert some sample playlists for testing
INSERT INTO playlists (name, description, cover_image) VALUES
  ('My Favorites', 'My all-time favorite songs', NULL),
  ('Workout Mix', 'High-energy tracks to keep you moving', NULL),
  ('Chill Vibes', 'Relaxing songs for unwinding', NULL)
ON CONFLICT DO NOTHING;
