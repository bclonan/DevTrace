import bodyParser from "body-parser";
import express from "express";
import fs from 'fs/promises';

// Optional: If you have a RuntimeFacade or other services, you can import and integrate them.
// import { RuntimeFacade } from "../services/RuntimeFacade";

const app = express();
const port = 3000; // Or a dynamically assigned port

app.use(bodyParser.json());

// Mock functions for demonstration. Replace these with your actual logic.
async function analyzeCode(logs) {
  const issues = logs.map((log, index) => {
    // Simple mock analysis: flag any log containing the word "error"
    if (log.includes("error")) {
      return {
        id: index + 1,
        severity: "critical",
        message: log,
        filePath: "unknown",
        lineNumber: index + 1,
      };
    }
    return null;
  }).filter(issue => issue !== null);

  return issues;
}

async function generateFlowData(functionName) {
  const flowData = {
    nodes: [
      {
        nodeId: "n1",
        functionName: functionName,
        args: ["userId:123"],
        returnValue: { name: "Alice" },
        timeMs: 45,
        parentNodeId: null,
        associatedLogs: [`Fetching data for ${functionName}...`],
      },
      {
        nodeId: "n2",
        functionName: "getUserDetails",
        args: ["userId:123"],
        returnValue: { age: 30, email: "alice@example.com" },
        timeMs: 30,
        parentNodeId: "n1",
        associatedLogs: [`Fetching user details for ${functionName}...`],
      },
    ],
    edges: [
      {
        fromNodeId: "n1",
        toNodeId: "n2",
        label: "calls",
      },
    ],
  };
  return flowData;
}

let liveEventInterval = null;

function startSendingLiveEvents(res) {
  // Simulate sending a live event every 5 seconds
  liveEventInterval = setInterval(() => {
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
  }, 5000);
}

async function performHotswap(stateId) {
  // Implement actual hotswap logic here
  return {
    status: "success",
    message: `Hotswap operation successful for stateId: ${stateId}`,
  };
}

async function applyCodeSuggestion(currentFile, suggestion) {
  try {
    // Read the current file content
    const fileContent = await fs.readFile(currentFile, 'utf-8');

    // Apply the suggestion (this is a simple example, actual implementation may vary)
    const updatedContent = fileContent.replace(suggestion.oldText, suggestion.newText);

    // Write the updated content back to the file
    await fs.writeFile(currentFile, updatedContent, 'utf-8');

    console.log(`Successfully applied suggestion to file ${currentFile}`);
    return true;
  } catch (error) {
    console.error(`Failed to apply suggestion to file ${currentFile}:`, error);
    return false;
  }
}

/**
 * Analyzes the code and returns a list of issues.
 */
app.post("/analyze", async (req, res) => {
  try {
    console.log("Received analyze request:", req.body);
    const logs = req.body.logs || [];
    const issues = await analyzeCode(logs);
    res.json({ issues });
  } catch (error) {
    console.error("Error analyzing code:", error);
    res.status(500).json({ error: "Failed to analyze code" });
  }
});

/**
 * Generates flow data for the given function name.
 */
app.post("/flow", async (req, res) => {
  try {
    console.log("Received flow request:", req.body);
    const { functionName } = req.body;
    if (!functionName) {
      return res.status(400).json({ error: "Missing functionName" });
    }
    const flowData = await generateFlowData(functionName);
    return res.json(flowData);
  } catch (error) {
    console.error("Error generating flow data:", error);
    return res.status(500).json({ error: "Failed to generate flow data" });
  }
});

/**
 * Streams live events via Server-Sent Events.
 */
app.get("/live", (req, res) => {
  console.log("Received live events request");
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  startSendingLiveEvents(res);

  req.on("close", () => {
    console.log("Client closed connection to /live");
    if (liveEventInterval) {
      clearInterval(liveEventInterval);
      liveEventInterval = null;
    }
  });
});

/**
 * Manages hotswap operations.
 */
app.post("/hotswap", async (req, res) => {
  try {
    console.log("Received hotswap request:", req.body);
    const { stateId } = req.body;
    if (!stateId) {
      return res.status(400).json({ error: "Missing stateId" });
    }
    const result = await performHotswap(stateId);
    return res.json(result);
  } catch (error) {
    console.error("Error performing hotswap:", error);
    return res.status(500).json({ error: "Failed to perform hotswap" });
  }
});

/**
 * Fetches code suggestions from the AI provider.
 */
app.post("/ai/suggestFix", async (req, res) => {
  console.log("Received AI suggestion request:", req.body);
  try {
    const { errorMessage, currentFile, aiProvider, apiKey } = req.body;
    if (!errorMessage || !currentFile || !aiProvider || !apiKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = AIModelFactory.getClient(aiProvider, apiKey);
    const suggestions = await client.fetchSuggestions(errorMessage, currentFile);
    return res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

/**
 * Applies the given suggestion to the code.
 */
app.post("/code/applySuggestion", async (req, res) => {
  try {
    console.log("Received apply suggestion request:", req.body);
    const { currentFile, suggestion } = req.body;
    if (!currentFile || !suggestion) {
      return res.status(400).json({ error: "Missing currentFile or suggestion" });
    }
    const success = await applyCodeSuggestion(currentFile, suggestion);
    return res.json({ success });
  } catch (error) {
    console.error("Error applying suggestion:", error);
    return res.status(500).json({ error: "Failed to apply suggestion" });
  }
});

// ... other API endpoints can be added here

app.listen(port, () => {
  console.log(`DevTrace backend listening on port ${port}`);
});