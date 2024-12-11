// src/stateMachine.ts

import { assign, createActor, createMachine } from "xstate";
import { RuntimeFacade } from "./services/RuntimeFacade";

/**
 * The DevTrace state machine definition.
 * This machine manages the different states and transitions of the DevTrace AI extension.
 */
export const devTraceMachine = createMachine(
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
      currentFile: null, // Currently active file in the editor
      selectedFunction: null, // Currently selected function for flow analysis
      liveEvents: [], // Array to store live events
      hotswapHistory: [], // Array to store hotswap history
      aiProvider: "openai", // Default AI provider
      apiKey: "", // API key for the AI provider
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
                  analysisResults: (_, event) => event.data,
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
                  errorMessage: (_, event) => event.data,
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
                  suggestions: (_, event) => event.data,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event) => event.data,
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
                  errorMessage: (_, event) => event.data,
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
                  flowResults: (_, event) => event.data,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event) => event.data,
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
                  traceResults: (_, event) => event.data,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event) => event.data,
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
                  hotswapResults: (_, event) => event.data,
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  errorMessage: (_, event) => event.data,
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
      analyzeCode: async () => {
        // Call the RuntimeFacade to analyze the code
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.analyzeCode();
        // ... any other actions needed to analyze the code
        return results;
      },
      /**
       * Action to process flow.
       */
      processFlow: async () => {
        // Call the RuntimeFacade to process the flow
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.processFlow();
        // ... any other actions needed to process the flow
        return results;
      },
      /**
       * Action to start live trace.
       */
      startLiveTrace: async () => {
        // Call the RuntimeFacade to start live trace
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.startLiveTrace();
        // ... any other actions needed to start live trace
        return results;
      },
      /**
       * Action to perform hotswap.
       */
      performHotswap: async () => {
        // Call the RuntimeFacade to perform hotswap
        const runtimeFacade = new RuntimeFacade();
        const results = await runtimeFacade.performHotswap();
        // ... any other actions needed to perform hotswap
        return results;
      },
      /**
       * Action to update the current file in the context.
       */
      updateCurrentFile: assign({
        currentFile: (_, event) => event.file,
      }),

      /**
       * Action to update the selected function in the context.
       */
      updateSelectedFunction: assign({
        selectedFunction: (_, event) => event.functionName,
      }),

      /**
       * Action to add a live event to the context.
       */
      addLiveEvent: assign({
        liveEvents: (context, event) => [...context.liveEvents, event.event],
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
        ) => [...context.hotswapHistory, event.entry],
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
      processFlow: () => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const results = await runtimeFacade.processFlow();
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
      fetchSuggestions: (context, event) => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const suggestions = await runtimeFacade.fetchSuggestions(
            event.errorMessage,
            context.currentFile,
            context.aiProvider,
            context.apiKey,
          );
          return suggestions;
        },
        id: "fetchSuggestionsActor",
      }),
      applySuggestion: (context, event) => ({
        src: async () => {
          const runtimeFacade = new RuntimeFacade();
          const result = await runtimeFacade.applySuggestion(
            context.currentFile,
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
export const devTraceActor = createActor(devTraceMachine, {
  id: "devTraceActor", // Assign an ID to the actor
  // ... other configuration options for the actor, e.g.,
  devTools: true, // Enable devtools for debugging (if available in your environment)
  logger: (event) => console.log("Event:", event), // Custom logger
});

// You can now start the actor using devTraceActor.start()
// and interact with it using devTraceActor.send()
