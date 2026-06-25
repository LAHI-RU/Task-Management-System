import { CheckCircle2 } from 'lucide-react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="brand-mark">
          <span className="brand-icon" aria-hidden="true">
            <CheckCircle2 size={21} strokeWidth={2.6} />
          </span>
          <span>FlowBoard</span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-kicker">Team workflow</span>
          <h1>Plan work with clarity.</h1>
          <p>
            A focused workspace for assigning tasks, tracking progress, and
            keeping ownership visible across the team.
          </p>
        </div>
      </section>

      <section className="auth-panel">{children}</section>
    </main>
  );
}
