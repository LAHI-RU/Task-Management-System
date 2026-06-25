import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { ApiError } from '../../../lib/api';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { user, registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await registerUser(values);
      navigate('/app', { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to register right now.',
      );
    }
  });

  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Set up your workspace profile and start organizing tasks.</p>

        <form className="form-stack" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" {...form.register('name')} />
            {form.formState.errors.name ? (
              <span className="field-error">
                {form.formState.errors.name.message}
              </span>
            ) : null}
          </div>

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
            <UserPlus size={18} />
            {form.formState.isSubmitting ? 'Creating...' : 'Create account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </AuthShell>
  );
}
