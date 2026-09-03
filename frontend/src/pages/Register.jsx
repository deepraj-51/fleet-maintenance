import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'TECHNICIAN' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.email, form.password, form.fullName, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.status === 400
          ? 'An account with this email already exists.'
          : 'Something went wrong creating your account. Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'min-h-10 rounded border border-border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-focus';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm rounded border border-border bg-surface p-6"
      >
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Set up access for the fleet maintenance system.</p>

        {error && (
          <p role="alert" className="mt-4 rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="fullName" className="text-xs font-semibold">Full name</label>
          <input id="fullName" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-semibold">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="password" className="text-xs font-semibold">Password</label>
          <input id="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="role" className="text-xs font-semibold">Role</label>
          <select id="role" value={form.role} onChange={(e) => update('role', e.target.value)} className={inputClass}>
            <option value="TECHNICIAN">Technician</option>
            <option value="FLEET_MANAGER">Fleet manager</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded bg-action py-2 text-center font-medium text-white hover:bg-action-hover disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-4 text-xs text-muted">
          Already have an account? <Link to="/login" className="text-action underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}