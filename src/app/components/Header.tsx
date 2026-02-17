import { Search, Bell, User, Menu, X, LogOut, Settings, Trash2, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { clearSearchHistory, getSearchHistory, removeSearchHistoryItem } from '../services/personalization';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { decodeHtmlEntities } from '../services/api';
import { AppTheme, getSavedSettings, LANGUAGE_OPTIONS, saveSettings } from '../services/settings';
import { toast } from 'sonner';

interface HeaderProps {
  isMobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
}

export function Header({ isMobileNavOpen = false, onToggleMobileNav }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  const [searchQuery, setSearchQuery] = useState('');
  const [profileName, setProfileName] = useState('Guest');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguagesDrawer, setShowLanguagesDrawer] = useState(false);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(getSavedSettings().preferredLanguages || []);
  const [draftLanguages, setDraftLanguages] = useState<string[]>(getSavedSettings().preferredLanguages || []);

  const [theme, setTheme] = useState<AppTheme>(getSavedSettings().theme);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const syncSearches = () => {
      const searches = getSearchHistory().map((item) => item.query);
      setSuggestions(searches.slice(0, 8));
    };
    syncSearches();

    const syncTheme = () => setTheme(getSavedSettings().theme);
    const syncLanguages = () => {
      const langs = getSavedSettings().preferredLanguages || [];
      setSelectedLanguages(langs);
      setDraftLanguages(langs);
    };
    window.addEventListener('spiderbeats:settings-updated', syncTheme);
    window.addEventListener('spiderbeats:settings-updated', syncLanguages);
    window.addEventListener('storage', syncTheme);
    window.addEventListener('storage', syncLanguages);

    return () => {
      window.removeEventListener('spiderbeats:settings-updated', syncTheme);
      window.removeEventListener('spiderbeats:settings-updated', syncLanguages);
      
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('storage', syncLanguages);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const fullName = session?.user?.user_metadata?.full_name || '';
      setProfileName(decodeHtmlEntities(fullName || session?.user?.email?.split('@')[0] || 'Guest'));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const fullName = session?.user?.user_metadata?.full_name || '';
      setProfileName(decodeHtmlEntities(fullName || session?.user?.email?.split('@')[0] || 'Guest'));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguagesDrawer(false);
      }
    };
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter((item) =>
    searchQuery.trim() ? item.includes(searchQuery.toLowerCase()) : true
  );

  const refreshSuggestions = () => {
    setSuggestions(getSearchHistory().map((item) => item.query).slice(0, 8));
  };

  const handleLogout = async () => {
    try {
      if (!isSupabaseConfigured) {
        toast.info('Supabase is not configured');
        return;
      }
      await supabase.auth.signOut();
      setProfileName('Guest');
      setShowUserMenu(false);
      toast.success('Logged out');
    } catch (error: any) {
      toast.error(error?.message || 'Logout failed');
    }
  };

  const toggleDraftLanguage = (language: string) => {
    const exists = draftLanguages.includes(language);
    const next = exists
      ? draftLanguages.filter((item) => item !== language)
      : [...draftLanguages, language];
    setDraftLanguages(next);
  };

  const saveLanguages = () => {
    const settings = getSavedSettings();
    saveSettings({ ...settings, preferredLanguages: draftLanguages });
    setSelectedLanguages(draftLanguages);
    setShowLanguagesDrawer(false);
    toast.success('Languages updated');
  };

  const headerAccent = theme === 'classic' ? 'border-amber-500/30' : 'border-red-600/20';

  return (
    <header className={`bg-black/30 backdrop-blur-xl border-b ${headerAccent} px-4 md:px-8 py-3 md:py-4 flex items-center justify-between sticky top-0 z-50 gap-4`}>
      {/* Search Bar */}
      {!isSearchPage && (
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-xl"></div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search for songs, artists, or albums..."
            className="w-full bg-white/5 border border-gray-700/50 rounded-full pl-12 pr-6 py-3 text-white placeholder-gray-400 
                     focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300
                     hover:bg-white/8"
          />
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-14 left-0 right-0 bg-black/95 border border-gray-700/70 rounded-xl p-2 z-50">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Recent Searches</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  clearSearchHistory();
                  refreshSuggestions();
                }}
                className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            {filteredSuggestions.slice(0, 6).map((item) => (
              <div key={item} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(item);
                    navigate(`/search?q=${encodeURIComponent(item)}`);
                    setShowSuggestions(false);
                  }}
                  className="flex-1 text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {item}
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    removeSearchHistoryItem(item);
                    refreshSuggestions();
                  }}
                  className="px-2 py-2 rounded-md text-gray-400 hover:text-red-300 hover:bg-white/10"
                  title="Delete search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
      )}

      {/* Right Side - Notifications & Profile */}
      <div className={`flex items-center gap-3 md:gap-4 ${isSearchPage ? 'ml-auto' : 'ml-0 md:ml-8'}`}>
        <button
          onClick={onToggleMobileNav}
          className="p-3 rounded-full bg-white/5 border border-gray-700/50 text-gray-300 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* Notifications */}
        <button className="relative p-3 rounded-full bg-white/5 border border-gray-700/50 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
          <Bell className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors relative z-10" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full ring-2 ring-black animate-pulse"></span>
        </button>

        <div className="relative" ref={languageMenuRef}>
          <button
            onClick={() => {
              setDraftLanguages(selectedLanguages);
              setShowLanguagesDrawer((prev) => !prev);
            }}
            className="relative p-3 rounded-full bg-white/5 border border-gray-700/50 hover:bg-white/10 transition-all duration-300 group"
            title="Languages"
          >
            <Languages className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 text-[10px] text-gray-300">
              {showLanguagesDrawer 
              // ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
              }
            </span>
          </button>

          {showLanguagesDrawer && (
            <div className={`absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] max-h-[70vh] bg-black/95 border rounded-2xl p-4 overflow-y-auto z-[80] ${
              theme === 'classic' ? 'border-amber-500/40' : 'border-red-500/40'
            }`}>
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-black/95 py-1">
                <div>
                  <h2 className="text-2xl font-bold text-gray-200">What music do you like?</h2>
                  <p className="text-sm text-gray-400 mt-1">Pick all the languages you want to listen to.</p>
                </div>
                <button
                  onClick={() => setShowLanguagesDrawer(false)}
                  className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGE_OPTIONS.map((language) => {
                  const active = draftLanguages.includes(language);
                  return (
                    <button
                      key={language}
                      onClick={() => toggleDraftLanguage(language)}
                      className={`rounded-lg border px-3 py-2 text-base transition-colors ${
                        active
                          ? theme === 'classic'
                            ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                            : 'border-red-400 bg-red-500/20 text-white'
                          : 'border-gray-700 text-gray-100 hover:bg-white/5'
                      }`}
                    >
                      {language}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={saveLanguages}
                className="w-full mt-4 py-3 rounded-lg text-black bg-gray-200 hover:bg-gray-100 text-xl font-medium"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-gray-700/50 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <User className="w-5 h-5 text-white relative z-10" />
            </div>
            <span className="hidden sm:block text-white font-medium">{profileName}</span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-black/95 border border-gray-700/70 rounded-xl p-1 z-50">
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-red-300 hover:bg-red-500/10 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
