import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TodoApiService, TodoItem } from '../../services/todo-api.service';

@Component({
  selector: 'app-home-page',
  imports: [FormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly todosStorageKey = 'quest-global-todos';

  newTaskTitle = '';
  newTaskEta = '';
  todos: TodoItem[] = [];
  editingTodoId: string | null = null;
  editTaskTitle = '';
  editTaskEta = '';
  isSyncing = false;
  syncStatusMessage = '';
  syncStatusType: 'success' | 'error' | '' = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly todoApiService: TodoApiService,
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
    this.todoApiService.createTodo({ title, eta }).subscribe({
      next: (createdTodo) => {
        this.todos = [
          {
            id: createdTodo.id,
            title: createdTodo.title,
            eta: createdTodo.eta,
            completed: createdTodo.completed,
          },
          ...this.todos,
        ];
        this.saveTodosToStorage();
        this.newTaskTitle = '';
        this.newTaskEta = '';
      },
      error: () => {
        this.syncStatusMessage = 'Unable to add task on server.';
        this.syncStatusType = 'error';
      },
    });
  }

  startEdit(todo: TodoItem): void {
    this.editingTodoId = todo.id;
    this.editTaskTitle = todo.title;
    this.editTaskEta = todo.eta ?? '';
  }

  saveEdit(todoId: string): void {
    const title = this.editTaskTitle.trim();
    if (!title) {
      return;
    }

    const eta = this.editTaskEta ? this.editTaskEta : null;
    const currentTodo = this.todos.find((todo) => todo.id === todoId);
    this.todoApiService
      .updateTodo(todoId, { title, eta, completed: currentTodo?.completed ?? false })
      .subscribe({
        next: (updatedTodo) => {
          this.todos = this.todos.map((todo) =>
            todo.id === todoId
              ? {
                  id: updatedTodo.id,
                  title: updatedTodo.title,
                  eta: updatedTodo.eta,
                  completed: updatedTodo.completed,
                }
              : todo,
          );
          this.saveTodosToStorage();
          this.cancelEdit();
        },
        error: () => {
          this.syncStatusMessage = 'Unable to update task on server.';
          this.syncStatusType = 'error';
        },
      });
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editTaskTitle = '';
    this.editTaskEta = '';
  }

  deleteTask(todoId: string): void {
    this.todoApiService.deleteTodo(todoId).subscribe({
      next: () => {
        this.todos = this.todos.filter((todo) => todo.id !== todoId);
        this.saveTodosToStorage();
        if (this.editingTodoId === todoId) {
          this.cancelEdit();
        }
      },
      error: () => {
        this.syncStatusMessage = 'Unable to delete task on server.';
        this.syncStatusType = 'error';
      },
    });
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

  syncToServer(): void {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.syncStatusMessage = '';
    this.syncStatusType = '';

    this.todoApiService
      .syncTodos({
        username: this.username,
        todos: this.todos,
        syncedAt: new Date().toISOString(),
      })
      .subscribe({
        next: () => {
          this.syncStatusMessage = 'Tasks synced to server.';
          this.syncStatusType = 'success';
        },
        error: () => {
          this.syncStatusMessage = 'Unable to sync. Check your server and try again.';
          this.syncStatusType = 'error';
          this.isSyncing = false;
        },
        complete: () => {
          this.isSyncing = false;
        },
      });
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
      const parsedTodos = JSON.parse(storedTodos) as Array<Partial<TodoItem> & { id?: string | number }>;
      this.todos = Array.isArray(parsedTodos)
        ? parsedTodos
            .filter((todo) => !!todo.id && !!todo.title)
            .map((todo) => ({
              id: String(todo.id),
              title: todo.title ?? '',
              eta: todo.eta ?? null,
              completed: todo.completed ?? false,
            }))
        : [];
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
