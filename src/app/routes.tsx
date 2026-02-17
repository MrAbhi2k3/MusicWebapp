import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlbumsPage } from './pages/AlbumsPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { ErrorPage } from './pages/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'search',
        Component: SearchPage,
      },
      {
        path: 'library',
        Component: LibraryPage,
      },
      {
        path: 'playlists',
        Component: PlaylistsPage,
      },
      {
        path: 'playlists/:id',
        Component: PlaylistDetailPage,
      },
      {
        path: 'albums',
        Component: AlbumsPage,
      },
      {
        path: 'albums/:id',
        Component: AlbumDetailPage,
      },
      {
        path: 'artists',
        Component: ArtistsPage,
      },
      {
        path: 'artists/:id',
        Component: ArtistDetailPage,
      },
      {
        path: 'songs/:id',
        Component: SongDetailPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
    ],
  },
]);

