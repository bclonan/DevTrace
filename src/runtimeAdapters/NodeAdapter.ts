// src/runtimeAdapters/NodeAdapter.ts

import { LanguageRuntimeAdapter } from '../LanguageRuntimeAdapter';
import { createRequire } from 'node:module';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library

const require = createRequire(import.meta.url);
const asyncHooks = require('async_hooks');

/**
 * The Node.js runtime adapter.
 * Provides methods for instrumenting and interacting with Node.js code.
 */
export class NodeAdapter implements LanguageRuntimeAdapter {
  private asyncHook: any;
  private currentFunction: { asyncId: string; name: string; args: any[] } | null = null; // Use string for asyncId

  /**
   * Starts tracing Node.js code execution.
   */
  startTracing() {
    this.asyncHook = asyncHooks.createHook({
      init: (asyncId, type, triggerAsyncId, resource) => {
        if (type === 'FUNCTION') {
          this.currentFunction = {
            asyncId: uuidv4(), // Generate UUID for asyncId
            name: resource.name,
            args: resource.args,
          };
        }
      },
      before: (asyncId) => {
        if (this.currentFunction && this.currentFunction.asyncId === asyncId) {
          console.log(`Entering function: ${this.currentFunction.name}(${JSON.stringify(this.currentFunction.args)})`);
        }
      },
      after: (asyncId) => {
        if (this.currentFunction && this.currentFunction.asyncId === asyncId) {
          console.log(`Exiting function: ${this.currentFunction.name}`);
        }
      },
      destroy: (asyncId) => {
        if (this.currentFunction && this.currentFunction.asyncId === asyncId) {
          this.currentFunction = null;
        }
      },
    });

    this.asyncHook.enable();
    console.log('Tracing started');
  }

  // ... (other methods remain the same)

  /**
   * Captures an exception.
   * @param error The exception object.
   */
  captureException(error: Error) {
    const exceptionEntry = {
      timestamp: new Date(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      function: this.currentFunction ? this.currentFunction.name : 'global',
    };
    console.log('Exception captured:', exceptionEntry);
  }

  /**
   * Captures a performance metric.
   * @param name The name of the metric.
   * @param value The value of the metric.
   */
  capturePerformanceMetric(name: string, value: number) {
    const metricEntry = {
      timestamp: new Date(),
      name,
      value,
      function: this.currentFunction ? this.currentFunction.name : 'global',
    };
    console.log('Performance metric captured:', metricEntry);
  }

   /**
   * Captures a network request.
   * @param url The URL of the request.
   * @param method The HTTP method (GET, POST, etc.).
   * @param startTime The start time of the request.
   * @param endTime The end time of the request.
   * @param statusCode The HTTP status code of the response.
   */
  captureNetworkRequest(url: string, method: string, startTime: number, endTime: number, statusCode: number) {
    const requestEntry = {
      timestamp: new Date(),
      url,
      method,
      duration: endTime - startTime,
      statusCode,
      function: this.currentFunction ? this.currentFunction.name : 'global',
    };
    console.log('Network request captured:', requestEntry);
  }

  /**
   * Captures a database query.
   * @param query The SQL query string.
   * @param startTime The start time of the query.
   * @param endTime The end time of the query.
   * @param rowsAffected The number of rows affected by the query.
   */
  captureDatabaseQuery(query: string, startTime: number, endTime: number, rowsAffected: number) {
    const queryEntry = {
      timestamp: new Date(),
      query,
      duration: endTime - startTime,
      rowsAffected,
      function: this.currentFunction ? this.currentFunction.name : 'global',
    };
    console.log('Database query captured:', queryEntry);
  }
}

