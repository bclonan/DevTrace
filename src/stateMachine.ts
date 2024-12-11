// src/stateMachine.ts

import { assign, createActor, createMachine } from "xstate";
import { AIProvider } from "./ai/AIModelFactory.ts";
import { RuntimeFacade } from "./services/RuntimeFacade.ts";

export interface LiveEvent {
  eventId: string;
  type: string;
  message: string;
  filePath: string;
  lineNumber: number;
  timestamp: Date;
  suggestedFix?: {
    description: string;
    codeSnippet: string;
  };
}


export interface DevTraceContext {
  analysisResults?: Record<string, unknown>;
  errorMessage?: string;
  flowResults?: Record<string, unknown>;
  traceResults?: Record<string, unknown>;
  hotswapResults?: Record<string, unknown>;
  currentFile: string | null;
  selectedFunction: string | null;
  liveEvents: LiveEvent[];
  hotswapHistory: { timestamp: number; details: string }[];
  aiProvider: AIProvider;
  apiKey: string;
  suggestions?: Record<string, AISuggestion>; // Adjust type if necessary
  // Add other context variables as needed
  userPreferences?: Record<string, unknown>;
  sessionId?: string;
  projectSettings?: Record<string, unknown>;
  activeBreakpoints?: { id: string; line: number; enabled: boolean }[]; // Adjust type as needed
  debugSession?: {
    sessionId: string;
    isActive: boolean;
    startTime: Date;
    endTime?: Date;
  };
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

export type DevTraceEvent =
  | { type: "exit" }
  | { type: "start.insightMode" }
  | { type: "start.flowMode" }
  | { type: "start.liveTraceMode" }
  | { type: "start.hotswapMode" }
  | { type: "analyze" }
  | { type: "fetchSuggestions" }
  | { type: "applySuggestion"; suggestion: any }
  | { type: "process"; data: { functionName: string } }
  | { type: "trace" }
  | { type: "swap" }
  | { type: "rollback"; stateId: string }
  | { type: "applyFix"; stateId: string; newCode: string }
  | { type: "playForward"; stateId: string }
  | { type: "streamLiveEvents" }
  | { type: "generateFlow"; functionName: string }
  | { type: "stateChanged"; state: string; liveEvents: any; errorMessage: string }
  | { type: "liveEvents"; event: Record<string, unknown> }
  | { type: "error"; errorMessage: string }
  | { type: "updateCurrentFile"; file: string }
  | { type: "updateSelectedFunction"; functionName: string }
  | { type: "addLiveEvent"; event: any }
  | { type: "clearLiveEvents" }
  | { type: "addHotswapHistoryEntry"; entry: { timestamp: number; details: string } }
  | { type: "clearHotswapHistory" }
  | { type: "NEW_DATA"; data: any };


export const devTraceMachine = createMachine<DevTraceContext, DevTraceEvent>(
  {
    context: {
      analysisResults: undefined,
      errorMessage: undefined,
      flowResults: undefined,
      traceResults: undefined,
      hotswapResults: undefined,
      currentFile: null,
      selectedFunction: null,
      liveEvents: [],
      hotswapHistory: [],
      aiProvider: "openai" as AIProvider,
      apiKey: "",
      suggestions: undefined,
    },
    id: "devTraceAI",
    initial: "idle",
    states: {
      idle: {
        on: {
          "start.insightMode": {
            target: "insightMode",
            actions: "startTracing",
          },
          "start.flowMode": {
            target: "flowMode",
          },
          "start.liveTraceMode": {
            target: "liveTraceMode",
            actions: "startTracing",
          },
          "start.hotswapMode": {
            target: "hotswapMode",
          },
        },
        description:
          "The machine is in an idle state, waiting for user interaction to start any mode.",
      },
      insightMode: {
        on: {
          analyze: {
            target: "insightMode.analyzing",
          },
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
        initial: "idle",
        states: {
          idle: {},
          analyzing: {
            invoke: {
              src: "analyzeCode",
              onDone: {
                target: "results",
                actions: assign({
                  analysisResults: (
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
          results: {
            on: {
              fetchSuggestions: {
                target: "fetchingSuggestions",
              },
            },
          },
          error: {},
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
          suggestionsReceived: {
            on: {
              applySuggestion: {
                target: "applyingSuggestion",
              },
            },
          },
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
        description:
          "Aggregates and analyzes runtime issues, providing insights into errors and their potential fixes.",
      },
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
            on: {
              addLiveEvent: { actions: "addLiveEvent" },
              error: {
                actions: assign({
                  errorMessage: (_, event: { data: { errorMessage: string } }) =>
                    event ? event.data.errorMessage : undefined,
                }),
              },
              NEW_DATA: { actions: "handleNewData" },
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
        description: "Executes live tracing of the application, capturing real-time data.",
      },
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
    services: {
      analyzeCode: async () => {
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.analyzeCode();
        return results;
      },
      processFlow: async (context: DevTraceContext): Promise<Record<string, unknown>> => {
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.generateFlowData(
          context.selectedFunction ?? "",
        );
        return results;
      },
      startLiveTrace: () => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const results = await runtimeFacade.startLiveTrace({
            subscribe: (callback) => {
              devTraceActor.subscribe((state) => {
                callback({
                  value: state.value as string,
                  context: {
                    liveEvents: state.context.liveEvents as unknown as LiveEvent[],
                    errorMessage: state.context.errorMessage as string,
                  },
                });
              });
            },
            send: (message: { type: string }) => devTraceActor.send(message as DevTraceEvent),
          }, { webview: { postMessage: () => { }, onDidReceiveMessage: () => { } } });
          return results;
        },
        id: "startLiveTraceActor",
      }),
      performHotswap: async (context: DevTraceContext): Promise<Record<string, unknown>> => {
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.performHotswap(
          "hotswap",
          context.stateId ?? "",
          context.newCode ?? "",
        );
        return results;
      },
      fetchSuggestions: async (context: DevTraceContext, event: { errorMessage: string }): Promise<Record<string, { id: string; description: string }>> => {
        const runtimeFacade = new RuntimeFacade();
        const suggestions = await runtimeFacade.fetchSuggestions(
          event.errorMessage,
          context.currentFile ?? "",
          context.aiProvider,
          context.apiKey,
        );
        return suggestions.reduce((acc, suggestion) => {
          acc[suggestion.id] = suggestion;
          return acc;
        }, {} as Record<string, { id: string; description: string }>);
      },
      applySuggestion: async (context: DevTraceContext, event: { suggestion: Record<string, unknown> }) => {
        const runtimeFacade = new RuntimeFacade();
        const result = await runtimeFacade.applySuggestion(
          context.currentFile ?? "",
          JSON.stringify(event.suggestion),
        );
        return result;
      },
    },
    actions: {
      startTracing: () => {
        const runtimeFacade = new RuntimeFacade();
        runtimeFacade.startTracing();
      },
      stopTracing: () => {
        const runtimeFacade = new RuntimeFacade();
        runtimeFacade.stopTracing();
      },
      updateCurrentFile: assign({
        currentFile: (_, event: { file?: string }) => event?.file ?? null,
      }),
      updateSelectedFunction: assign({
        selectedFunction: (_, event: { functionName?: string }) =>
          event?.functionName ?? null,
      }),
      addLiveEvent: assign({
        liveEvents: (context: DevTraceContext, event: { type: "addLiveEvent"; event: Record<string, unknown> }) => [
          ...context.liveEvents,
          event.event,
        ],
      }),
      clearLiveEvents: assign({
        liveEvents: [],
      }),
      addHotswapHistoryEntry: assign({
        hotswapHistory: (context: DevTraceContext, event) => [
          ...context.hotswapHistory,
          (event as { entry: { timestamp: number; details: string } }).entry,
        ],
      }),
      clearHotswapHistory: assign({
        hotswapHistory: [],
      }),
      // Add handleNewData action if needed
      handleNewData: () => {
        // Implement handling of NEW_DATA event
      },
    },
  },
);

export const devTraceActor = createActor(devTraceMachine, {
  id: "devTraceActor",
  logger: (event: DevTraceEvent) => console.log("Event:", event),
});
