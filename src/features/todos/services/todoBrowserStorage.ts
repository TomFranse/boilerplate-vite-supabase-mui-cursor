import type { Todo, CreateTodoInput, UpdateTodoInput } from "../types/todo.types";

const STORAGE_KEY = "todos_browser_storage";

/**
 * Generate a UUID for browser-stored todos
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all todos from browser storage
 */
export const getTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Todo[];
  } catch (error) {
    // Silently fail and return empty array
    return [];
  }
};

/**
 * Save todos to browser storage
 */
const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // Silently fail - storage quota may be exceeded
  }
};

/**
 * Create a new todo in browser storage
 */
export const createTodo = (input: CreateTodoInput): { todo: Todo | null; error: Error | null } => {
  try {
    const todos = getTodos();
    const newTodo: Todo = {
      id: generateId(),
      title: input.title,
      description: input.description,
      status: input.status || "pending",
      user_id: "browser-user", // Placeholder for browser storage
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    todos.unshift(newTodo);
    saveTodos(todos);
    return { todo: newTodo, error: null };
  } catch (error) {
    return {
      todo: null,
      error: error instanceof Error ? error : new Error("Create todo failed"),
    };
  }
};

/**
 * Update a todo in browser storage
 */
export const updateTodo = (
  todoId: string,
  input: UpdateTodoInput
): { todo: Todo | null; error: Error | null } => {
  try {
    const todos = getTodos();
    const index = todos.findIndex((todo) => todo.id === todoId);
    if (index === -1) {
      return { todo: null, error: new Error("Todo not found") };
    }
    const updatedTodo: Todo = {
      ...todos[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    todos[index] = updatedTodo;
    saveTodos(todos);
    return { todo: updatedTodo, error: null };
  } catch (error) {
    return {
      todo: null,
      error: error instanceof Error ? error : new Error("Update todo failed"),
    };
  }
};

/**
 * Delete a todo from browser storage
 */
export const deleteTodo = (todoId: string): { error: Error | null } => {
  try {
    const todos = getTodos();
    const filtered = todos.filter((todo) => todo.id !== todoId);
    saveTodos(filtered);
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Delete todo failed"),
    };
  }
};
