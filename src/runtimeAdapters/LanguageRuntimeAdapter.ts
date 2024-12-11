// src/runtimeAdapters/LanguageRuntimeAdapter.ts

/**
 * Interface for language-specific runtime adapters.
 */
export interface LanguageRuntimeAdapter {
    /**
     * Starts tracing the code execution.
     */
    startTracing(): void;

    /**
     * Stops tracing the code execution.
     */
    stopTracing(): void;

    /**
     * Captures a log message.
     * @param message The log message.
     * @param level The log level ('info', 'warn', 'error').
     */
    captureLog(message: string, level?: "info" | "warn" | "error"): void;

    /**
     * Captures a function call.
     * @param functionName The name of the function.
     * @param args The arguments passed to the function.
     */
    captureFunctionCall(functionName: string, args: unknown[]): void;

    /**
     * Captures a function return value.
     * @param functionName The name of the function.
     * @param returnValue The return value of the function.
     */
    captureFunctionReturn<T>(functionName: string, returnValue: T): void;

    /**
     * Captures an exception.
     * @param error The exception object.
     */
    captureException(error: Error): void;

    /**
     * Captures a performance metric.
     * @param name The name of the metric.
     * @param value The value of the metric.
     */
    capturePerformanceMetric(name: string, value: number): void;

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
    ): void;

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
    ): void;
}
