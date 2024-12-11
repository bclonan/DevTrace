// src/stateMachine.ts

import EventSource from "eventsource";
import * as vscode from "vscode";
import { assign, createActor, createMachine } from "xstate";
import { AIProvider } from "./ai/AIModelFactory.ts";
import { RuntimeFacade } from "./services/RuntimeFacade.ts";
lunch


/**
 * The DevTrace state machine definition.
 * This machine manages the different states and transitions of the DevTrace AI extension.
 */
interface DevTraceContext {
  analysisResults?: Record<string, unknown>;
  errorMessage?: string;
  flowResults?: Record<string, unknown>;
  traceResults?: Record<string, unknown>;
  hotswapResults?: Record<string, unknown>;
  currentFile: string | null;
  selectedFunction: string | null;
  liveEvents: Record<string, unknown>[];
  hotswapHistory: { timestamp: number; details: string }[];
  aiProvider: AIProvider;
  apiKey: string;
  suggestions?: any;
  // Add other context variables as needed
  userPreferences?: Record<string, unknown>;
  sessionId?: string;
  projectSettings?: Record<string, unknown>;
  activeBreakpoints?: any[];
  debugSession?: any;
  performanceMetrics?: Record<string, unknown>;
  codeSnippets?: Record<string, string>;
  userNotes?: string[];
  activeTheme?: string;
  recentFiles?: string[];
  stateId?: string;
  newCode?: string;
}

export type DevTraceState =
  | { value: "idle"; context: DevTraceContext }
  | { value: "insightMode"; context: DevTraceContext }
  | { value: "insightMode.idle"; context: DevTraceContext }
  | { value: "insightMode.analyzing"; context: DevTraceContext }
  | { value: "insightMode.results"; context: DevTraceContext }
  | { value: "insightMode.error"; context: DevTraceContext }
  | { value: "insightMode.fetchingSuggestions"; context: DevTraceContext }
  | { value: "insightMode.suggestionsReceived"; context: DevTraceContext }
  | { value: "insightMode.applyingSuggestion"; context: DevTraceContext }
  | { value: "flowMode"; context: DevTraceContext }
  | { value: "flowMode.idle"; context: DevTraceContext }
  | { value: "flowMode.processing"; context: DevTraceContext }
  | { value: "flowMode.completed"; context: DevTraceContext }
  | { value: "flowMode.error"; context: DevTraceContext }
  | { value: "liveTraceMode"; context: DevTraceContext }
  | { value: "liveTraceMode.idle"; context: DevTraceContext }
  | { value: "liveTraceMode.tracing"; context: DevTraceContext }
  | { value: "liveTraceMode.completed"; context: DevTraceContext }
  | { value: "liveTraceMode.error"; context: DevTraceContext }
  | { value: "hotswapMode"; context: DevTraceContext }
  | { value: "hotswapMode.idle"; context: DevTraceContext }
  | { value: "hotswapMode.swapping"; context: DevTraceContext }
  | { value: "hotswapMode.completed"; context: DevTraceContext }
  | { value: "hotswapMode.error"; context: DevTraceContext };

// Define the type for the state machine's events
export type DevTraceEvent =
  | { type: "exit" }
  | { type: "start.insightMode" }
  | { type: "start.flowMode" }
  | { type: "start.liveTraceMode" }
  | { type: "start.hotswapMode" }
  | { type: "analyze" }
  | { type: "fetchSuggestions" }
  | { type: "applySuggestion"; suggestion: string }
  | { type: "process"; data: { functionName: string } }
  | { type: "trace" }
  | { type: "swap" }
  | { type: "rollback"; stateId: string }
  | { type: "applyFix"; stateId: string; newCode: string }
  | { type: "playForward"; stateId: string }
  | { type: "streamLiveEvents" }
  | { type: "generateFlow"; functionName: string }
  | {
    type: "stateChanged";
    state: string;
    liveEvents: any;
    errorMessage: string;
  }
  | { type: "liveEvents"; event: Record<string, unknown> }
  | { type: "error"; errorMessage: string }
  | { type: "entry"; entry: any }
  | { type: "exit"; exit: any }
  | { type: "event"; event: any }
  | { type: "fetchSuggestions"; errorMessage: string }
  | { type: "applySuggestion"; suggestion: any }
  | { type: "updateCurrentFile"; file: string }
  | { type: "updateSelectedFunction"; functionName: string }
  | { type: "addLiveEvent"; event: any }
  | { type: "clearLiveEvents" }
  | { type: "addHotswapHistoryEntry"; entry: any }
  | { type: "clearHotswapHistory" };


export const devTraceMachine = createMachine<
  DevTraceContext,
  DevTraceEvent,
  DevTraceTypeState
>(
  {
    /**
     * The machine context.
     * Holds variables that can be accessed across different states and actions.
     */
    context: {
      analysisResults: undefined,
      errorMessage: undefined,
      flowResults: undefined,
      traceResults: undefined,
      hotswapResults: undefined,
      // Add other context variables as needed, e.g.,
      currentFile: null as string | null, // Currently active file in the editor
      selectedFunction: null, // Currently selected function for flow analysis
      liveEvents: [], // Array to store live events
      hotswapHistory: [], // Array to store hotswap history
      aiProvider: "openai" as AIProvider, // Default AI provider
      apiKey: "", // API key for the AI provider
      suggestions: undefined, // Suggestions from the AI provider
    },
    /**
     * The unique identifier for the machine.
     */
    id: "devTraceAI",
    /**
     * The initial state of the machine.
     */
    initial: "idle",
    /**
     * The states of the machine.
     */
    states: {
      /**
       * The idle state.
       * The extension is not actively tracing or analyzing.
       */
      idle: {
        on: {
          /**
           * Transition to `insightMode` when the 'start.insightMode' event is received.
           */
          "start.insightMode": {
            target: "insightMode",
            actions: "startTracing", // Start tracing when entering insightMode
          },
          /**
           * Transition to `flowMode` when the 'start.flowMode' event is received.
           */
          "start.flowMode": {
            target: "flowMode",
          },
          /**
           * Transition to `liveTraceMode` when the 'start.liveTraceMode' event is received.
           */
          "start.liveTraceMode": {
            target: "liveTraceMode",
            actions: "startTracing", // Start tracing when entering liveTraceMode
          },
          /**
           * Transition to `hotswapMode` when the 'start.hotswapMode' event is received.
           */
          "start.hotswapMode": {
            target: "hotswapMode",
          },
        },
        /**
         * Description of the idle state.
         */
        description:
          "The machine is in an idle state, waiting for user interaction to start any mode.",
      },
      /**
       * The insightMode state.
       * The extension is actively analyzing code for potential issues.
       */
      insightMode: {
        on: {
          /**
           * Transition to `insightMode.analyzing` when the 'analyze' event is received.
           */
          analyze: {
            target: "insightMode.analyzing",
          },
          /**
           * Transition to `idle` when the 'exit' event is received.
           */
          exit: {
            target: "idle",
            actions: [
              "stopTracing",
              assign({
                analysisResults: undefined,
                errorMessage: undefined,
              }),
            ],
          },
        },
        /**
         * The initial state within `insightMode`.
         */
        initial: "idle",
        /**
         * The nested states within `insightMode`.
         */
        states: {
          /**
           * The idle state within `insightMode`.
           */
          idle: {},
          /**
           * The analyzing state within `insightMode`.
           * The extension is actively making an API call to analyze the code.
           */
          analyzing: {
            /**
             * Invoke the `analyzeCode` service to perform the analysis.
             */
            invoke: {
              src: "analyzeCode",
              /**
               * When the service finishes successfully, transition to `results`.
               */
              onDone: {
                target: "results",
                /**
                 * Assign the analysis results to the `analysisResults` context variable.
                 */
                actions: assign({
                  analysisResults: (
                    _,
                    event: { data: Record<string, unknown> },
                  ) => event ? event.data : undefined,
                }),
              },
              /**
               * When the service encounters an error, transition to `error`.
               */
              onError: {
                target: "error",
                /**
                 * Assign the error message to the `errorMessage` context variable.
                 */
                actions: assign({
                  errorMessage: (_, event: { data: string }) =>
                    event ? event.data : undefined,
                }),
              },
            },
          },
          /**
           * The results state within `insightMode`.
           * The analysis results are available.
           */
          results: {
            on: {
              /**
               * Transition to `insightMode.fetchingSuggestions` when the 'fetchSuggestions' event is received.
               */
              fetchSuggestions: {
                target: "fetchingSuggestions",
              },
            },
          },
          /**
           * The error state within `insightMode`.
           * An error occurred during analysis.
           */
          error: {},
          /**
           * The fetchingSuggestions state within `insightMode`.
           * The extension is fetching suggestions from the AI provider.
           */
          fetchingSuggestions: {
            invoke: {
              src: "fetchSuggestions",
              onDone: {
                target: "suggestionsReceived",
                actions: assign({
                  suggestions: (_, event: { data: Record<string, unknown> }) =>
                    event ? event.data : undefined,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event: { data: string }) =>
                    event ? event.data : undefined,
                }),
              },
            },
          },
          /**
           * The suggestionsReceived state within `insightMode`.
           * The suggestions from the AI provider are available.
           */
          suggestionsReceived: {
            on: {
              /**
               * Transition to `insightMode.applyingSuggestion` when the 'applySuggestion' event is received.
               */
              applySuggestion: {
                target: "applyingSuggestion",
              },
            },
          },
          /**
           * The applyingSuggestion state within `insightMode`.
           * The extension is applying the selected suggestion to the code.
           */
          applyingSuggestion: {
            invoke: {
              src: "applySuggestion",
              onDone: {
                target: "results",
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event: { data: string }) =>
                    event ? event.data : undefined,
                }),
              },
            },
          },
        },
        /**
         * Description of the insightMode state.
         */
        description:
          "Aggregates and analyzes runtime issues, providing insights into errors and their potential fixes.",
      },
      /**
       * The flowMode state.
       * The extension is visualizing the execution flow of the code.
       */
      flowMode: {
        initial: "idle",
        states: {
          idle: {},
          processing: {
            invoke: {
              src: "processFlow",
              onDone: {
                target: "completed",
                actions: assign({
                  flowResults: (_, event: { data: Record<string, unknown> }) =>
                    event ? event.data : undefined,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event: { data: string }) =>
                    event ? event.data : undefined,
                }),
              },
            },
          },
          completed: {},
          error: {},
        },
        on: {
          process: {
            target: "flowMode.processing",
          },
          exit: {
            target: "idle",
            actions: assign({
              flowResults: undefined,
              errorMessage: undefined,
            }),
          },
        },
        description: "Handles the flow of data and processes it accordingly.",
      },
      /**
       * The liveTraceMode state.
       * The extension is providing real-time diagnostics.
       */
      liveTraceMode: {
        initial: "idle",
        states: {
          idle: {},
          tracing: {
            invoke: {
              src: "startLiveTrace",
              onDone: {
                target: "completed",
                actions: assign({
                  traceResults: (_, event: { data: Record<string, unknown> }) =>
                    event ? event.data : undefined,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event: { data: string }) =>
                    event ? event.data : undefined,
                }),
              },
            },
          },
          completed: {},
          error: {},
        },
        on: {
          trace: {
            target: "liveTraceMode.tracing",
          },
          exit: {
            target: "idle",
            actions: [
              "stopTracing",
              assign({
                traceResults: undefined,
                errorMessage: undefined,
              }),
            ],
          },
        },
        description:
          "Executes live tracing of the application, capturing real-time data.",
      },
      /**
       * The hotswapMode state.
       * The extension is enabling hotswapping of code.
       */
      hotswapMode: {
        initial: "idle",
        states: {
          idle: {},
          swapping: {
            invoke: {
              src: "performHotswap",
              onDone: {
                target: "completed",
                actions: assign({
                  hotswapResults: (
                    _,
                    event: { data: Record<string, unknown> },
                  ) => event ? event.data : undefined,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event: { data: string }) =>
                    event ? event.data : undefined,
                }),
              },
            },
          },
          completed: {},
          error: {},
        },
        on: {
          swap: {
            target: "hotswapMode.swapping",
          },
          exit: {
            target: "idle",
            actions: assign({
              hotswapResults: undefined,
              errorMessage: undefined,
            }),
          },
        },
        description:
          "Performs a hotswap of the application, allowing for live updates without restarting.",
      },
    },
  },
  {
    /**
     * Actions that can be executed in response to events.
     */
    actions: {
      /**
       * Action to start tracing.
       */
      startTracing: () => {
        // Call the RuntimeFacade to start the tracing process
        const runtimeFacade = new RuntimeFacade();
        runtimeFacade.startTracing();
        // ... any other actions needed to start tracing
      },
      /**
       * Action to stop tracing.
       */
      stopTracing: () => {
        // Call the RuntimeFacade to stop the tracing process
        const runtimeFacade = new RuntimeFacade();
        runtimeFacade.stopTracing();
        // ... any other actions needed to stop tracing
      },
      /**
       * Action to analyze code.
       */
      // Removed analyzeCode from actions
      /**
       * Action to process flow.
       */
      processFlow: async (context: DevTraceContext) => {
        // Call the RuntimeFacade to process the flow
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.generateFlowData(
          context.selectedFunction ?? "",
        );
        // ... any other actions needed to process the flow
        return results;
      },
      /**
       * Action to start live trace.
       */
      startLiveTrace: async (context: DevTraceContext) => {
        // Call the RuntimeFacade to start live trace
        const runtimeFacade = new RuntimeFacade();
        // Assuming webviewView is accessible in this context
        const webviewView = vscode.window.tabGroups.activeTabGroup.activeTab?.webviewView;

  if (context.currentFile && context.selectedFunction && webviewView) {
    runtimeFacade.startLiveTrace(
      {
        subscribe: (callback) => {
          // Establish a connection to the backend to stream live events
          const eventSource = new EventSource("http://localhost:3000/live");

          // Listen for incoming events
          eventSource.onmessage = (event: { type: string; event: Record<string, unknown> }) => {
            const liveEvent = event.event;
           // callback({ type: "liveEvents", event: liveEvent });
           console.log("Live event received:", liveEvent);
          };

          // Handle errors
          eventSource.onerror = (error) => {
            console.error("Error streaming live events:", error);
            // Optionally, send an error event to the state machine
            // callback({ type: 'error', errorMessage: 'Error streaming live events' });
          };
        },
        send: () => {
          // Here, you can handle messages sent from the state machine
          // and send them to the RuntimeFacade
          // For example:
          // if (message.type === 'stopTracing') {
          //   runtimeFacade.stopTracing();
          // }
        },
      },
      webviewView,
          );
        } else {
          throw new Error(
            "currentFile or selectedFunction or webviewView is null",
          );
        }
      },
      /**
       * Action to perform hotswap.
       */
      performHotswap: async (context: DevTraceContext) => {
        // Call the RuntimeFacade to perform hotswap
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.performHotswap(
          context.stateId ?? "", // Provide a default value if stateId is undefined
          context.newCode ?? "", // Provide a default value if newCode is undefined
        );
        // ... any other actions needed to perform hotswap
        return results;
      },
      /**
       * Action to update the current file in the context.
       */
      updateCurrentFile: assign({
        currentFile: (_, event: { file?: string }) => event?.file ?? null,
      }),

      /**
       * Action to update the selected function in the context.
       */
      updateSelectedFunction: assign({
        selectedFunction: (_, event: { functionName?: string }) =>
          event?.functionName ?? null,
      }),

      /**
       * Action to add a live event to the context.
       */
      addLiveEvent: assign({
        liveEvents: (
          context,
          event: { type: "addLiveEvent"; event: Record<string, unknown> },
        ) => [
          ...((context as unknown) as DevTraceContext).liveEvents,
          event.event,
        ],
      }),

      /**
       * Action to clear live events in the context.
       */
      clearLiveEvents: assign({
        liveEvents: [],
      }),

      /**
       * Action to add an entry to the hotswap history in the context.
       */
      addHotswapHistoryEntry: assign({
        hotswapHistory: (
          context,
          event,
        ) => [
          ...((context as unknown) as DevTraceContext).hotswapHistory,
          (event as { entry: { timestamp: number; details: string } }).entry,
        ],
      }),

      /**
       * Action to clear hotswap history in the context.
       */
      clearHotswapHistory: assign({
        hotswapHistory: [],
      }),
    },
    /**
     * Services that can be invoked by the machine.
     */
    services: {
      analyzeCode: () => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const results = await runtimeFacade.analyzeCode();
          return results;
        },
        id: "analyzeCodeActor", // Give the actor an ID
      }),
      processFlow: (context: DevTraceContext) => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const results = await runtimeFacade.generateFlowData(
            context.selectedFunction ?? "",
          );
          return results;
        },
        id: "processFlowActor",
      }),
      startLiveTrace: () => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const results = await runtimeFacade.startLiveTrace();
          return results;
        },
        id: "startLiveTraceActor",
      }),
      performHotswap: () => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const results = await runtimeFacade.performHotswap();
          return results;
        },
        id: "performHotswapActor",
      }),
      fetchSuggestions: (
        context: {
          currentFile: string | null;
          aiProvider: string;
          apiKey: string;
        },
        event: { errorMessage: string },
      ) => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const suggestions = await runtimeFacade.fetchSuggestions(
            event.errorMessage,
            context.currentFile ?? "",
            context.aiProvider as AIProvider,
            context.apiKey,
          );
          return suggestions;
        },
        id: "fetchSuggestionsActor",
      }),
      applySuggestion: (
        context: DevTraceContext,
        event: { suggestion: Record<string, unknown> },
      ) => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const result = await runtimeFacade.applySuggestion(
            context.currentFile ?? "",
            event.suggestion,
          );
          return result;
        },
        id: "applySuggestionActor",
      }),
    },
  },
);

/**
 * The DevTrace state machine actor.
 * This actor is used to interpret the state machine and manage its execution.
 */
let devTraceActor = createActor(devTraceMachine, {
  id: "devTraceActor", // Assign an ID to the actor
  logger: (event: DevTraceEvent) => console.log("Event:", event),
});



// You can now start the actor using devTraceActor.start()
// and interact with it using devTraceActor.send()

export const devTraceService = devTraceActor.start();
