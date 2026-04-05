import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import type { ApiError } from '../lib/api';
import {
  createBookmark,
  getBookmarks,
  updateBookmark,
  type CreateBookmarkInput,
  type Bookmark,
  type BookmarkStatus,
} from '../lib/bookmarks';

interface BookmarksContextValue {
  bookmarks: Bookmark[];
  activeBookmarks: Bookmark[];
  archivedBookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  updatingBookmarkIds: number[];
  isCreating: boolean;
  refreshBookmarks: () => Promise<void>;
  createNewBookmark: (input: CreateBookmarkInput) => Promise<Bookmark | null>;
  updateBookmarkStatus: (id: number, status: BookmarkStatus) => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, isBootstrapping, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingBookmarkIds, setUpdatingBookmarkIds] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const refreshBookmarks = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setBookmarks([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getBookmarks(token);
      setBookmarks(response.data);
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      if (apiError.status === 401) {
        logout();
        return;
      }

      setError(apiError.message || 'Unable to load collections.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, token]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    void refreshBookmarks();
  }, [isBootstrapping, refreshBookmarks]);

  const createNewBookmark = useCallback(async (input: CreateBookmarkInput) => {
    if (!token) {
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await createBookmark(input, token);
      setBookmarks((current) => [response.data, ...current]);
      return response.data;
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      if (apiError.status === 401) {
        logout();
        return null;
      }

      setError(apiError.message || 'Unable to create collection.');
      throw caughtError;
    } finally {
      setIsCreating(false);
    }
  }, [logout, token]);

  const updateBookmarkStatus = useCallback(async (id: number, status: BookmarkStatus) => {
    if (!token) {
      return;
    }

    setUpdatingBookmarkIds((current) => [...current, id]);
    setError(null);

    try {
      const response = await updateBookmark(id, { status }, token);
      setBookmarks((current) =>
        current.map((bookmark) => (bookmark.id === id ? response.data : bookmark)),
      );
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      if (apiError.status === 401) {
        logout();
        return;
      }

      setError(apiError.message || 'Unable to update collection.');
      throw caughtError;
    } finally {
      setUpdatingBookmarkIds((current) => current.filter((bookmarkId) => bookmarkId !== id));
    }
  }, [logout, token]);

  const value = useMemo<BookmarksContextValue>(
    () => ({
      bookmarks,
      activeBookmarks: bookmarks.filter((bookmark) => bookmark.status === 'Active'),
      archivedBookmarks: bookmarks.filter((bookmark) => bookmark.status === 'Archived'),
      isLoading,
      error,
      updatingBookmarkIds,
      isCreating,
      refreshBookmarks,
      createNewBookmark,
      updateBookmarkStatus,
    }),
    [bookmarks, createNewBookmark, error, isCreating, isLoading, refreshBookmarks, updateBookmarkStatus, updatingBookmarkIds],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);

  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }

  return context;
}
