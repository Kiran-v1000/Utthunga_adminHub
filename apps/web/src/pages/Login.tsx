import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/axios';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAccessToken, setUser, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle MSAL callback (code in URL)
  useEffect(() => {
    const code = params.get('code');
    if (!code) return;
    (async () => {
      try {
        const res = await api.post<{ success: boolean; data: { accessToken: string } }>(
          `/auth/callback?code=${code}`,
        );
        setAccessToken(res.data.data.accessToken);
        const me = await api.get('/auth/me');
        setUser(me.data.data);
        navigate('/dashboard', { replace: true });
      } catch {
        setError('SSO authentication failed. Please try again.');
      }
    })();
  }, [params, navigate, setAccessToken, setUser]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSsoLogin = async () => {
    try {
      const res = await api.get<{ success: boolean; data: { url: string } }>('/auth/login');
      window.location.href = res.data.data.url;
    } catch {
      setError('SSO is not configured. Use email/password login below.');
    }
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ success: boolean; data: { accessToken: string } }>(
        '/auth/local-login',
        { email, password },
      );
      setAccessToken(res.data.data.accessToken);
      const me = await api.get('/auth/me');
      setUser(me.data.data);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-modal p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-heading text-text-1 mb-1">Utthunga AdminHub</h1>
            <p className="text-body text-text-2">Enterprise Admin &amp; Facility Management</p>
          </div>

          {/* SSO Button */}
          <Button
            type="button"
            onClick={handleSsoLogin}
            className="w-full h-11 gap-3 mb-4"
            size="lg"
            variant="outline"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Sign in with Microsoft
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-text-2">or</span>
            </div>
          </div>

          {/* Local Login Form */}
          <form onSubmit={handleLocalLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-1 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@utthunga.com"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-text-1 placeholder:text-text-2/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-1 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 pr-10 text-sm text-text-1 placeholder:text-text-2/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-2 hover:text-text-1"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Dev hint */}
          <div className="mt-5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-700 font-medium mb-1">Dev credentials</p>
            <p className="text-xs text-amber-600">admin@utthunga.com · Admin@123</p>
            <p className="text-xs text-amber-600">employee@utthunga.com · Employee@123</p>
          </div>
        </div>

        <p className="mt-4 text-center text-caption text-text-2/60">
          © {new Date().getFullYear()} Utthunga Technologies
        </p>
      </div>
    </div>
  );
}
