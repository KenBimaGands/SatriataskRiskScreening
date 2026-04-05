import { RouterProvider } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import { BookmarksProvider } from './bookmarks/BookmarksContext';
import { CompanyCollectionsProvider } from './company-collections/CompanyCollectionsContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <CompanyCollectionsProvider>
        <BookmarksProvider>
          <RouterProvider router={router} />
        </BookmarksProvider>
      </CompanyCollectionsProvider>
    </AuthProvider>
  );
}
