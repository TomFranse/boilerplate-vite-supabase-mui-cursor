import { useState, useEffect } from "react";
import * as todoService from "../services/todoService";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "../types/todo.types";

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  createTodo: (input: CreateTodoInput, userId: string) => Promise<void>;
  updateTodo: (todoId: string, input: UpdateTodoInput) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  refreshTodos: (userId: string) => Promise<void>;
}

export const useTodos = (userId: string | null): UseTodosReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For browser storage, userId can be null
    if (userId !== null) {
      void refreshTodos(userId);
    } else {
      // Load from browser storage if no userId (Supabase not configured)
      void refreshTodos("");
    }
  }, [userId]);

  const refreshTodos = async (userId: string) => {
    setLoading(true);
    setError(null);
    const { todos: fetchedTodos, error: fetchError } = await todoService.getTodos(userId);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTodos(fetchedTodos);
    }
    setLoading(false);
  };

  const handleCreateTodo = async (input: CreateTodoInput, userId: string) => {
    setLoading(true);
    setError(null);
    const { todo: newTodo, error: createError } = await todoService.createTodo(input, userId);
    if (createError) {
      setError(createError.message);
    } else if (newTodo) {
      setTodos([newTodo, ...todos]);
    }
    setLoading(false);
    // Refresh todos to ensure consistency
    if (userId !== null) {
      await refreshTodos(userId);
    } else {
      await refreshTodos("");
    }
  };

  const handleUpdateTodo = async (todoId: string, input: UpdateTodoInput) => {
    setLoading(true);
    setError(null);
    const { todo: updatedTodo, error: updateError } = await todoService.updateTodo(todoId, input);
    if (updateError) {
      setError(updateError.message);
    } else if (updatedTodo) {
      setTodos(todos.map((todo) => (todo.id === todoId ? updatedTodo : todo)));
    }
    setLoading(false);
  };

  const handleDeleteTodo = async (todoId: string) => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await todoService.deleteTodo(todoId);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setTodos(todos.filter((todo) => todo.id !== todoId));
    }
    setLoading(false);
  };

  return {
    todos,
    loading,
    error,
    createTodo: handleCreateTodo,
    updateTodo: handleUpdateTodo,
    deleteTodo: handleDeleteTodo,
    refreshTodos,
  };
};
