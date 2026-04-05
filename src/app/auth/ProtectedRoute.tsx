import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthContext';

function FullScreenMessage({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'radial-gradient(circle at top, rgba(170, 83, 46, 0.2), transparent 35%), var(--background)' }}
    >
      <div
        className="rounded-2xl border px-6 py-5 text-center"
        style={{ background: 'rgba(43, 42, 39, 0.92)', borderColor: 'var(--border)' }}
      >
        <p style={{ color: 'var(--foreground)' }}>{label}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullScreenMessage label="Restoring your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
