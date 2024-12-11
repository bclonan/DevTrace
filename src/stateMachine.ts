import { assign, createMachine, interpret, type StateFrom } from 'xstate';
import { AIProvider } from './ai/AIModelFactory';
import { RuntimeFacade } from './services/RuntimeFacade';
import type {
  AISuggestion,
  DevTraceContext,
  FetchSuggestionsRequest
} from './types';
import { DevTraceEvent } from './types.d';

const runtimeFacade = new RuntimeFacade();

export const devTraceMachine = createMachine({
  types: {
    context: {} as DevTraceContext,
    events: {} as DevTraceEvent,
    actors: {} as any,
  },
  id: 'devTraceAI',
  context: {
    currentFile: null,
    selectedFunction: null,
    liveEvents: [],
    hotswapHistory: [],
    aiProvider: AIProvider.OpenAI,
    apiKey: '',
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        'start.insightMode': {
          target: 'insightMode',
          actions: 'startTracing',
        },
        'start.flowMode': 'flowMode',
        'start.liveTraceMode': {
          target: 'liveTraceMode',
          actions: 'startTracing',
        },
        'start.hotswapMode': 'hotswapMode',
      },
    },
    insightMode: {
      initial: 'idle',
      states: {
        idle: {
          on: { analyze: 'analyzing' }
        },
        analyzing: {
          invoke: {
            src: 'analyzeCode',
            onDone: {
              target: 'results',
              actions: assign({ analysisResults: (_, event: any) => event.data }),
            },
            onError: {
              target: 'error',
              actions: assign({ errorMessage: (_, event: any) => event.data ?? 'Unknown error' }),
            },
          },
        },
        results: {
          on: { fetchSuggestions: 'fetchingSuggestions' }
        },
        error: {},
        fetchingSuggestions: {
          invoke: {
            src: 'fetchSuggestions',
            onDone: {
              target: 'suggestionsReceived',
              actions: assign({ suggestions: (_, event: any) => event.data ?? {} }),
            },
            onError: {
              target: 'error',
              actions: assign({ errorMessage: (_, event: any) => event.data ?? 'Unknown error' }),
            },
          },
        },
        suggestionsReceived: {
          on: { applySuggestion: 'applyingSuggestion' }
        },
        applyingSuggestion: {
          invoke: {
            src: 'applySuggestion',
            onDone: 'results',
            onError: {
              target: 'error',
              actions: assign({ errorMessage: (_, event: any) => event.data ?? 'Unknown error' }),
            },
          },
        },
      },
      on: {
        exit: {
          target: 'idle',
          actions: [
            'stopTracing',
            assign({
              analysisResults: undefined,
              errorMessage: undefined,
            })
          ],
        },
      },
    },
    flowMode: {
      initial: 'idle',
      states: {
        idle: {
          on: { process: 'processing' }
        },
        processing: {
          invoke: {
            src: 'processFlow',
            onDone: {
              target: 'completed',
              actions: assign({ flowResults: (_, event: any) => event.data ?? {} }),
            },
            onError: {
              target: 'error',
              actions: assign({ errorMessage: (_, event: any) => event.data }),
            },
          },
        },
        completed: {},
        error: {},
      },
      on: {
        exit: {
          target: 'idle',
          actions: assign({
            flowResults: undefined,
            errorMessage: undefined,
          }),
        },
      },
    },
    liveTraceMode: {
      initial: 'idle',
      states: {
        idle: {
          on: { trace: 'tracing' }
        },
        tracing: {
          invoke: {
            src: 'startLiveTrace',
            onDone: {
              target: 'completed',
              actions: assign({ traceResults: (_, event: any) => event.data ?? {} }),
            },
            onError: {
              target: 'error',
              actions: assign({ errorMessage: (_, event: any) => event.data ?? 'Unknown error' }),
            },
          },
          on: {
            NEW_DATA: {
              actions: [
                'handleNewData',
                assign((context: any, event: any) => {
                  if (event.type === 'NEW_DATA') {
                    return {
                      ...context,
                      liveEvents: [...context.liveEvents, event.data]
                    };
                  }
                  return context;
                })
              ]
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
          target: 'idle',
          actions: [
            'stopTracing',
            assign({
              traceResults: undefined,
              errorMessage: undefined,
            }),
          ],
        },
      },
    },
    hotswapMode: {
      initial: 'idle',
      states: {
        idle: {
          on: { swap: 'swapping' }
        },
        swapping: {
          invoke: {
            src: 'performHotswap',
            onDone: {
              target: 'completed',
              actions: assign({ hotswapResults: (_, event: any) => event.data ?? {} }),
            },
            onError: {
              target: 'error',
              actions: assign({ errorMessage: (_, event: any) => event.data }),
            },
          },
        },
        completed: {},
        error: {},
      },
      on: {
        exit: {
          target: 'idle',
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
      runtimeFacade.startTracing();
    },
    stopTracing: () => {
      runtimeFacade.stopTracing();
    },
    handleNewData: (event) => {
      console.log('New data received', event);
    },
  },
  actors: {
    analyzeCode: async () => {
      return await runtimeFacade.analyzeCode();
    },
    processFlow: async (context: DevTraceContext) => {
      if (!context.selectedFunction) throw new Error('No function selected');
      return await runtimeFacade.generateFlowData(context.selectedFunction);
    },
    startLiveTrace: async () => {
      return await runtimeFacade.startLiveTrace();
    },
    performHotswap: async (context: DevTraceContext) => {
      if (!context.stateId || !context.newCode) {
        throw new Error('Missing hotswap parameters');
      }
      return await runtimeFacade.performHotswap(context.stateId, context.newCode);
    },
    applySuggestion: async (context: DevTraceContext, event: { suggestion: AISuggestion }) => {
      if (!context.currentFile) throw new Error('No file selected');
      return await runtimeFacade.applySuggestion(context.currentFile, event.suggestion);
    },
    fetchSuggestions: async (context: DevTraceContext, event: FetchSuggestionsRequest) => {
      if (!context.currentFile) throw new Error('No file selected');

      const request: FetchSuggestionsRequest = {
        errorMessage: event.errorMessage,
        filePath: context.currentFile,
        provider: {
          type: context.aiProvider,
          apiKey: context.apiKey,
        },
        contextLines: 5, // Default context lines
        maxSuggestions: 3, // Default max suggestions
      };

      const response = await runtimeFacade.fetchSuggestions(request);
      return response.suggestions;
    },
  },
});

export type DevTraceMachineState = StateFrom<typeof devTraceMachine>;
export const devTraceActor = interpret(devTraceMachine);
devTraceActor.start();