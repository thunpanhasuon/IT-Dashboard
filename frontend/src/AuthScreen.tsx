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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setAuthError('');
    const form = new FormData(event.currentTarget);

    try {
      const credentials = {
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      };
      const session =
        mode === 'login'
          ? await api.login(credentials)
          : await api.register({
              ...credentials,
              name: String(form.get('name') ?? ''),
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

  const changeMode = () => {
    setMode((current) => (current === 'login' ? 'register' : 'login'));
    setAuthError('');
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
            <LockKeyhole size={14} /> Secure team access
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
          <p className="section-label">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </p>
          <h2>
            {mode === 'login'
              ? 'Sign in to your workspace'
              : 'Join your support team'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Use your team account to continue.'
              : 'Set up your secure help-desk account.'}
          </p>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <AuthField
                name="name"
                label="Full name"
                placeholder="Sam Taylor"
                autoComplete="name"
              />
            )}
            <AuthField
              name="email"
              label="Email address"
              placeholder="sam@company.com"
              type="email"
              autoComplete="email"
            />
            <AuthField
              name="password"
              label="Password"
              placeholder="At least 8 characters"
              type="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
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
              {submitting
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login'
              ? 'New to the workspace?'
              : 'Already have an account?'}
            <button type="button" onClick={changeMode}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
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
