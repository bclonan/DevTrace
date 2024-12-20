// src/services/DevTraceService.ts

import { devTraceActor } from "../stateMachine.ts";
import { AISuggestion } from "../types.ts";

/**
 * The DevTraceService class.
 * Provides an interface for interacting with the DevTrace state machine.
 */
export class DevTraceService {
    /**
     * Starts the DevTrace actor.
     */
    static start() {
        devTraceActor.start();
    }

    /**
     * Stops the DevTrace actor.
     */
    static stop() {
        devTraceActor.stop();
    }

    /**
     * Sends an 'analyze' event to the DevTrace actor.
     */
    static analyze() {
        devTraceActor.send({ type: "analyze" });
    }

    /**
     * Sends a 'process' event to the DevTrace actor.
     * @param functionName The name of the function to process.
     */
    static processFlow(functionName: string) {
        devTraceActor.send({ type: "process", functionName });
    }

    /**
     * Sends a 'trace' event to the DevTrace actor.
     */
    static startLiveTrace() {
        devTraceActor.send({ type: "trace" });
    }

    /**
     * Sends a 'swap' event to the DevTrace actor.
     */
    static performHotswap() {
        devTraceActor.send({ type: "swap" });
    }

    /**
     * Sends a 'fetchSuggestions' event to the DevTrace actor.
     */
    static fetchSuggestions() {
        devTraceActor.send({ type: "fetchSuggestions", errorMessage: "" });
    }

    /**
     * Sends an 'applySuggestion' event to the DevTrace actor.
     * @param suggestion The suggestion to apply.
     */
    static applySuggestion(suggestion: AISuggestion) {
        devTraceActor.send({ type: "applySuggestion", suggestion });
    }

    /**
     * Sends an 'exit' event to the DevTrace actor.
     */
    static exit() {
        devTraceActor.send({ type: "exit" });
    }

    /**
     * Updates the current file in the state machine context.
     * @param file The current file.
     */
    static updateCurrentFile(file: string) {
        devTraceActor.send({ type: "updateCurrentFile", file });
    }

    /**
     * Updates the selected function in the state machine context.
     * @param functionName The selected function.
     */
    static updateSelectedFunction(functionName: string) {
        devTraceActor.send({ type: "updateSelectedFunction", functionName });
    }

    /**
     * Adds a live event to the state machine context.
     * @param event The live event to add.
     */
    static addLiveEvent(
        event: { type: string; payload: Record<string, unknown>; eventId?: string; message?: string; filePath?: string; lineNumber?: number; timestamp?: number },
    ) {
        devTraceActor.send({
            type: "addLiveEvent",
            event: {
                ...event,
                eventId: event.eventId || "",
                message: event.message || "",
                filePath: event.filePath || "",
                lineNumber: event.lineNumber || 0,
                timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
                type: event.type as "error" | "warning" | "info" | "log" | "performance"
            }
        });
    }

    /**
     * Adds a hotswap history entry to the state machine context.
     * @param entry The hotswap history entry to add.
     */
    static addHotswapHistoryEntry(
        entry: { timestamp: number; details: string },
    ) {
        devTraceActor.send({ type: "addHotswapHistoryEntry", entry });
    }

    /**
     * Subscribes to state changes in the DevTrace actor.
     * @param listener The listener function to handle state changes.
     */
    static subscribe(
        listener: (state: ReturnType<typeof devTraceActor.getSnapshot>) => void,
    ) {
        devTraceActor.subscribe(listener);
    }
}
