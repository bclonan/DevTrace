import { createMachine, assign, interpret } from 'xstate';
import { RuntimeFacade } from './services/RuntimeFacade';

export const devTraceMachine = createMachine({
  context: {},
  id: 'devTraceAI',
  initial: 'idle',
  states: {
    idle: {
      on: {
        'start.insightMode': {
          target: 'insightMode',
        },
        'start.flowMode': {
          target: 'flowMode',
        },
        'start.liveTraceMode': {
          target: 'liveTraceMode',
        },
        'start.hotswapMode': {
          target: 'hotswapMode',
        },
      },
      description:
        'The machine is in an idle state, waiting for user interaction to start any mode.',
    },
    insightMode: {
      on: {
        analyze: {
          target: 'insightMode.analyzing',
        },
        exit: {
          target: 'idle',
        },
      },
      initial: 'idle',
      states: {
        idle: {},
        analyzing: {
          invoke: {
            src: 'analyzeCode',
            onDone: {
              target: 'results',
              actions: assign({
                analysisResults: (_, event) => event.data,
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                errorMessage: (_, event) => event.data,
              }),
            },
          },
        },
        results: {},
        error: {},
      },
      description:
        'Aggregates and analyzes runtime issues, providing insights into errors and their potential fixes.',
    },
    flowMode: {
      // ... implementation for flowMode
    },
    liveTraceMode: {
      // ... implementation for liveTraceMode
    },
    hotswapMode: {
      // ... implementation for hotswapMode
    },
  },
},
{
  actions: {
    // ... other actions
  },
  services: {
    analyzeCode: async () => {
      const runtimeFacade = new RuntimeFacade();
      const results = await runtimeFacade.analyzeCode();
      return results;
    },
    // ... other services
  },
});

export const devTraceService = interpret(devTraceMachine)
  .onTransition((state) => console.log(`Current state: ${state.value}`))
  .start();