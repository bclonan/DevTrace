import axios from "axios";
import { AIProvider } from "../ai/AIModelFactory.ts";
import { NodeAdapter } from "../runtimeAdapters/NodeAdapter.ts";
import type { LiveEvent } from "../types.d.ts";

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
      const response: {
        data: {
          success: boolean;
          suggestions: { id: string; description: string }[];
        };
      } = await axios.post(
        "http://localhost:3000/ai/suggestFix",
        {
          errorMessage,
          currentFile,
          aiProvider,
          apiKey,
        },
      );
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
      const response: {
        data: {
          success: boolean;
          suggestions: { id: string; description: string }[];
        };
      } = await axios.post(
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

  /**
   * Performs a hotswap operation.
   * @param action The action to perform.
   * @param stateId The ID of the state to perform the action on.
   * @param newCode The new code to apply (if applicable).
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to perform hotswap operations such as rollback, apply fix, and play forward.
   * @example
   * ```typescript
   * const response = await runtimeFacade.performHotswap("rollback", "1234");
   * console.log(response);
   * ```
   * @example
   * ```typescript
   * const response = await runtimeFacade.performHotswap("applyFix", "1234", "if(!user) return;");
   * console.log(response);
   * ```
   */
  async performHotswap(action: string, stateId: string, newCode?: string) {
    try {
      const response = await axios.post("http://localhost:3000/hotswap", {
        action,
        stateId,
        newCode,
      });
      return response.data;
    } catch (error) {
      console.error("Error performing hotswap operation:", error);
      throw error;
    }
  }
  /**
   * Starts a live trace session.
   * @param devTraceActor The DevTrace state machine actor.
   * @param webviewView The webview view.
   * @remarks This method is used to start a live trace session and stream live events to the webview.
   * @example
   * ```typescript
   * runtimeFacade.startLiveTrace(devTraceActor, webviewView);
   * ```
   * @example
   * ```typescript
   * runtimeFacade.startLiveTrace(devTraceActor, webviewView);
   * ```
   */
  startLiveTrace(
    devTraceActor: {
      subscribe: (
        callback: (
          state: {
            value: string;
            context: { liveEvents: LiveEvent[]; errorMessage: string };
          },
        ) => void,
      ) => void;
      send: (message: { type: string }) => void;
    },
    webviewView: {
      webview: {
        postMessage: (
          message: {
            type: string;
            payload: unknown;
            liveEvents?: LiveEvent[];
            errorMessage?: string;
          },
        ) => void;
        onDidReceiveMessage: (
          callback: (message: { type: string; payload: unknown }) => void,
        ) => void;
      };
    },
  ) {
    // Listen for state changes
    devTraceActor.subscribe(
      (
        state: {
          value: string;
          context: { liveEvents: LiveEvent[]; errorMessage: string };
        },
      ) => {
        // Send the current state to the webview
        webviewView.webview.postMessage({
          type: "stateChanged",
          payload: state.value,
          liveEvents: state.context.liveEvents,
          errorMessage: state.context.errorMessage,
        });
      },
    );

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      (message: { type: string; payload: unknown }) => {
        switch (message.type) {
          case "startTracing":
            devTraceActor.send({ type: "trace" });
            break;
          case "stopTracing":
            devTraceActor.send({ type: "exit" });
            break;
            // ... handle other messages from the webview
        }
      },
    );

    // Start tracing
    devTraceActor.send({ type: "trace" });

    // Stream live events
    devTraceActor.send({ type: "streamLiveEvents" });
  }

  /**
   * process flow data
   * @param flowData The flow data to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process flow data.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processFlowData(flowData);
   * console.log(response);
   * ```
   */
  async processFlowData(flowData: Record<string, unknown>) {
    try {
      const response: { data: { processedData: unknown } } = await axios.post(
        "http://localhost:3000/flow/process",
        {
          flowData,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing flow data:", error);
      throw error;
    }
  }

  /**
   * process live event
   * @param liveEvent The live event to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process live events.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processLiveEvent(liveEvent);
   * console.log(response);
   * ```
   */
  async processLiveEvent(
    liveEvent: { id: string; type: string; data: Record<string, unknown> },
  ) {
    try {
      const response: { data: { processedData: unknown } } = await axios.post(
        "http://localhost:3000/live/process",
        {
          liveEvent,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing live event:", error);
      throw error;
    }
  }

  /**
   * process issue
   * @param issue The issue to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process issues.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processIssue(issue);
   * console.log(response);
   * ```
   */
  async processIssue(issue: { id: string; description: string }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/issue/process",
        {
          issue,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing issue:", error);
      throw error;
    }
  }

  /**
   * process suggestion
   * @param suggestion The suggestion to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process suggestions.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processSuggestion(suggestion);
   * console.log(response);
   * ```
   */
  async processSuggestion(suggestion: { id: string; description: string }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/suggestion/process",
        {
          suggestion,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing suggestion:", error);
      throw error;
    }
  }

  /**
   * process fix
   * @param fix The fix to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process fixes.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processFix(fix);
   * console.log(response);
   * ```
   */
  async processFix(fix: { id: string; description: string }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/fix/process",
        {
          fix,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing fix:", error);
      throw error;
    }
  }

  /**
   * process trace
   * @param trace The trace to process
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process traces.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processTrace(trace);
   * console.log(response);
   * ```
   */
  async processTrace(trace: { id: string; data: Record<string, unknown> }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/trace/process",
        {
          trace,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing trace:", error);
      throw error;
    }
  }

  /**
   * process state
   * @param state The state to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process states.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processState(state);
   * console.log(response);
   * ```
   */
  async processState(state: { id: string; data: Record<string, unknown> }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/state/process",
        {
          state,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing state:", error);
      throw error;
    }
  }

  /**
   * process actor
   * @param actor The actor to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process actors.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processActor(actor);
   * console.log(response);
   * ```
   */
  async processActor(actor: { id: string; name: string }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/actor/process",
        {
          actor,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing actor:", error);
      throw error;
    }
  }

  /**
   * process event
   * @param event The event to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process events.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processEvent(event);
   * console.log(response);
   * ```
   */
  async processEvent(
    event: { id: string; type: string; data: Record<string, unknown> },
  ) {
    try {
      const response = await axios.post(
        "http://localhost:3000/event/process",
        {
          event,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing event:", error);
      throw error;
    }
  }

  /**
   * process metric
   * @param metric The metric to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process metrics.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processMetric(metric);
   * console.log(response);
   * ```
   */
  async processMetric(metric: { id: string; value: number }) {
    try {
      const response = await axios.post(
        "http://localhost:3000/metric/process",
        {
          metric,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing metric:", error);
      throw error;
    }
  }

  /**
   * process exception
   * @param exception The exception to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process exceptions.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processException(exception);
   * console.log(response);
   * ```
   */
  async processException(exception: Error) {
    try {
      const response = await axios.post(
        "http://localhost:3000/exception/process",
        {
          exception,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing exception:", error);
      throw error;
    }
  }

  /**
   * process request
   * @param request The request to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process requests.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processRequest(request);
   * console.log(response);
   * ```
   */
  async processRequest(
    request: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    },
  ) {
    try {
      const response = await axios.post(
        "http://localhost:3000/request/process",
        {
          request,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error processing request:", error);
      throw error;
    }
  }

  /**
   * process response
   * @param res The response to process.
   * @returns A Promise that resolves to the response from the backend.
   * @throws An error if the operation fails.
   * @remarks This method is used to process responses.
   * @example
   * ```typescript
   * const response = await runtimeFacade.processResponse(res);
   * console.log(response);
   * ```
   */
  async processResponse(
    res: {
      status: number;
      data: Record<string, unknown>;
      headers: Record<string, string>;
    },
  ) {
    try {
      const response: { data: { processedResponse: unknown } } = await axios
        .post(
          "http://localhost:3000/response/process",
          {
            response: res,
          },
        );
      return response.data;
    } catch (error) {
      console.error("Error processing response:", error);
      throw error;
    }
  }

  // ... other methods
}
