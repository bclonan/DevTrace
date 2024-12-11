"use strict";
// backend/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const AIModelFactory_ts_1 = require("../ai/AIModelFactory.ts");
const app = (0, express_1.default)();
const port = 3000; // Or a dynamically assigned port
app.use(body_parser_1.default.json());
/**
 * Analyzes the code and returns a list of issues.
 */
app.post("/analyze", async (req, res) => {
    // ... logic to analyze logs and return issues
    console.log("Received analyze request:", req.body);
    res.json({
        issues: [
            // Sample issue data
            {
                id: 1,
                severity: "critical",
                message: "Null reference at line 42",
                filePath: "src/userController.js",
                lineNumber: 42,
                // ... other issue details
            },
        ],
    });
});
/**
 * Generates flow data for the given function name.
 */
app.post("/flow", async (req, res) => {
    // ... logic to generate flow data
    console.log("Received flow request:", req.body);
    res.json({
        nodes: [
            // Sample flow data
            {
                nodeId: "n1",
                functionName: "fetchUserData",
                args: ["userId:123"],
                returnValue: { name: "Alice" },
                timeMs: 45,
                parentNodeId: null,
                associatedLogs: ["Fetching user data..."],
            },
            // ... more nodes
        ],
    });
});
/**
 * Streams live events.
 */
app.get("/live", async (req, res) => {
    // ... logic to stream live events
    console.log("Received live events request");
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    // Simulate sending live events
    setInterval(() => {
        const event = {
            eventId: "evt1",
            type: "error",
            message: "Null pointer at line 42",
            filePath: "src/userController.js",
            lineNumber: 42,
            timestamp: new Date(),
            suggestedFix: {
                description: "Check for null",
                codeSnippet: "if(!user) return;",
            },
        };
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    }, 5000); // Send an event every 5 seconds
});
/**
 * Manages hotswap operations.
 */
app.post("/hotswap", async (req, res) => {
    // ... logic to manage hotswap operations
    console.log("Received hotswap request:", req.body);
    res.json({
        status: "success",
        message: "Hotswap operation successful",
        // ... other data as needed
    });
});
/**
 * Fetches code suggestions from the AI provider.
 */
app.post("/ai/suggestFix", async (req, res) => {
    // ... logic to fetch suggestions from the AI provider
    console.log("Received AI suggestion request:", req.body);
    try {
        const { errorMessage, currentFile, aiProvider, apiKey } = req.body;
        const aiClient = AIModelFactory_ts_1.AIModelFactory.getClient(aiProvider, apiKey);
        const suggestions = await aiClient.fetchSuggestions(errorMessage, currentFile);
        res.json({ suggestions });
    }
    catch (error) {
        console.error("Error fetching suggestions:", error);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
});
/**
 * Applies the given suggestion to the code.
 */
app.post("/code/applySuggestion", (req, res) => {
    // ... logic to apply the suggestion to the code
    console.log("Received apply suggestion request:", req.body);
    res.json({ success: true });
});
// ... other API endpoints
app.listen(port, () => {
    console.log(`DevTrace backend listening on port ${port}`);
});
//# sourceMappingURL=server.js.map