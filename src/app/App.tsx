import { RouterProvider } from 'react-router';
import { router } from './routes';
import { MusicProvider } from './contexts/MusicContext';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { AppTheme, getSavedSettings } from './services/settings';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>(getSavedSettings().theme);

  useEffect(() => {
    const syncTheme = () => setTheme(getSavedSettings().theme);
    window.addEventListener('spiderbeats:settings-updated', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('spiderbeats:settings-updated', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const toastStyle =
    theme === 'classic'
      ? { background: '#15120a', color: '#fde68a', border: '1px solid #f59e0b' }
      : { background: '#111827', color: '#f3f4f6', border: '1px solid #dc2626' };

  return (
    <MusicProvider>
      <RouterProvider router={router} />
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{ style: toastStyle }}
      />
    </MusicProvider>
  );
}
