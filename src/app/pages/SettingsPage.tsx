import { useState, useEffect } from 'react';
import { User, Bell, Music, Palette, Shield, HelpCircle, Loader2, LogOut } from 'lucide-react';
import { SpiderWeb } from '../components/SpiderWeb';
import battyLogo from '../components/figma/batty.png';
import spideyLogo from '../components/figma/spidey.png';
import { ensureSupabaseConfigured, isSupabaseConfigured, supabase } from '../services/supabase';
import { applyTheme, AppSettings, DEFAULT_SETTINGS, getSavedSettings, saveSettings as persistSettings } from '../services/settings';
import { toast } from 'sonner';

interface UserProfile {
  email: string;
  fullName: string;
}

export function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileEditMode, setProfileEditMode] = useState<'name' | 'email' | null>(null);
  const [profileEditValue, setProfileEditValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const isBatman = settings.theme === 'classic';
  const accentTextClass = isBatman ? 'text-amber-400 hover:text-amber-300' : 'text-red-400 hover:text-red-300';
  const accentStaticTextClass = isBatman ? 'text-amber-400' : 'text-red-400';
  const accentIconGradientClass = isBatman ? 'from-amber-500 to-yellow-700' : 'from-red-600 to-blue-600';
  const accentButtonClass = isBatman
    ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
    : 'bg-gradient-to-r from-red-600 to-red-700';
  const accentToggleClass = isBatman ? 'bg-amber-500' : 'bg-red-600';
  const accentCardClass = isBatman
    ? 'border-amber-500 bg-gradient-to-br from-amber-600/20 to-yellow-600/20'
    : 'border-red-600 bg-gradient-to-br from-red-600/20 to-blue-600/20';

  useEffect(() => {
    loadUserData();
    loadSettings();

    if (!isSupabaseConfigured) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || 'User',
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || 'User',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = getSavedSettings();
    setSettings(savedSettings);
    applyTheme(savedSettings.theme);
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    persistSettings(newSettings);
    applyTheme(newSettings.theme);
    toast.success('Settings updated');
  };

  const handleSettingChange = (key: keyof AppSettings, value: boolean | string) => {
    saveSettings({ ...settings, [key]: value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      ensureSupabaseConfigured();

      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;

        if (data.session?.user) {
          setUser({
            email: data.session.user.email || '',
            fullName: data.session.user.user_metadata?.full_name || name || 'User',
          });
          setAuthSuccess('Registration successful and signed in.');
          toast.success('Registration successful');
          setShowAuthModal(false);
        } else {
          setAuthSuccess('Registration successful. Please verify your email before signing in.');
          toast.success('Registration successful. Verify your email');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || 'User',
          });
        }
        setAuthSuccess('Signed in successfully.');
        toast.success('Signed in successfully');
        setShowAuthModal(false);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
      toast.error(error.message || 'Authentication failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      ensureSupabaseConfigured();
      await supabase.auth.signOut();
      setUser(null);
      setShowLogoutModal(false);
      toast.success('Signed out');
    } catch (error: any) {
      setAuthError(error.message || 'Sign out failed');
      toast.error(error.message || 'Sign out failed');
    }
  };

  const handleUpdateName = async () => {
    if (!user) return;
    const nextName = profileEditValue.trim();
    if (!nextName || nextName === user.fullName) {
      setProfileEditMode(null);
      return;
    }

    try {
      ensureSupabaseConfigured();
      setSaving(true);
      setAuthError('');
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nextName.trim() },
      });
      if (error) throw error;
      setUser({ ...user, fullName: nextName.trim() });
      setAuthSuccess('Name updated successfully.');
      toast.success('Name updated successfully');
      setProfileEditMode(null);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to update name');
      toast.error(error.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user) return;
    const nextEmail = profileEditValue.trim();
    if (!nextEmail || nextEmail === user.email) {
      setProfileEditMode(null);
      return;
    }

    try {
      ensureSupabaseConfigured();
      setSaving(true);
      setAuthError('');
      const { error } = await supabase.auth.updateUser({
        email: nextEmail.trim(),
      });
      if (error) throw error;
      setUser({ ...user, email: nextEmail.trim() });
      setAuthSuccess('Email update requested. Please confirm from your inbox.');
      toast.success('Email change requested. Check your inbox');
      setProfileEditMode(null);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to update email');
      toast.error(error.message || 'Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  const openProfileEdit = (mode: 'name' | 'email') => {
    if (!user) return;
    setProfileEditMode(mode);
    setProfileEditValue(mode === 'name' ? user.fullName : user.email);
  };

  const submitProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileEditMode === 'name') {
      await handleUpdateName();
    } else if (profileEditMode === 'email') {
      await handleUpdateEmail();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className={`w-12 h-12 animate-spin ${isBatman ? 'text-amber-500' : 'text-red-500'}`} />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 relative">
      <SpiderWeb className="absolute top-20 right-20 w-72 h-72 text-blue-500 opacity-5 pointer-events-none rotate-45" />
      
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="max-w-4xl space-y-6">
        {/* Account Section */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-br ${accentIconGradientClass} rounded-lg flex items-center justify-center`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Account</h2>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-white font-medium">Name</p>
                  <p className="text-sm text-gray-400">{user.fullName}</p>
                </div>
                <button
                  onClick={() => openProfileEdit('name')}
                  className={`${accentTextClass} transition-colors`}
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={() => openProfileEdit('email')}
                  className={`${accentTextClass} transition-colors`}
                >
                  Change
                </button>
              </div>

              <button 
                onClick={() => setShowLogoutModal(true)}
                className={`flex items-center gap-2 w-full p-4 rounded-xl hover:bg-white/5 transition-colors ${accentStaticTextClass}`}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400">Sign in to sync your data across devices</p>
              {!isSupabaseConfigured && (
                <p className="text-amber-400 text-sm">
                  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to enable auth sync.
                </p>
              )}
              <button 
                onClick={() => setShowAuthModal(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold hover:scale-105 transition-transform ${accentButtonClass}`}
              >
                <User className="w-5 h-5" />
                Sign In / Register
              </button>
            </div>
          )}
        </section>

        {/* Notifications icons code*/}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br bg-amber-300 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'newReleases', label: 'New releases', description: 'Get notified about new music' },
              { key: 'playlistUpdates', label: 'Playlist updates', description: 'Updates to your playlists' },
              { key: 'recommendations', label: 'Recommendations', description: 'Personalized music suggestions' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <button 
                  onClick={() => handleSettingChange(item.key as keyof AppSettings, !settings[item.key as keyof AppSettings])}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    settings[item.key as keyof AppSettings] ? accentToggleClass : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings[item.key as keyof AppSettings] ? 'right-1' : 'left-1'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Playback codess */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br bg-amber-300 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Playback</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium">Audio Quality</p>
                <select 
                  value={settings.audioQuality}
                  onChange={(e) => handleSettingChange('audioQuality', e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <option value="low">Low (96kbps)</option>
                  <option value="medium">Medium (160kbps)</option>
                  <option value="high">High (320kbps)</option>
                </select>
              </div>
              <p className="text-sm text-gray-400">
                {settings.audioQuality === 'high' ? '320kbps streaming quality' : 
                 settings.audioQuality === 'medium' ? '160kbps streaming quality' : '96kbps streaming quality'}
              </p>
            </div>

            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium">Download Quality</p>
                <select
                  value={settings.downloadQuality}
                  onChange={(e) => handleSettingChange('downloadQuality', e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <option value="96kbps">Low (96kbps)</option>
                  <option value="160kbps">Medium (160kbps)</option>
                  <option value="320kbps">High (320kbps)</option>
                </select>
              </div>
              <p className="text-sm text-gray-400">
                Downloads will prefer {settings.downloadQuality}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div>
                <p className="text-white font-medium">Crossfade</p>
                <p className="text-sm text-gray-400">Smooth transition between songs</p>
              </div>
              <button 
                onClick={() => handleSettingChange('crossfade', !settings.crossfade)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  settings.crossfade ? accentToggleClass : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.crossfade ? 'right-1' : 'left-1'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div>
                <p className="text-white font-medium">Autoplay</p>
                <p className="text-sm text-gray-400">Play similar songs when your music ends</p>
              </div>
              <button 
                onClick={() => handleSettingChange('autoplay', !settings.autoplay)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  settings.autoplay ? accentToggleClass : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.autoplay ? 'right-1' : 'left-1'
                }`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-br ${accentIconGradientClass} rounded-lg flex items-center justify-center`}>
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Theme</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSettingChange('theme', 'spiderman')}
              className={`p-4 rounded-xl border-2 hover:scale-105 transition-transform ${
                settings.theme === 'spiderman' 
                  ? 'border-red-600 bg-gradient-to-br from-red-600/20 to-blue-600/20'
                  : 'border-gray-700 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <img src={spideyLogo} alt="Spidey Logo" className="w-10 h-10 object-contain" />
              </div>
              <p className="text-white font-medium text-sm">Spider-Man</p>
              {settings.theme === 'spiderman' && <p className="text-xs text-gray-400 mt-1">Active</p>}
            </button>

            <button 
              onClick={() => handleSettingChange('theme', 'classic')}
              className={`p-4 rounded-xl border-2 hover:scale-105 transition-transform ${
                settings.theme === 'classic' 
                  ? accentCardClass
                  : 'border-gray-700 bg-white/5'
              }`}
            >
              <img src={battyLogo} alt="Batty Logo" className="w-10 h-10 object-contain mx-auto mb-3" />
              <p className="text-white font-medium text-sm">Batman</p>
              {settings.theme === 'classic' && <p className="text-xs text-gray-400 mt-1">Active</p>}
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br bg-teal-700 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">About</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <p className="text-white font-medium">Version</p>
              <p className="text-sm text-gray-400">MusicSync WebApp v1.0.0</p>
            </div>

            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <p className="text-white font-medium">Help & Support</p>
              <p className="text-sm text-gray-400">Get help with SpiderBeats</p>
            </div>

            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <p className="text-white font-medium">Terms & Privacy</p>
              <p className="text-sm text-gray-400">Read our policies</p>
            </div>
          </div>
        </section>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                  minLength={6}
                />
              </div>
              
              {authError && (
                <p className="text-red-400 text-sm">{authError}</p>
              )}
              {authSuccess && (
                <p className="text-green-400 text-sm">{authSuccess}</p>
              )}

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50 ${accentButtonClass}`}
                >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
                 authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-gray-400 hover:text-white"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {profileEditMode && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">
              {profileEditMode === 'name' ? 'Edit Name' : 'Change Email'}
            </h2>
            <form onSubmit={submitProfileEdit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">
                  {profileEditMode === 'name' ? 'Name' : 'Email'}
                </label>
                <input
                  type={profileEditMode === 'name' ? 'text' : 'email'}
                  value={profileEditValue}
                  onChange={(e) => setProfileEditValue(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProfileEditMode(null)}
                  className="flex-1 py-3 bg-white/10 rounded-lg text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-60 ${accentButtonClass}`}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-3">Log Out</h2>
            <p className="text-gray-400 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className={`flex-1 py-3 rounded-lg text-white font-semibold ${accentButtonClass}`}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
