import { CheckCircle2 } from 'lucide-react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="brand-mark">
          <CheckCircle2 size={24} />
          <span>FlowBoard</span>
        </div>

        <div className="auth-visual-content">
          <h1>Focused work, clear ownership.</h1>
          <p>
            Manage team tasks with role-based access, assignment visibility,
            workflow states, and a clean interface built for daily execution.
          </p>

          <div className="auth-metrics" aria-label="Workflow highlights">
            <div>
              <strong>4</strong>
              <span>workflow states</span>
            </div>
            <div>
              <strong>2</strong>
              <span>access roles</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>assignment aware</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">{children}</section>
    </main>
  );
}
