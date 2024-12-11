// types.d.ts
import { AIProvider } from "./ai/AIModelFactory";

/**
 * Request interface for fetching AI suggestions
 */
export interface FetchSuggestionsRequest {
    /** Error message to generate suggestions for */
    errorMessage: string;

    /** Current file path */
    filePath: string;

    /** Context lines around error */
    contextLines?: number;

    /** AI provider configuration */
    provider: {
        type: AIProvider;
        apiKey: string;
        model?: string;
        temperature?: number;
    };

    /** Maximum suggestions to return */
    maxSuggestions?: number;
}

/**
 * Response from fetching AI suggestions
 */
export interface FetchSuggestionsResponse {
    /** Array of generated suggestions */
    suggestions: AISuggestion[];

    /** Processing time in ms */
    processingTimeMs: number;

    /** Usage metrics from AI provider */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * Request for analyzing code
 */
export interface AnalyzeRequest {
    /** Code to analyze */
    code: string;

    /** File path */
    filePath: string;

    /** Analysis configuration */
    config?: {
        /** Analysis depth level */
        depth: "basic" | "intermediate" | "deep";

        /** Specific rules to check */
        rules?: string[];

        /** Maximum issues to report */
        maxIssues?: number;
    };
}

/**
 * Analysis response
 */
export interface AnalyzeResponse {
    /** Found issues */
    issues: Issue[];

    /** Analysis stats */
    stats: {
        /** Lines of code analyzed */
        linesOfCode: number;

        /** Analysis time in ms */
        analysisTimeMs: number;

        /** Issues by severity */
        issuesBySeverity: Record<Issue["severity"], number>;
    };
}

/**
 * Request for processing code flow
 */
export interface ProcessFlowRequest {
    /** Target function name */
    functionName: string;

    /** Entry point file */
    entryPoint: string;

    /** Flow analysis options */
    options?: {
        /** Max depth to traverse */
        maxDepth?: number;

        /** Include async operations */
        includeAsync?: boolean;

        /** Include library calls */
        includeLibs?: boolean;
    };
}

export type Issue = {
    id: number;
    severity: "critical" | "warning" | "info";
    message: string;
    filePath: string;
    lineNumber: number;
    codeSnippet?: string;
    fixes?: AISuggestion[];
};

export type FlowNode = {
    nodeId: string;
    functionName: string;
    args: unknown[];
    returnValue: unknown;
    timeMs: number;
    parentNodeId: string | null;
    associatedLogs: string[];
};

/**
 * Flow analysis response
 */
export interface ProcessFlowResponse {
    /** Flow graph nodes */
    nodes: FlowNode[];

    /** Flow metadata */
    metadata: {
        /** Total execution time */
        totalTimeMs: number;

        /** Number of function calls */
        functionCalls: number;

        /** Max call stack depth */
        maxDepth: number;
    };
}

/**
 * Request to start live tracing
 */
export interface StartLiveTraceRequest {
    /** Files to trace */
    files: string[];

    /** Trace configuration */
    config: {
        /** Event types to capture */
        captureEvents: Array<"log" | "error" | "perf" | "network" | "db">;

        /** Sampling rate (0-1) */
        samplingRate?: number;

        /** Buffer size for events */
        bufferSize?: number;
    };
}

/**
 * Live trace response
 */
export interface StartLiveTraceResponse {
    /** Trace session ID */
    sessionId: string;

    /** Initial trace data */
    initialData: {
        /** Connected files */
        files: string[];

        /** Active trace points */
        tracePoints: Array<{
            id: string;
            location: string;
            type: string;
        }>;
    };
}

/**
 * Request for hot code swap
 */
export interface PerformHotswapRequest {
    /** Operation type */
    operation: "hotswap" | "rollback" | "commit";

    /** State identifier */
    stateId: string;

    /** New code (for hotswap) */
    newCode?: string;

    /** Validation options */
    validate?: {
        /** Run tests before swap */
        runTests?: boolean;

        /** Check syntax only */
        syntaxOnly?: boolean;
    };
}

/**
 * Hot swap response
 */
export interface PerformHotswapResponse {
    /** Operation success */
    success: boolean;

    /** Operation message */
    message: string;

    /** New state after swap */
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
 * Live event from tracing
 */
export interface LiveEvent {
    /** Event identifier */
    eventId: string;

    /** Event type */
    type: "error" | "warning" | "info" | "log" | "performance";

    /** Event message */
    message: string;

    /** Source file */
    filePath: string;

    /** Line number */
    lineNumber: number;

    /** Timestamp */
    timestamp: Date;

    /** Performance data */
    performance?: {
        /** Operation duration */
        durationMs: number;

        /** CPU usage */
        cpuUsage?: number;

        /** Memory usage */
        memoryUsage?: number;
    };

    /** Network data */
    network?: {
        /** Request URL */
        url: string;

        /** HTTP method */
        method: string;

        /** Response code */
        statusCode: number;

        /** Response time */
        responseTimeMs: number;
    };

    /** Fix suggestion */
    suggestedFix?: {
        /** Fix description */
        description: string;

        /** Fix implementation */
        codeSnippet: string;

        /** Fix confidence */
        confidence: number;
    };

    /** Extension point for custom data */
    [key: string]: unknown;
}
export type AISuggestion = {
    /** Suggestion ID */
    id: string;

    /** Human-readable description */
    description: string;

    /** Implementation code */
    codeSnippet?: string;

    /** Confidence score (0-1) */
    confidence?: number;

    /** Suggestion category */
    type: "refactor" | "fix" | "optimization";

    /** Expected impact */
    impact: "high" | "medium" | "low";

    /** Code difference */
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

    /** Implementation metadata */
    metadata?: {
        /** Required imports */
        imports?: string[];

        /** Affected functions */
        affectedFunctions?: string[];

        /** Breaking changes */
        breakingChanges?: boolean;
    };

};

export type FetchSuggestionsRequest = {
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
};


// Additional exports
export * from './events';
export * from './runtime';
export * from './services';

