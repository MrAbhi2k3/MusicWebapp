export type AppTheme = 'spiderman' | 'classic';

export interface AppSettings {
  newReleases: boolean;
  playlistUpdates: boolean;
  recommendations: boolean;
  audioQuality: string;
  downloadQuality: '320kbps' | '160kbps' | '96kbps';
  preferredLanguages: string[];
  crossfade: boolean;
  autoplay: boolean;
  theme: AppTheme;
}

export const LANGUAGE_OPTIONS = [
  'Hindi',
  'English',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Kannada',
  'Bhojpuri',
  'Malayalam',
  'Urdu',
  'Haryanvi',
  'Rajasthani',
  'Odia',
  'Assamese',
];

export const SETTINGS_KEY = 'spiderbeats_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  newReleases: true,
  playlistUpdates: true,
  recommendations: true,
  audioQuality: 'high',
  downloadQuality: '320kbps',
  preferredLanguages: ['Hindi', 'English'],
  crossfade: false,
  autoplay: true,
  theme: 'spiderman',
};

export const getSavedSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const normalizedTheme: AppTheme =
      parsed.theme === 'spiderman' || parsed.theme === 'classic'
        ? parsed.theme
        : 'spiderman';
    return { ...DEFAULT_SETTINGS, ...parsed, theme: normalizedTheme };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('spiderbeats:settings-updated'));
};

export const applyTheme = (theme: AppTheme) => {
  const body = document.body;
  body.classList.remove('theme-spiderman', 'theme-classic', 'theme-neon');
  body.classList.add(`theme-${theme}`);
};
