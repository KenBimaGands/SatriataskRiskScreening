import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './pages/AuthPage';
import { TriageDashboard } from './pages/TriageDashboard';
import { CompanyDetail } from './pages/CompanyDetail';
import { Watchlist } from './pages/Watchlist';
import { Collections } from './pages/Collections';
import { Alerts } from './pages/Alerts';

export const router = createBrowserRouter([
  {
    Component: PublicOnlyRoute,
    children: [
      { path: 'auth', Component: AuthPage },
    ],
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: TriageDashboard },
          { path: 'company/:id', Component: CompanyDetail },
          { path: 'watchlist', Component: Watchlist },
          { path: 'collections', Component: Collections },
          { path: 'alerts', Component: Alerts },
        ],
      },
    ],
  },
]);
