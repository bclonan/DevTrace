import { AIProvider } from "./ai/AIModelFactory";


/**
 * All services and actions available in the DevTrace system.
 * These are the functions that can be called by the DevTrace actor.
 */
export type DevTraceServices = {
    analyzeCode: {
        src: "analyzeCode";
        logic: never;
        input: string;
        output: AnalyzeResponse;
    };
    fetchSuggestions: {
        src: "fetchSuggestions";
        logic: never;
        input: FetchSuggestionsRequest;
        output: FetchSuggestionsResponse;
    };
    applySuggestion: {
        src: "applySuggestion";
        logic: never;
        input: { currentFile: string; suggestion: AISuggestion };
        output: boolean;
    };
    performHotswap: {
        src: "performHotswap";
        logic: never;
        input: string;
        output: PerformHotswapResponse;
    };
    startLiveTrace: {
        src: "startLiveTrace";
        logic: never;
        input: DevTraceContext;
        output: StartLiveTraceResponse;
    };
};

export interface DevTraceServices {
    analyzeCode: {
        src: "analyzeCode";
        logic: never;
        input: string;
        output: AnalyzeResponse;
    };
    fetchSuggestions: {
        src: "fetch";
        Suggestions: never;
        logic: never;
        input: FetchSuggestionsRequest;
        output: FetchSuggestionsResponse;
    };
    applySuggestion: {
        src: "applySuggestion";
        logic: never;
        input: { currentFile: string; suggestion: AISuggestion };
        output: boolean;
    };
    performHotswap: {
        src: "performHotswap";
        logic: never;
        input: string;
        output: PerformHotswapResponse;
    };
    startLiveTrace: {
        src: "startLiveTrace";
        logic: never;
        input: DevTraceContext;
        output: StartLiveTraceResponse;
    };
}




/**
 * Request interface for fetching AI suggestions
 */
export interface FetchSuggestionsRequest {
    errorMessage: string;
    filePath: string;
    contextLines?: number;
    provider: {
        type: AIProvider;
        apiKey: string;
        model?: string;
        temperature?: number;
    };
    maxSuggestions?: number;
}

/**
 * AI suggestion structure
 */
export interface AISuggestion {
    id: string;
    description: string;
    codeSnippet?: string;
    confidence?: number;
    type: "refactor" | "fix" | "optimization";
    impact: "high" | "medium" | "low";
    diff?: {
        before: string;
        after: string;
        hunks: Array<{
            oldStart: number;
            oldLines: number;
            newStart: number;
            newLines: number;
            content: string;
        }>;
    };
    metadata?: {
        imports?: string[];
        affectedFunctions?: string[];
        breakingChanges?: boolean;
    };
}

/**
 * Response from fetching AI suggestions
 */
export interface FetchSuggestionsResponse {
    suggestions: AISuggestion[];
    processingTimeMs: number;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * Issues found during analysis
 */
export interface Issue {
    id: number;
    severity: "critical" | "warning" | "info";
    message: string;
    filePath: string;
    lineNumber: number;
    codeSnippet?: string;
    fixes?: AISuggestion[];
}

/**
 * Analysis response
 */
export interface AnalyzeResponse {
    issues: Issue[];
    stats: {
        linesOfCode: number;
        analysisTimeMs: number;
        issuesBySeverity: Record<Issue["severity"], number>;
    };
}

/**
 * Flow node structure for process flow analysis
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
 * Flow analysis response
 */
export interface ProcessFlowResponse {
    nodes: FlowNode[];
    metadata: {
        totalTimeMs: number;
        functionCalls: number;
        maxDepth: number;
    };
}

/**
 * Start live trace response
 */
export interface StartLiveTraceResponse {
    sessionId: string;
    initialData: {
        files: string[];
        tracePoints: Array<{
            id: string;
            location: string;
            type: string;
        }>;
    };
}

/**
 * Hot swap response
 */
export interface PerformHotswapResponse {
    success: boolean;
    message: string;
    newState?: {
        id: string;
        timestamp: number;
        changes: Array<{
            file: string;
            type: "modify" | "add" | "delete";
        }>;
    };
}

/**
 * Live event structure
 */
export interface LiveEvent {
    eventId: string;
    type: "error" | "warning" | "info" | "log" | "performance";
    message: string;
    filePath: string;
    lineNumber: number;
    timestamp: Date;
    performance?: {
        durationMs: number;
        cpuUsage?: number;
        memoryUsage?: number;
    };
    network?: {
        url: string;
        method: string;
        statusCode: number;
        responseTimeMs: number;
    };
    suggestedFix?: {
        description: string;
        codeSnippet: string;
        confidence: number;
    };
}

export interface DevTraceContext {
    analysisResults?: AnalyzeResponse;
    errorMessage?: string;
    flowResults?: ProcessFlowResponse;
    traceResults?: StartLiveTraceResponse;
    hotswapResults?: PerformHotswapResponse;
    currentFile: string | null;
    selectedFunction: string | null;
    liveEvents: LiveEvent[];
    hotswapHistory: Array<{ timestamp: number; details: string }>;
    aiProvider: AIProvider;
    apiKey: string;
    suggestions?: Record<string, AISuggestion>;
    stateId?: string;
    newCode?: string;
}

export type DevTraceEvent =
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

export type analyzeCode = (code: string) => Promise<AnalyzeResponse>;

export type fetchSuggestions = (request: FetchSuggestionsRequest) => Promise<FetchSuggestionsResponse>;

export type applyCodeSuggestion = (currentFile: string, suggestion: AISuggestion) => Promise<boolean>;

export type performHotswap = (stateId: string) => Promise<PerformHotswapResponse>;

export type startLiveTrace = (context: DevTraceContext) => Promise<StartLiveTraceResponse>;

export interface analyzeCode {
    (code: string): Promise<AnalyzeResponse>;
}

export type DevTraceState = {
    context: DevTraceContext;
    mode: "insight" | "flow" | "liveTrace" | "hotswap";
    stateId: string;
};

/**
 * DevTraceActor is optional; define it only if you need this type elsewhere.
 * If it's causing type conflicts, remove or adjust it.
 */
export type DevTraceActor = {
    send: (event: DevTraceEvent) => void;
    onMessage: (callback: (event: DevTraceEvent) => void) => void;
    onExit: (callback: () => void) => void;
    onError: (callback: (error: Error) => void) => void;
    terminate: () => void;

};
