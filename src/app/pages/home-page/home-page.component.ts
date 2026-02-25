import { Component } from '@angular/core';
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
export class HomePageComponent {
  newTaskTitle = '';
  newTaskEta = '';
  todos: TodoItem[] = [];
  editingTodoId: number | null = null;
  editTaskTitle = '';
  editTaskEta = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

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
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editTaskTitle = '';
    this.editTaskEta = '';
  }

  deleteTask(todoId: number): void {
    this.todos = this.todos.filter((todo) => todo.id !== todoId);
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
}
