import { createRequire } from "node:module";
import { v4 as uuidv4 } from "uuid";
import { LanguageRuntimeAdapter } from "./LanguageRuntimeAdapter.ts";

const require = createRequire(__filename);
const asyncHooks = require("node:async_hooks");

/**
 * The Node.js runtime adapter.
 * Provides methods for instrumenting and interacting with Node.js code.
 */
export class NodeAdapter implements LanguageRuntimeAdapter {
  private asyncHook!: import("node:async_hooks").AsyncHook;
  private currentFunction: {
    asyncId: string;
    name: string;
    args: unknown[];
    startTime: number;
  } | null = null;

  /**
   * Starts tracing Node.js code execution.
   */
  startTracing() {
    this.asyncHook = asyncHooks.createHook({
      init: (
        _asyncId: number,
        type: string,
        _triggerAsyncId: number,
        resource: { name: string; args: unknown[] },
      ) => {
        if (type === "FUNCTION") {
          this.currentFunction = {
            asyncId: uuidv4(),
            name: resource.name,
            args: resource.args,
            startTime: Date.now(), // Capture function start time
          };
        }
      },
      before: (asyncId: number) => {
        if (
          this.currentFunction &&
          this.currentFunction.asyncId === asyncId.toString()
        ) {
          console.log(
            `Entering function: ${this.currentFunction.name}(${
              JSON.stringify(this.currentFunction.args)
            })`,
          );
        }
      },
      after: (asyncId: number) => {
        if (
          this.currentFunction &&
          this.currentFunction.asyncId === asyncId.toString()
        ) {
          const endTime = Date.now();
          const duration = endTime - this.currentFunction.startTime;
          console.log(
            `Exiting function: ${this.currentFunction.name} (duration: ${duration}ms)`,
          );
        }
      },
      destroy: (asyncId: number) => {
        if (
          this.currentFunction &&
          this.currentFunction.asyncId === asyncId.toString()
        ) {
          this.currentFunction = null;
        }
      },
    });

    this.asyncHook.enable();
    console.log("Tracing started");
  }

  /**
   * Stops tracing Node.js code execution.
   */
  stopTracing() {
    this.asyncHook.disable();
    console.log("Tracing stopped");
  }

  /**
   * Captures a log message.
   * @param message The log message.
   * @param level The log level ('info', 'warn', 'error').
   */
  captureLog(message: string, level: "info" | "warn" | "error" = "info") {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      function: this.currentFunction ? this.currentFunction.name : "global",
    };
    console.log("Log captured:", logEntry);
  }

  /**
   * Captures a function call.
   * @param functionName The name of the function.
   * @param args The arguments passed to the function.
   */
  captureFunctionCall(functionName: string, args: unknown[]) {
    console.log(`Function called: ${functionName}(${JSON.stringify(args)})`);
  }

  /**
   * Captures a function return value.
   * @param functionName The name of the function.
   * @param returnValue The return value of the function.
   */
  captureFunctionReturn(functionName: string, returnValue: unknown) {
    console.log(
      `Function returned: ${functionName} returned ${
        JSON.stringify(returnValue)
      }`,
    );
  }

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
      function: this.currentFunction ? this.currentFunction.name : "global",
    };
    console.log("Exception captured:", exceptionEntry);
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
      function: this.currentFunction ? this.currentFunction.name : "global",
    };
    console.log("Performance metric captured:", metricEntry);
  }

  /**
   * Captures a network request.
   * @param url The URL of the request.
   * @param method The HTTP method (GET, POST, etc.).
   * @param startTime The start time of the request.
   * @param endTime The end time of the request.
   * @param statusCode The HTTP status code of the response.
   */
  captureNetworkRequest(
    url: string,
    method: string,
    startTime: number,
    endTime: number,
    statusCode: number,
  ) {
    const requestEntry = {
      timestamp: new Date(),
      url,
      method,
      duration: endTime - startTime,
      statusCode,
      function: this.currentFunction ? this.currentFunction.name : "global",
    };
    console.log("Network request captured:", requestEntry);
  }

  /**
   * Captures a database query.
   * @param query The SQL query string.
   * @param startTime The start time of the query.
   * @param endTime The end time of the query.
   * @param rowsAffected The number of rows affected by the query.
   */
  captureDatabaseQuery(
    query: string,
    startTime: number,
    endTime: number,
    rowsAffected: number,
  ) {
    const queryEntry = {
      timestamp: new Date(),
      query,
      duration: endTime - startTime,
      rowsAffected,
      function: this.currentFunction ? this.currentFunction.name : "global",
    };
    console.log("Database query captured:", queryEntry);
  }
}
