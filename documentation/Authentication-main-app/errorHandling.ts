/**
 * Shared error handling utilities for consistent error processing across the application.
 * These functions help standardize error messages and error type detection.
 */

/**
 * Error types that can occur in the application.
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured error information for better error handling.
 */
export interface StructuredError {
  type: ErrorType;
  message: string;
  originalError: unknown;
  userMessage: string;
}

/**
 * Determines the error type based on the error object.
 *
 * @param error - The error to analyze
 * @returns The detected error type
 */
export const getErrorType = (error: unknown): ErrorType => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return ErrorType.NETWORK;
    }

    // Auth errors
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('permission denied') ||
      message.includes('forbidden')
    ) {
      return ErrorType.AUTH;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return ErrorType.VALIDATION;
    }

    // Not found errors
    if (
      message.includes('not found') ||
      message.includes('404') ||
      message.includes('does not exist')
    ) {
      return ErrorType.NOT_FOUND;
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('access denied') ||
      message.includes('insufficient')
    ) {
      return ErrorType.PERMISSION;
    }
  }

  return ErrorType.UNKNOWN;
};

/**
 * Extracts a user-friendly error message from an error object.
 *
 * @param error - The error to extract message from
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

/**
 * Creates a structured error object with type information and user-friendly message.
 *
 * @param error - The original error
 * @param customUserMessage - Optional custom user message (overrides default)
 * @returns Structured error object
 */
export const createStructuredError = (
  error: unknown,
  customUserMessage?: string,
): StructuredError => {
  const type = getErrorType(error);
  const message = getErrorMessage(error);

  // Generate user-friendly message based on error type
  let userMessage = customUserMessage;
  if (!userMessage) {
    switch (type) {
      case ErrorType.NETWORK:
        // Provide more specific error message based on error details
        if (
          message.includes('speech provider') ||
          message.includes('WebSocket')
        ) {
          userMessage = message; // Use the specific error message from the source
        } else if (
          message.includes('Supabase') ||
          message.includes('supabase')
        ) {
          userMessage =
            'Failed to connect to database. Please check your internet connection and try again.';
        } else {
          userMessage =
            'Network error. Please check your connection and try again.';
        }
        break;
      case ErrorType.AUTH:
        userMessage = 'Authentication error. Please sign in again.';
        break;
      case ErrorType.VALIDATION:
        userMessage = `Invalid input: ${message}`;
        break;
      case ErrorType.NOT_FOUND:
        userMessage = 'The requested resource was not found.';
        break;
      case ErrorType.PERMISSION:
        userMessage = 'You do not have permission to perform this action.';
        break;
      default:
        userMessage =
          message || 'An unexpected error occurred. Please try again.';
    }
  }

  return {
    type,
    message,
    originalError: error,
    userMessage,
  };
};

/**
 * Logs an error with structured information for debugging.
 * Uses console.error with a consistent format.
 *
 * @param context - Context where the error occurred (e.g., component/service name)
 * @param error - The error to log
 * @param additionalInfo - Optional additional information to log
 */
export const logError = (
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>,
): void => {
  const structuredError = createStructuredError(error);

  console.error(`[${context}] Error:`, {
    type: structuredError.type,
    message: structuredError.message,
    userMessage: structuredError.userMessage,
    ...additionalInfo,
  });
};
