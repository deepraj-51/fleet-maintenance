import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'That email and password combination is not recognized.'
          : 'Something went wrong signing in. Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm rounded border border-border bg-surface p-6"
      >
        <h1 className="text-xl font-semibold">Sign in to FleetOps</h1>
        <p className="mt-1 text-sm text-muted">Track vehicle maintenance and service records.</p>

        {error && (
          <p role="alert" className="mt-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-semibold">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-10 rounded border border-border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-focus"
          />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="password" className="text-xs font-semibold">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-10 rounded border border-border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-focus"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded bg-action py-2 text-center font-medium text-white hover:bg-action-hover disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 text-xs text-muted">
          New here? <Link to="/register" className="text-action underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}