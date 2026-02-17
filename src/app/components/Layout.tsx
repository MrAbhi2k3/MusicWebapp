import { Outlet } from 'react-router';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MusicPlayer } from './MusicPlayer';
import { applyTheme, getSavedSettings } from '../services/settings';

export function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const applySavedTheme = () => {
      applyTheme(getSavedSettings().theme);
    };

    applySavedTheme();
    window.addEventListener('spiderbeats:settings-updated', applySavedTheme);
    window.addEventListener('storage', applySavedTheme);

    return () => {
      window.removeEventListener('spiderbeats:settings-updated', applySavedTheme);
      window.removeEventListener('storage', applySavedTheme);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            isMobileNavOpen={isMobileNavOpen}
            onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
          />

          {/* Scrollable Content - Outlet for pages */}
          <Outlet />
        </div>
      </div>

      {/* Music Player (Fixed at bottom) */}
      <MusicPlayer />
    </div>
  );
}
