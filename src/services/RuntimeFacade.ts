// src/services/RuntimeFacade.ts

import axios from "axios";
import { AIProvider } from "../ai/AIModelFactory";
import { NodeAdapter } from "../runtimeAdapters/NodeAdapter";

/**
 * The RuntimeFacade class.
 * Acts as a facade to interact with the runtime adapter and backend API.
 */
export class RuntimeFacade {
  private adapter: NodeAdapter;

  /**
   * Creates a new instance of the RuntimeFacade class.
   */
  constructor() {
    this.adapter = new NodeAdapter();
  }

  /**
   * Starts tracing the code execution.
   */
  startTracing() {
    this.adapter.startTracing();
  }

  /**
   * Stops tracing the code execution.
   */
  stopTracing() {
    this.adapter.stopTracing();
  }

  /**
   * Analyzes the code and returns a list of issues.
   * @returns A Promise that resolves to an array of issues.
   */
  async analyzeCode() {
    try {
      const response = await axios.post("http://localhost:3000/analyze");
      return response.data.issues;
    } catch (error) {
      console.error("Error analyzing code:", error);
      throw error;
    }
  }

  /**
   * Generates flow data for the given function name.
   * @param functionName The name of the function.
   * @returns A Promise that resolves to the flow data.
   */
  async generateFlowData(functionName: string) {
    try {
      const response = await axios.post("http://localhost:3000/flow", {
        functionName,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating flow data:", error);
      throw error;
    }
  }

  /**
   * Streams live events from the backend.
   * @returns A Promise that resolves to the stream of events.
   */
  async streamLiveEvents() {
    try {
      const response = await axios.get("http://localhost:3000/live");
      return response.data;
    } catch (error) {
      console.error("Error streaming live events:", error);
      throw error;
    }
  }

  /**
   * Rolls back to the given state ID.
   * @param stateId The ID of the state to rollback to.
   * @returns A Promise that resolves to the response from the backend.
   */
  async rollbackToState(stateId: string) {
    try {
      const response = await axios.post("http://localhost:3000/hotswap", {
        action: "rollback",
        stateId,
      });
      return response.data;
    } catch (error) {
      console.error("Error rolling back to state:", error);
      throw error;
    }
  }

  /**
   * Applies the given fix to the code.
   * @param stateId The ID of the state to apply the fix to.
   * @param newCode The new code to apply.
   * @returns A Promise that resolves to the response from the backend.
   */
  async applyFix(stateId: string, newCode: string) {
    try {
      const response = await axios.post("http://localhost:3000/hotswap", {
        action: "applyFix",
        stateId,
        newCode,
      });
      return response.data;
    } catch (error) {
      console.error("Error applying fix:", error);
      throw error;
    }
  }

  /**
   * Resumes execution from the given state ID.
   * @param stateId The ID of the state to resume execution from.
   * @returns A Promise that resolves to the response from the backend.
   */
  async playForwardFromState(stateId: string) {
    try {
      const response = await axios.post("http://localhost:3000/hotswap", {
        action: "playForward",
        stateId,
      });
      return response.data;
    } catch (error) {
      console.error("Error playing forward from state:", error);
      throw error;
    }
  }

  /**
   * Fetches code suggestions from the AI provider.
   * @param errorMessage The error message to get suggestions for.
   * @param currentFile The current file being edited.
   * @param aiProvider The AI provider to use.
   * @param apiKey The API key for the AI provider.
   * @returns A Promise that resolves to an array of suggestions.
   */
  async fetchSuggestions(
    errorMessage: string,
    currentFile: string,
    aiProvider: AIProvider,
    apiKey: string,
  ) {
    try {
      const response = await axios.post("http://localhost:3000/ai/suggestFix", {
        errorMessage,
        currentFile,
        aiProvider,
        apiKey,
      });
      return response.data.suggestions;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      throw error;
    }
  }

  /**
   * Applies the selected suggestion to the code.
   * @param currentFile The current file being edited.
   * @param suggestion The suggestion to apply.
   * @returns A Promise that resolves to a boolean indicating success or failure.
   */
  async applySuggestion(currentFile: string, suggestion: string) {
    try {
      const response = await axios.post(
        "http://localhost:3000/code/applySuggestion",
        {
          currentFile,
          suggestion,
        },
      );
      return response.data.success;
    } catch (error) {
      console.error("Error applying suggestion:", error);
      throw error;
    }
  }
}
