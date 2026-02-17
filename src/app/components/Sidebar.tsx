import { useEffect, useState } from 'react';
import { Home, Search, Library, ListMusic, Settings, Disc, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { SpiderWeb } from './SpiderWeb';
import battyLogo from './figma/batty.png';
import spideyLogo from './figma/spidey.png';
import { AppTheme, getSavedSettings } from '../services/settings';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const [theme, setTheme] = useState<AppTheme>(getSavedSettings().theme);
  
  const navItems = [
    { id: 'home',
       label: 'Home',
        icon: Home,
         path: '/' },

    { id: 'search',
       label: 'Search',
        icon: Search,
         path: '/search' },

    { id: 'library',
       label: 'Library', 
       icon: Library,
        path: '/library' },

    { id: 'albums',
       label: 'Albums',
        icon: Disc,
         path: '/albums' },

    { id: 'artists',
       label: 'Artists',
        icon: User,
         path: '/artists' },

    { id: 'playlists',
       label: 'Playlists',
        icon: ListMusic,
         path: '/playlists' },

    { id: 'settings',
       label: 'Settings',
        icon: Settings,
         path: '/settings' },

  ];

  useEffect(() => {
    const syncTheme = () => {
      const settings = getSavedSettings();
      setTheme(settings.theme);
    };
    window.addEventListener('spiderbeats:settings-updated', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('spiderbeats:settings-updated', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  // Batty Themes toggle changers

  const activeLogo = theme === 'classic' ? battyLogo : spideyLogo;

  const brandName = theme === 'classic' ? 'BatBeats' : 'SpiderBeats';
  const brandTextClass = theme === 'classic'
    ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-red-500 via-red-400 to-blue-400 bg-clip-text text-transparent';
  const activeNavClass = theme === 'classic'
    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/40'
    : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50';
  const logoBgClass = theme === 'classic'
    ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700 shadow-amber-500/40'
    : 'bg-gradient-to-br from-red-600 via-red-500 to-blue-500 shadow-red-600/50';

  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
      )}
      <aside
        className={`w-64 bg-black/95 md:bg-black/40 backdrop-blur-xl border-r border-red-600/20 p-6 flex flex-col gap-6 overflow-hidden z-50
        fixed md:static inset-y-0 left-0 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
      {/* SpiderMan Desifn */}
      <SpiderWeb className="absolute top-0 right-0 w-48 h-48 text-blue-500 opacity-5 pointer-events-none" />
      <SpiderWeb className="absolute bottom-0 left-0 w-32 h-32 text-red-500 opacity-5 pointer-events-none rotate-180" />

      {/* Logo  Desgins*/}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group ${logoBgClass}`}>

          <div className="absolute inset-0 bg-gradient-to-br from-red-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <img src={activeLogo} alt="Theme Logo" className="w-7 h-7 object-contain relative z-10" />

        </div>
        <span className={`text-xl font-bold ${brandTextClass}`}>{brandName}</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onClose?.()}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? activeNavClass
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {/* Hover glow effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              )}
              
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`} />
              <span className="relative z-10 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      </aside>
    </>
  );
}
