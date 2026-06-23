import { ListTodo } from 'lucide-react';

export function TasksPage() {
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>
            The backend task API is ready. The complete interactive task
            workspace is the next implementation checkpoint.
          </p>
        </div>
      </section>

      <section className="tasks-placeholder">
        <ListTodo size={30} />
        <h3>Task UI checkpoint is next</h3>
        <p>
          Checkpoint 5 will connect this page to the task API with searchable
          tables, filters, task detail, create/edit forms, and role-aware actions.
        </p>
      </section>
    </>
  );
}
