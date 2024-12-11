// src/ai/GithubCopilotClient.ts

import * as vscode from "vscode";
import { AIModelClient } from "./AIModelClient.ts";

/**
 * The GithubCopilotClient class.
 * Implements the AIModelClient interface for GitHub Copilot.
 */
export class GithubCopilotClient implements AIModelClient {
    /**
     * Fetches code suggestions from GitHub Copilot.
     * @param errorMessage The error message to get suggestions for.
     * @param currentFile The current file being edited.
     * @returns A Promise that resolves to an array of suggestions.
     */
     async fetchSuggestions(
        _errorMessage: string,
        _currentFile: string,
    ): Promise<{ description: string; codeSnippet: string }[]> {
        try {
            // Get the active text editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                throw new Error("No active text editor found.");
            }

            // Trigger Copilot suggestion
            const suggestions = await vscode.commands.executeCommand<
                vscode.CompletionList
            >(
                "editor.action.triggerSuggest",
            );

            if (!suggestions || suggestions.items.length === 0) {
                throw new Error("No suggestions from Copilot.");
            }

            // Format the suggestions
            const formattedSuggestions = suggestions.items.map((item) => ({
                description: typeof item.label === "string"
                    ? item.label
                    : item.label.label,
                codeSnippet: typeof item.insertText === "string"
                    ? item.insertText
                    : item.insertText?.value ?? "", // Use insertText or label as fallback
            }));

            return formattedSuggestions;
        } catch (error) {
            console.error(
                "Error fetching suggestions from GitHub Copilot:",
                error,
            );
            throw error;
        }
    }
}
