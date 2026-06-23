import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { ApiError } from '../../../lib/api';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@flowboard.dev',
      password: 'Admin@12345',
    },
  });

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await loginUser(values);
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? '/app';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Unable to login right now.',
      );
    }
  });

  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Sign in with a demo account to open the protected workspace.</p>

        <form className="form-stack" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <span className="field-error">
                {form.formState.errors.email.message}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <span className="field-error">
                {form.formState.errors.password.message}
              </span>
            ) : null}
          </div>

          {formError ? <div className="form-error">{formError}</div> : null}

          <button
            className="primary-button"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            <LogIn size={18} />
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-switch">
          Need an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </AuthShell>
  );
}
