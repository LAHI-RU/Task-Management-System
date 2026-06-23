import './App.css';

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="eyebrow">Newnop Assignment Build</div>
        <h1>FlowBoard</h1>
        <p>
          A modern task management system for role-based team workflow, task
          ownership, assignment, filtering, and delivery tracking.
        </p>
      </section>

      <section className="status-grid" aria-label="Project setup status">
        <article>
          <span>01</span>
          <h2>React Client</h2>
          <p>Vite, TypeScript, and production build tooling are ready.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Express API</h2>
          <p>Server scaffold includes security, CORS, JSON, and health route.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Next Step</h2>
          <p>Database schema, authentication, roles, and seed users.</p>
        </article>
      </section>

      <div className="manual-test">
        <strong>Manual checkpoint:</strong>
        <span>
          Run <code>npm run dev</code>, open the client, and verify the API at{' '}
          <code>/api/health</code>.
        </span>
      </div>
    </main>
  );
}

export default App;
