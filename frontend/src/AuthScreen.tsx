import { CircleAlert, LoaderCircle, LockKeyhole } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api } from './api';
import type { AuthSession } from './types';
import './auth.css';

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: AuthSession) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setAuthError('');
    const form = new FormData(event.currentTarget);

    try {
      const session = await api.login({
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      });
      onAuthenticated(session);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Unable to authenticate.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel auth-intro">
        <img
          className="auth-logo"
          src="/brand/skai-white-logo.webp"
          alt="SKAI Technology"
        />
        <div>
          <span className="auth-kicker">
            <LockKeyhole size={14} /> Secure administrator access
          </span>
          <h1>The calm way to run IT support.</h1>
          <p>
            One protected workspace for requests, equipment, inventory, and the
            people keeping everything moving.
          </p>
        </div>
        <small>Northstar Help Desk · Operations</small>
      </section>

      <section className="auth-panel auth-form-panel">
        <div className="auth-form-wrap">
          <span className="auth-icon">
            <LockKeyhole size={22} />
          </span>
          <p className="section-label">Administrator access</p>
          <h2>Sign in to your workspace</h2>
          <p className="auth-subtitle">
            Public registration is disabled. Use the configured administrator
            account to continue.
          </p>

          <form className="auth-form" onSubmit={submit}>
            <AuthField
              name="email"
              label="Email address"
              placeholder="admin@company.com"
              type="email"
              autoComplete="username"
            />
            <AuthField
              name="password"
              label="Password"
              placeholder="Administrator password"
              type="password"
              autoComplete="current-password"
            />
            {authError && (
              <div className="form-error">
                <CircleAlert size={16} /> {authError}
              </div>
            )}
            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <LockKeyhole size={17} />
              )}
              {submitting ? 'Please wait…' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function AuthField({
  name,
  label,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        minLength={type === 'password' ? 8 : undefined}
        autoComplete={autoComplete}
      />
    </label>
  );
}
