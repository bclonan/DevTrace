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
    type: string;
    message: string;
    filePath: string;
    lineNumber: number;
    timestamp: Date;
    suggestedFix?: {
        description: string;
        codeSnippet: string;
    };

    type: "error" | "warning" | "info" | "log" | "performance";

    [key: string]: unknown;
}

/**
 * Interface for hotswap history entry objects.
 */
export interface HotswapHistoryEntry {
    timestamp: number;
    details: string;
    // ... other properties as needed
}

interface DevTraceActorOptions {
    id: string;
    logger?: (event: DevTraceEvent) => void;
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

/**
* The DevTraceService interface aggregates all service methods
* to communicate with the backend routes.
*/
export interface DevTraceService {
    /**
     * Analyzes the code and returns a list of issues.
     */
    analyze(req: AnalyzeRequest): Promise<AnalyzeResponse>;

    /**
     * Generates flow data for the given function name.
     */
    flow(req: FlowRequest): Promise<FlowResponse>;

    /**
     * Streams live events.
     * Since this is SSE, you might define a method that sets up a listener
     * instead of returning a Promise. For example:
     */
    subscribeToLiveEvents(callback: (event: LiveEvent) => void): void;

    /**
     * Manages hotswap operations.
     */
    hotswap(req: HotswapRequest): Promise<HotswapResponse>;

    /**
     * Fetches code suggestions from the AI provider.
     */
    suggestFix(req: AISuggestFixRequest): Promise<AISuggestFixResponse>;

    /**
     * Applies the given suggestion to the code.
     */
    applySuggestion(req: ApplySuggestionRequest): Promise<ApplySuggestionResponse>;
}

export interface AnalyzeCodeResult {
    [key: string]: unknown;
}

export interface ProcessFlowResult {
    [key: string]: unknown;
}

export interface StartLiveTraceResult {
    [key: string]: unknown;
}

export interface PerformHotswapResult {
    [key: string]: unknown;
}

export interface FetchSuggestionsResult {
    [key: string]: unknown;
}

export interface ApplySuggestionResult {
    [key: string]: unknown;
}

export interface FetchSuggestionsEvent {
    errorMessage: string;
}

export interface ApplySuggestionEvent {
    suggestion: Record<string, unknown>;
}

export interface SuggestionEvent {
    errorMessage: string;
}

export interface UpdateCurrentFileEvent {
    file: string;
}

export interface UpdateSelectedFunctionEvent {
    functionName: string;
}

export interface AddLiveEventEvent {
    event: LiveEvent;
}

export interface ClearLiveEventsEvent {
}

export interface AddHotswapHistoryEntryEvent {
    entry: HotswapHistoryEntry;
}

export interface ClearHotswapHistoryEvent {
}

export interface DevTraceService {
    analyzeCode(req: AnalyzeCodeRequest): Promise<AnalyzeCodeResult>;
    processFlow(req: ProcessFlowRequest): Promise<ProcessFlowResult>;
    startLiveTrace(req: StartLiveTraceRequest): Promise<StartLiveTraceResult>;
    performHotswap(req: PerformHotswapRequest): Promise<PerformHotswapResult>;
    fetchSuggestions(req: FetchSuggestionsRequest): Promise<FetchSuggestionsResult>;
    applySuggestion(req: ApplySuggestionRequest): Promise<ApplySuggestionResult>;
}

export interface AnalyzeRequest {
    code: string;
}

export interface AnalyzeResponse {
    issues: Issue[];
}

export interface FlowRequest {
    functionName: string;
}

export interface FlowResponse {
    flow: FlowNode[];
}

export interface HotswapRequest {
    code: string;
}

export interface HotswapResponse {
    status: "success" | "error";
    message: string;
}

export interface AISuggestFixRequest {
    errorMessage: string;
}

export interface AISuggestFixResponse {
    suggestions: AISuggestion[];
}

export interface ApplySuggestionRequest {
    suggestion: AISuggestion;
}

export interface ApplySuggestionResponse {
    success: boolean;
}

export interface AnalyzeCodeRequest {
    code: string;
}

export interface ProcessFlowRequest {
    functionName: string;
}

export interface StartLiveTraceRequest {
}

export interface PerformHotswapRequest {
}

export interface FetchSuggestionsRequest {
    errorMessage: string;
}



