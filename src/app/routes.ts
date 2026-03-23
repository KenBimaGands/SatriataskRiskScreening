import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { TriageDashboard } from './pages/TriageDashboard';
import { CompanyDetail } from './pages/CompanyDetail';
import { Watchlist } from './pages/Watchlist';
import { Collections } from './pages/Collections';
import { Alerts } from './pages/Alerts';

export const router = createBrowserRouter([
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
]);
