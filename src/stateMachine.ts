import * as vscode from 'vscode';
import { assign, createActor, createMachine, ProvidedActor, type StateFrom } from "xstate";
import axios from "axios";
import { AIProvider } from "./ai/AIModelFactory";
import { RuntimeFacade } from "./services/RuntimeFacade";
import { NodeAdapter } from "./runtimeAdapters/NodeAdapter";
import type {
  AISuggestion,
  LiveEvent,
  FetchSuggestionsRequest,
  FetchSuggestionsResponse,
  ProcessFlowRequest,
  ProcessFlowResponse,
  StartLiveTraceRequest,
  StartLiveTraceResponse,
  PerformHotswapRequest,
  PerformHotswapResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  ActorTypes,
  MachineActors
} from "./types";

type DevTraceContext = {
  analysisResults?: Record<string, unknown>;
  errorMessage?: string;
  flowResults?: Record<string, unknown>;
  traceResults?: Record<string, unknown>;
  hotswapResults?: Record<string, unknown>;
  currentFile: string | null;
  selectedFunction: string | null;
  liveEvents: LiveEvent[];
  hotswapHistory: Array<{ timestamp: number; details: string }>;
  aiProvider: AIProvider;
  apiKey: string;
  suggestions?: Record<string, AISuggestion>;
  stateId?: string;
  newCode?: string;
};

type DevTraceEvent =
  | { type: "exit" }
  | { type: "start.insightMode" }
  | { type: "start.flowMode" }
  | { type: "start.liveTraceMode" }
  | { type: "start.hotswapMode" }
  | { type: "generateFlow"; functionName: string }
  | { type: "streamLiveEvents" }
  | { type: "rollback"; stateId: string }
  | { type: "applyFix"; stateId: string; newCode: string }
  | { type: "playForward"; stateId: string }
  | { type: "analyze" }
  | { type: "fetchSuggestions"; errorMessage: string }
  | { type: "applySuggestion"; suggestion: AISuggestion }
  | { type: "process"; functionName: string }
  | { type: "trace" }
  | { type: "swap" }
  | { type: "updateCurrentFile"; file: string }
  | { type: "updateSelectedFunction"; functionName: string }
  | { type: "addLiveEvent"; event: LiveEvent }
  | { type: "clearLiveEvents" }
  | { type: "addHotswapHistoryEntry"; entry: { timestamp: number; details: string } }
  | { type: "clearHotswapHistory" }
  | { type: "addSuggestion"; suggestion: AISuggestion }
  | { type: "clearSuggestions" }
  | { type: "setAIProvider"; provider: AIProvider }
  | { type: "setAPIKey"; apiKey: string }
  | { type: "setNewCode"; newCode: string }
  | { type: "setSelectedFunction"; functionName: string }
  | { type: "NEW_DATA"; data: LiveEvent };





export const devTraceMachine = createMachine({
  types: {} as {
    context: DevTraceContext;
    events: DevTraceEvent;
    actors: MachineActors

  },
  id: "devTraceAI",
  context: {
    currentFile: null,
    selectedFunction: null,
    liveEvents: [],
    hotswapHistory: [],
    aiProvider: AIProvider.OpenAI,
    apiKey: "",
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        "start.insightMode": {
          target: "insightMode",
          actions: "startTracing",
        },
        "start.flowMode": "flowMode",
        "start.liveTraceMode": {
          target: "liveTraceMode",
          actions: "startTracing",
        },
        "start.hotswapMode": "hotswapMode",
      },
    },
    insightMode: {
      initial: "idle",
      states: {
        idle: {
          on: { analyze: "analyzing" }
        },
        analyzing: {
          invoke: {
            src: "analyzeCode",
            onDone: {
              target: "results",
              actions: assign({ analysisResults: (_, event: any) => event?.output }),
            },
            onError: {
              target: "error",
              actions: assign({ errorMessage: (_, event: any) => event?.error as string ?? "Unknown error" }),
            },
          },
        },
        results: {
          on: { fetchSuggestions: "fetchingSuggestions" }
        },
        error: {},
        fetchingSuggestions: {
          invoke: {
            src: "fetchSuggestions",
            onDone: {
              target: "suggestionsReceived",
              actions: assign({ suggestions: (_, event: any) => event?.output ?? {} }),
            },
            onError: {
              target: "error",
              actions: assign({ errorMessage: (_, event: any) => (event?.error as string) ?? "Unknown error" }),
            },
          },
        },
        suggestionsReceived: {
          on: { applySuggestion: "applyingSuggestion" }
        },
        applyingSuggestion: {
          invoke: {
            src: "applySuggestion",
            onDone: "results",
            onError: {
              target: "error",
              actions: assign({ errorMessage: (_, event: any) => (event?.error as string) ?? "Unknown error" }),
            },
          },
        },
      },
      on: {
        exit: {
          target: "idle",
          actions: ["stopTracing",
            assign({
              analysisResults: undefined,
              errorMessage: undefined,
            })
          ],
        },
      },
    },
    flowMode: {
      initial: "idle",
      states: {
        idle: {
          on: { process: "processing" }
        },
        processing: {
          invoke: {
            src: "processFlow",
            onDone: {
              target: "completed",
              actions: assign({ flowResults: (_, event: any) => event?.output ?? {} }),
            },
            onError: {
              target: "error",
              actions: assign({ errorMessage: (_, event: any) => event?.error as string }),
            },
          },
        },
        completed: {},
        error: {},
      },
      on: {
        exit: {
          target: "idle",
          actions: assign({
            flowResults: undefined,
            errorMessage: undefined,
          }),
        },
      },
    },
    liveTraceMode: {
      initial: "idle",
      states: {
        idle: {
          on: { trace: "tracing" }
        },
        tracing: {
          invoke: {
            src: "startLiveTrace",
            onDone: {
              target: "completed",
              actions: assign({ traceResults: (_, event: any) => event?.data ?? {} }),
            },
            onError: {
              target: "error",
              actions: assign({ errorMessage: (_, event: any) => (event?.data as string) ?? "Unknown error" }),
            },
          },
          on: {
            NEW_DATA: {
              actions: ["handleNewData", assign((context: any, event: any) => {
                if (event.type === "NEW_DATA") {
                  return {
                    ...context,
                    liveEvents: [...context.liveEvents, event.data]
                  };
                }
                return context;
              })]
            },
            addLiveEvent: {
              target: undefined,
              // actions: [
              //   assign({
              //     liveEvents: (context: DevTraceContext, event: DevTraceEvent & { event: LiveEvent }) => ({
              //       liveEvents: [...context.liveEvents, event.event]
              //     })
              //   })
              // ]
            }
          }
        },
        completed: {},
        error: {},
      },
      on: {
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
    },
    hotswapMode: {
      initial: "idle",
      states: {
        idle: {
          on: { swap: "swapping" }
        },
        swapping: {
          invoke: {
            src: "performHotswap",
            onDone: {
              target: "completed",
              actions: assign({ hotswapResults: (_, event: any) => event?.output ?? {} }),
            },
            onError: {
              target: "error",
              actions: assign({ errorMessage: (_, event: any) => event?.error as string }),
            },
          },
        },
        completed: {},
        error: {},
      },
      on: {
        exit: {
          target: "idle",
          actions: assign({
            hotswapResults: undefined,
            errorMessage: undefined,
          }),
        },
      },
    },
  },
}, {
  actions: {
    startTracing: () => {
      const runtimeFacade = new RuntimeFacade();
      runtimeFacade.startTracing();
    },
    stopTracing: () => {
      const runtimeFacade = new RuntimeFacade();
      runtimeFacade.stopTracing();
    },
    handleNewData: (context, event) => {
      console.log("New data received", event);
    },
  },
  actors: {
    analyzeCode: async () => {
      const runtimeFacade = new RuntimeFacade();
      return await runtimeFacade.analyzeCode();
    },
    processFlow: async (context: DevTraceContext) => {
      const runtimeFacade = new RuntimeFacade();
      if (!context.selectedFunction) throw new Error("No function selected");
      return await runtimeFacade.generateFlowData(context.selectedFunction);
    },
    startLiveTrace: (devTraceActor: any) => {
      const webview = vscode.window.createWebviewPanel(
        "liveTrace",
        "Live Trace",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const runtimeFacade = new RuntimeFacade();
      return runtimeFacade.startLiveTrace(devTraceActor, webview);
    },
    performHotswap: async (context: DevTraceContext) => {
      const runtimeFacade = new RuntimeFacade();
      if (!context.stateId || !context.newCode) {
        throw new Error("Missing hotswap parameters");
      }
      return await runtimeFacade.performHotswap("hotswap", context.stateId, context.newCode);
    },
    applySuggestion: async (context: DevTraceContext, event: { suggestion: Record<string, unknown> }) => {
      const runtimeFacade = new RuntimeFacade();
      if (!context.currentFile) throw new Error("No file selected");
      return await runtimeFacade.applySuggestion(
        context.currentFile,
        JSON.stringify(event.suggestion)
      );
    },
    fetchSuggestions: async (context: DevTraceContext, event: FetchSuggestionsRequest) => {
      const runtimeFacade = new RuntimeFacade();
      if (!context.currentFile) throw new Error("No file selected");

      const request: {
        errorMessage: string;
        filePath: string;
        provider: {
          type: AIProvider;
          apiKey: string;
          temperature: number;
        };
        contextLines: number;
        maxSuggestions: number;
      } = {
        errorMessage: event.errorMessage,
        filePath: context.currentFile,
        provider: {
          type: context.aiProvider,
          apiKey: context.apiKey,
          temperature: 0.7 // Default temperature
        },
        contextLines: 5, // Default context lines
        maxSuggestions: 3 // Default max suggestions
      };

      const response = await runtimeFacade.fetchSuggestions(
        request.errorMessage,
        request.filePath,
        request.provider.type,
        request.provider.apiKey
      );

      return (response as AISuggestion[]).reduce((acc: Record<string, AISuggestion>, suggestion: AISuggestion) => {
        acc[suggestion.id] = {
          id: suggestion.id,
          description: suggestion.description,
          confidence: suggestion.confidence ?? 0,
          type: suggestion.type ?? "fix",
          impact: suggestion.impact ?? "medium",
          codeSnippet: suggestion.codeSnippet ?? "",
          metadata: suggestion.metadata ?? {
            imports: [],
            affectedFunctions: [],
            breakingChanges: false
          }
        };
        return acc;
      }, {} as Record<string, AISuggestion>),
    },
  },
});


export type DevTraceMachineState = StateFrom<typeof devTraceMachine>;
export const devTraceActor = createActor(devTraceMachine);
devTraceActor.start();