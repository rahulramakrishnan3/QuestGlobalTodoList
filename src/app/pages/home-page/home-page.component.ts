import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type TodoItem = {
  id: number;
  title: string;
};

@Component({
  selector: 'app-home-page',
  imports: [FormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  newTaskTitle = '';
  todos: TodoItem[] = [];
  editingTodoId: number | null = null;
  editTaskTitle = '';

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

    this.todos = [{ id: Date.now(), title }, ...this.todos];
    this.newTaskTitle = '';
    console.log(this.todos, '--- TODOS ---');
  }

  startEdit(todo: TodoItem): void {
    this.editingTodoId = todo.id;
    this.editTaskTitle = todo.title;
  }

  saveEdit(todoId: number): void {
    const title = this.editTaskTitle.trim();
    if (!title) {
      return;
    }

    this.todos = this.todos.map((todo) => (todo.id === todoId ? { ...todo, title } : todo));
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editTaskTitle = '';
  }

  deleteTask(todoId: number): void {
    this.todos = this.todos.filter((todo) => todo.id !== todoId);
    if (this.editingTodoId === todoId) {
      this.cancelEdit();
    }
    console.log(this.todos, '--- TODOS ---');
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
