import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type TodoItem = {
  id: string;
  title: string;
  eta: string | null;
  completed: boolean;
};

export type SyncTodosPayload = {
  username: string;
  todos: TodoItem[];
  syncedAt: string;
};

type TodoApiItem = {
  _id: string;
  title: string;
  completed: boolean;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

@Injectable({
  providedIn: 'root',
})
export class TodoApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/todos`;

  constructor(private readonly http: HttpClient) {}

  syncTodos(payload: SyncTodosPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/sync`, payload);
  }

  getTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoApiItem[]>(this.baseUrl).pipe(map((todos) => todos.map((todo) => this.mapApiTodo(todo))));
  }

  createTodo(todo: Pick<TodoItem, 'title' | 'eta'>): Observable<TodoItem> {
    return this.http
      .post<TodoApiItem>(this.baseUrl, {
        title: todo.title,
        completed: false,
      })
      .pipe(map((createdTodo) => this.mapApiTodo(createdTodo, todo.eta)));
  }

  updateTodo(id: string, todo: Pick<TodoItem, 'title' | 'eta' | 'completed'>): Observable<TodoItem> {
    return this.http
      .put<TodoApiItem>(`${this.baseUrl}/${id}`, {
        title: todo.title,
        completed: todo.completed,
      })
      .pipe(map((updatedTodo) => this.mapApiTodo(updatedTodo, todo.eta)));
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private mapApiTodo(todo: TodoApiItem, eta: string | null = null): TodoItem {
    return {
      id: todo._id,
      title: todo.title,
      eta,
      completed: todo.completed,
    };
  }
}
