import type { DataProvider } from "./types";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@features/todos/types/todo.types";
import * as browserStorage from "@features/todos/services/todoBrowserStorage";

/**
 * Browser storage implementation of DataProvider
 */
export class BrowserStorageProvider implements DataProvider {
  async createTodo(
    input: CreateTodoInput,
    _userId: string // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<{ todo: Todo | null; error: Error | null }> {
    return browserStorage.createTodo(input);
  }

  async getTodos(
    _userId: string // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<{ todos: Todo[]; error: Error | null }> {
    const todos = browserStorage.getTodos();
    return { todos, error: null };
  }

  async updateTodo(
    todoId: string,
    input: UpdateTodoInput
  ): Promise<{ todo: Todo | null; error: Error | null }> {
    return browserStorage.updateTodo(todoId, input);
  }

  async deleteTodo(todoId: string): Promise<{ error: Error | null }> {
    return browserStorage.deleteTodo(todoId);
  }
}
