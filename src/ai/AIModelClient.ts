// src/ai/AIModelClient.ts

/**
 * The AIModelClient interface.
 * Defines the methods for interacting with an AI model.
 */
// src/ai/AIModelClient.ts

/**
 * The AIModelClient interface.
 * Defines the methods for interacting with an AI model.
 */
export interface AIModelClient {
  /**
   * Fetches code suggestions from the AI provider.
   * @param errorMessage The error message to get suggestions for.
   * @param currentFile The current file being edited.
   * @returns A Promise that resolves to an array of suggestions.
   */
  fetchSuggestions(
    errorMessage: string,
    currentFile: string
  ): Promise<{ description: string; codeSnippet: string }[]>;
}
