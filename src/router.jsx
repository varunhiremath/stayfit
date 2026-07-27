import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import LoadingPage from './pages/LoadingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import WorkoutPage from './pages/WorkoutPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import ExerciseDetailPage from './pages/ExerciseDetailPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HallOfRecordsPage from './pages/HallOfRecordsPage.jsx';

export const router = createBrowserRouter(
  [
    { path: '/', element: <LoadingPage /> },
    {
      element: <AppLayout />,
      children: [
        { path: '/home', element: <HomePage /> },
        { path: '/plan', element: <PlanPage /> },
        { path: '/workout', element: <WorkoutPage /> },
        { path: '/library', element: <LibraryPage /> },
        { path: '/progress', element: <ProgressPage /> },
        { path: '/history', element: <HistoryPage /> },
        { path: '/records', element: <HallOfRecordsPage /> },
        { path: '/exercises/:id', element: <ExerciseDetailPage /> },
        { path: '/profile', element: <ProfilePage /> },
        { path: '/settings', element: <SettingsPage /> },
      ],
    },
  ],
  // Basename mirrors Vite's BASE_URL so a WebView (base '/') and
  // GitHub Pages both match. createBrowserRouter wants the leading
  // '/' but no trailing slash; '/' alone is fine.
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' }
);
