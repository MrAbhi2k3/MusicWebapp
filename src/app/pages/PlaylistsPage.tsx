import { useState, useEffect } from 'react';
import { Plus, ListMusic, Music, Heart, Zap, Trash2, Loader2, Play } from 'lucide-react';
import { SpiderWeb } from '../components/SpiderWeb';
import { createPlaylist, getUserPlaylists, deletePlaylist, getPlaylistSongs } from '../services/supabase';
import { useMusicPlayer } from '../contexts/MusicContext';
import { Song } from '../services/api';

interface UserPlaylist {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
}

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const { playSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserPlaylists();
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setError((error as Error).message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setCreating(true);
      setError('');
      await createPlaylist(newPlaylistName, newPlaylistDesc);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError((error as Error).message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      setError('');
      await deletePlaylist(playlistId);
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError((error as Error).message || 'Failed to delete playlist');
    }
  };

  const handlePlayPlaylist = async (playlist: UserPlaylist) => {
    try {
      const songs = await getPlaylistSongs(playlist.id);
      if (songs && songs.length > 0) {
        // Convert Supabase song format to app Song format
        const formattedSongs: Song[] = songs.map((s) => ({
          id: s.song_id,
          name: s.song_name,
          album: { id: '', name: '', url: '' },
          year: '',
          releaseDate: '',
          duration: s.song_duration,
          label: '',
          primaryArtists: s.song_artist,
          primaryArtistsId: '',
          featuredArtists: '',
          explicitContent: false,
          playCount: 0,
          language: '',
          hasLyrics: false,
          url: '',
          copyright: '',
          image: s.song_image ? [{ quality: '500x500', url: s.song_image }] : [],
          downloadUrl: s.song_url ? [{ quality: '320kbps', url: s.song_url }] : [],
        }));
        setQueue(formattedSongs);
        playSong(formattedSongs[0]);
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      setError((error as Error).message || 'Failed to play playlist');
    }
  };

  // Suggested playlist templates
  const suggestedPlaylists = [
    { name: 'Workout Mix', desc: 'High-energy tracks', icon: Music, color: 'bg-red-600/20', iconColor: 'text-red-400' },
    { name: 'Chill Vibes', desc: 'Relaxing songs', icon: Heart, color: 'bg-blue-600/20', iconColor: 'text-blue-400' },
    { name: 'Party Time', desc: 'Dance hits', icon: Zap, color: 'bg-purple-600/20', iconColor: 'text-purple-400' },
  ];

  const handleQuickCreate = async (name: string, desc: string) => {
    try {
      setCreating(true);
      await createPlaylist(name, desc);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 pb-32 relative">
      <SpiderWeb className="absolute bottom-10 right-10 w-64 h-64 text-red-500 opacity-5 pointer-events-none -rotate-12" />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-600/30 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      )}

      {!!error && !loading && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {/* User's Playlists */}
      {!loading && playlists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="group relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:scale-105 overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-blue-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

              <div className="relative flex items-center gap-4">
                {/* Cover Image */}
                <div 
                  className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center"
                  style={{
                    background: playlist.cover_image 
                      ? `url(${playlist.cover_image}) center/cover` 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  {!playlist.cover_image && <ListMusic className="w-8 h-8 text-white" />}
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handlePlayPlaylist(playlist)}
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
                    {playlist.description || 'Custom playlist'}
                  </p>
                </div>

                {/* Delete button */}
                <button 
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/20 rounded-full transition-all text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State or Suggestions */}
      {(!loading && playlists.length === 0) && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-16 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600/30 to-red-600/30 rounded-2xl flex items-center justify-center">
              <ListMusic className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Create your first playlist</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            It's easy! Just tap the button above and start adding your favorite tracks
          </p>

          {/* Suggested Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
            {suggestedPlaylists.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button 
                  key={index}
                  onClick={() => handleQuickCreate(suggestion.name, suggestion.desc)}
                  disabled={creating}
                  className="bg-white/5 rounded-xl p-6 border border-gray-800/50 hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <div className={`w-12 h-12 ${suggestion.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className={`w-6 h-6 ${suggestion.iconColor}`} />
                  </div>
                  <h3 className="text-white font-medium mb-1">{suggestion.name}</h3>
                  <p className="text-sm text-gray-400">{suggestion.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Playlist</h2>
            
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Description (optional)</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPlaylistName.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
