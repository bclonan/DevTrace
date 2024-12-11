// src/ai/OpenAIClient.ts

import { AIModelClient } from './AIModelClient.ts';
import axios from 'axios';

/**
 * The OpenAIClient class.
 * Implements the AIModelClient interface for OpenAI.
 */
export class OpenAIClient implements AIModelClient {
  private apiKey: string;

  /**
   * Creates a new instance of the OpenAIClient class.
   * @param apiKey The API key for OpenAI.
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetches code suggestions from OpenAI.
   * @param errorMessage The error message to get suggestions for.
   * @param currentFile The current file being edited.
   * @returns A Promise that resolves to an array of suggestions.
   */
  async fetchSuggestions(errorMessage: string, currentFile: string): Promise<{ description: string; codeSnippet: string }[]> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: `Fix the following error in the code:\n\nError: ${errorMessage}\n\nCode:\n${currentFile}\n\nFixed code:`,
          max_tokens: 150,
          n: 3, // Generate 3 suggestions
          stop: ['\n\n'], // Stop generating when encountering two newlines
          temperature: 0.5, // Control the creativity of the suggestions
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const suggestions = response.data.choices.map((choice: { text: string }) => ({
        description: `Suggestion: ${choice.text.trim()}`,
        codeSnippet: choice.text.trim(),
      }));

      return suggestions;
    } catch (error) {
      console.error('Error fetching suggestions from OpenAI:', error);
      throw error;
    }
  }
}