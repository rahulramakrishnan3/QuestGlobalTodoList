import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type TodoItem = {
  id: number;
  title: string;
  eta: string | null;
};

@Component({
  selector: 'app-home-page',
  imports: [FormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly todosStorageKey = 'quest-global-todos';
  private readonly syncEndpoint = 'http://localhost:3000/api/todos/sync';

  newTaskTitle = '';
  newTaskEta = '';
  todos: TodoItem[] = [];
  editingTodoId: number | null = null;
  editTaskTitle = '';
  editTaskEta = '';
  isSyncing = false;
  syncStatusMessage = '';
  syncStatusType: 'success' | 'error' | '' = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTodosFromStorage();
  }

  get username(): string {
    return this.authService.getUsername();
  }

  addTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) {
      return;
    }

    const eta = this.newTaskEta ? this.newTaskEta : null;
    this.todos = [{ id: Date.now(), title, eta }, ...this.todos];
    this.saveTodosToStorage();
    this.newTaskTitle = '';
    this.newTaskEta = '';
    console.log(this.todos, '--- TODOS ---');
  }

  startEdit(todo: TodoItem): void {
    this.editingTodoId = todo.id;
    this.editTaskTitle = todo.title;
    this.editTaskEta = todo.eta ?? '';
  }

  saveEdit(todoId: number): void {
    const title = this.editTaskTitle.trim();
    if (!title) {
      return;
    }

    const eta = this.editTaskEta ? this.editTaskEta : null;
    this.todos = this.todos.map((todo) => (todo.id === todoId ? { ...todo, title, eta } : todo));
    this.saveTodosToStorage();
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editTaskTitle = '';
    this.editTaskEta = '';
  }

  deleteTask(todoId: number): void {
    this.todos = this.todos.filter((todo) => todo.id !== todoId);
    this.saveTodosToStorage();
    if (this.editingTodoId === todoId) {
      this.cancelEdit();
    }
    console.log(this.todos, '--- TODOS ---');
  }

  formatEta(eta: string | null): string {
    if (!eta) {
      return 'No ETA';
    }

    return new Date(eta).toLocaleString();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  async syncToServer(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.syncStatusMessage = '';
    this.syncStatusType = '';

    try {
      const response = await fetch(this.syncEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          todos: this.todos,
          syncedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
      }

      this.syncStatusMessage = 'Tasks synced to server.';
      this.syncStatusType = 'success';
    } catch {
      this.syncStatusMessage = 'Unable to sync. Check your server and try again.';
      this.syncStatusType = 'error';
    } finally {
      this.isSyncing = false;
    }
  }

  private loadTodosFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const storedTodos = localStorage.getItem(this.todosStorageKey);
    if (!storedTodos) {
      return;
    }

    try {
      const parsedTodos = JSON.parse(storedTodos) as TodoItem[];
      this.todos = Array.isArray(parsedTodos) ? parsedTodos : [];
    } catch {
      this.todos = [];
    }
  }

  private saveTodosToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.todosStorageKey, JSON.stringify(this.todos));
  }
}
