import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowRight, KeyRound, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type AuthMode = 'login' | 'register';

interface FormState {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

const initialFormState: FormState = {
  email: '',
  password: '',
  username: '',
  fullName: '',
};

const modeCopy = {
  login: {
    title: 'Sign in to SATRIA',
    description: 'Access your risk screening workspace and continue where you left off.',
    action: 'Sign in',
    switchLabel: "Don't have an account?",
    switchAction: 'Create one',
    icon: KeyRound,
  },
  register: {
    title: 'Create your investigator account',
    description: 'Register a new SATRIA workspace account using the backend authentication service.',
    action: 'Create account',
    switchLabel: 'Already have an account?',
    switchAction: 'Sign in',
    icon: UserPlus,
  },
} as const;

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const copy = modeCopy[mode];
  const Icon = copy.icon;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await register({
          email: form.email.trim(),
          password: form.password,
          username: form.username.trim(),
          fullName: form.fullName.trim() || undefined,
        });
      }

      navigate(from, { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unable to complete authentication.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(170, 83, 46, 0.26), transparent 28%), radial-gradient(circle at bottom right, rgba(32, 127, 222, 0.18), transparent 32%), var(--background)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <section className="mb-10 lg:mb-0">
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'var(--primary)' }}
            >
              <Shield size={20} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--text-h3-family)',
                  fontSize: '20px',
                  color: 'var(--foreground)',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                }}
              >
                SATRIA
              </div>
              <p className="caption" style={{ color: 'var(--muted-foreground)' }}>
                Tax Risk Screening Platform
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <h1
              className="mb-4 text-4xl leading-tight"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--text-h1-family)' }}
            >
              Investigate high-risk corporate structures with a secure entry point.
            </h1>
            <p className="mb-8 max-w-lg text-base leading-7" style={{ color: 'var(--muted-foreground)' }}>
              Sign in to review watchlists, bookmark collections, and triage dashboards backed by the SATRIA API.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'JWT-backed authentication with session restore on reload',
              'Protected dashboard routes with direct redirect back after sign-in',
              'Registration wired to the live backend auth endpoint',
              'Real authenticated profile data shown inside the app shell',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border p-4"
                style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <p className="text-sm leading-6" style={{ color: 'var(--foreground)' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Card
            className="border shadow-2xl"
            style={{ background: 'rgba(43, 42, 39, 0.94)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <CardHeader className="gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: 'rgba(170, 83, 46, 0.18)', color: 'var(--primary)' }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <CardTitle style={{ color: 'var(--foreground)' }}>{copy.title}</CardTitle>
                  <CardDescription className="mt-1">{copy.description}</CardDescription>
                </div>
              </div>

              <div
                className="grid grid-cols-2 rounded-xl p-1"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <button
                  type="button"
                  onClick={() => toggleMode('login')}
                  className="rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{
                    background: mode === 'login' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: mode === 'login' ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => toggleMode('register')}
                  className="rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{
                    background: mode === 'register' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: mode === 'register' ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  Register
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        placeholder="Budi Santoso"
                        value={form.fullName}
                        onChange={(event) => updateField('fullName', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="budisantoso"
                        required={mode === 'register'}
                        value={form.username}
                        onChange={(event) => updateField('username', event.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="investigator@satria.id"
                    required
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                  />
                </div>

                {error && (
                  <div
                    className="rounded-xl border px-4 py-3 text-sm"
                    style={{
                      background: 'rgba(191, 77, 67, 0.12)',
                      borderColor: 'rgba(191, 77, 67, 0.4)',
                      color: 'rgb(255, 207, 201)',
                    }}
                  >
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : copy.action}
                  {!isSubmitting && <ArrowRight />}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {copy.switchLabel}
                </p>
                <button
                  type="button"
                  className="text-sm"
                  style={{ color: 'var(--primary)' }}
                  onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
                >
                  {copy.switchAction}
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
