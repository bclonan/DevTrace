// src/types.d.ts

import { AIProvider } from "./ai/AIModelFactory.ts";

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
    captureFunctionReturn(functionName: string, returnValue: unknown): void;

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

/**
 * Interface for issue objects.
 */
export interface Issue {
    id: number;
    severity: "critical" | "warning" | "info";
    message: string;
    filePath: string;
    lineNumber: number;
    // ... other properties as needed
}

/**
 * Interface for flow node objects.
 */
export interface FlowNode {
    nodeId: string;
    functionName: string;
    args: unknown[];
    returnValue: unknown;
    timeMs: number;
    parentNodeId: string | null;
    associatedLogs: string[];
}

/**
 * Interface for live event objects.
 */
export interface LiveEvent {
    eventId: string;
    type: "error" | "warning" | "info" | "log" | "performance";
    message: string;
    filePath?: string;
    lineNumber?: number;
    timestamp: Date;
    // ... other properties as needed
}

/**
 * Interface for hotswap history entry objects.
 */
export interface HotswapHistoryEntry {
    timestamp: number;
    details: string;
    // ... other properties as needed
}

/**
 * Interface for AI suggestion objects.
 */
export interface AISuggestion {
    description: string;
    codeSnippet: string;
}

/**
 * The state machine context.
 */
export interface DevTraceContext {
    analysisResults?: Issue[];
    errorMessage?: string;
    flowResults?: FlowNode[];
    traceResults?: LiveEvent[];
    hotswapResults?: Record<string, unknown>;
    currentFile: string | null;
    selectedFunction: string | null;
    liveEvents: LiveEvent[];
    hotswapHistory: HotswapHistoryEntry[];
    aiProvider: AIProvider;
    apiKey: string;
    suggestions?: AISuggestion[];
    // Add other context variables as needed
    userPreferences?: Record<string, unknown>;
    sessionId?: string;
    projectSettings?: Record<string, unknown>;
    activeBreakpoints?: { id: string; line: number; enabled: boolean }[];
    debugSession?: {
        sessionId: string;
        isActive: boolean;
        startTime: Date;
        endTime?: Date;
        [key: string]: string | number | boolean | Date | undefined;
    };
    performanceMetrics?: Record<string, unknown>;
    codeSnippets?: Record<string, string>;
    userNotes?: string[];
    activeTheme?: string;
    recentFiles?: string[];
}

/**
 * Events that can be sent to the state machine.
 */
export type DevTraceEvent =
    | { type: "exit" }
    | { type: "start.insightMode" }
    | { type: "start.flowMode" }
    | { type: "start.liveTraceMode" }
    | { type: "start.hotswapMode" }
    | { type: "analyze" }
    | { type: "fetchSuggestions" }
    | { type: "applySuggestion"; suggestion: string }
    | { type: "process"; functionName: string }
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
        liveEvents: LiveEvent[];
        errorMessage: string;
    }
    | { type: "liveEvents"; event: LiveEvent }
    | { type: "error"; errorMessage: string }
    | { type: "entry"; entry: HotswapHistoryEntry }
    | { type: "exit"; exit: string }
    | { type: "event"; event: Record<string, unknown> }
    | { type: "fetchSuggestions"; errorMessage: string }
    | { type: "applySuggestion"; suggestion: AISuggestion }
    | { type: "updateCurrentFile"; file: string }
    | { type: "updateSelectedFunction"; functionName: string }
    | { type: "addLiveEvent"; event: LiveEvent }
    | { type: "clearLiveEvents" }
    | { type: "addHotswapHistoryEntry"; entry: HotswapHistoryEntry }
    | { type: "clearHotswapHistory" };
