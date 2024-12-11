# DevTrace AI - VS Code Extension

**Level up your debugging with AI-powered insights and live code manipulation!**

DevTrace AI is a powerful VS Code extension that reimagines debugging with features like:

*   **Insight Mode:** Automatically analyzes your code for potential issues and suggests fixes.
*   **Flow Mode:** Visualizes the execution flow of your functions, helping you understand how data moves through your application.
*   **Live Trace Mode:** Streams real-time diagnostics, showing you errors and events as they happen.
*   **Hotswap Mode:** Lets you rollback to previous states, apply AI-powered or manual fixes, and continue execution without restarting.

### Getting Started

**1. Installation**

*   Clone this repository to your local machine: `git clone https://github.com/bclonan/DevTrace.git` (replace with your repo URL if forked).
*   Open the project folder in VS Code.
*   Install the project dependencies: `npm install`

**2. Backend Setup**

*   Navigate to the backend directory: `cd src/backend`
*   Start the backend server: `npm run start`. This will start the Express.js server on `http://localhost:3000`. Ensure the server is running before starting the extension.

**3. Extension Configuration**

*   Open the `src/stateMachine.ts` file.
*   Configure the `aiProvider` and `apiKey` in the machine's context. Choose your preferred AI provider (e.g., "openai").
*   If using OpenAI, set your API key. Example:

```typescript
context: {
    // ... other context properties
    aiProvider: "openai",
    apiKey: "YOUR_OPENAI_API_KEY", // Replace with your actual key
},
```

*   (Optional) If you want to use GitHub Copilot for suggestions, ensure that the GitHub Copilot extension is installed and enabled in VS Code.

**4. Running the Extension in VS Code**

*   Open the root of the DevTrace project in VS Code.
*   Press `F5` to start the extension in debug mode. This will open a new VS Code window with the extension loaded.
*   Open a Node.js project in the new VS Code window where you want to use DevTrace.

**5. Using DevTrace Commands**

*   Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
*   Type `DevTrace` to see the available commands:
    *   `DevTrace: Start Insight Mode`: Starts the code analysis and suggestion process.
    *   `DevTrace: Start Flow Mode`: Starts the function flow visualization.
    *   `DevTrace: Start Live Trace Mode`: Starts streaming real-time diagnostics.
    *   `DevTrace: Start Hotswap Mode`: Enables code hot-swapping.
    *   `DevTrace: Analyze`: Triggers an analysis in Insight Mode.
    *   `DevTrace: Generate Flow`: Triggers flow generation in Flow Mode.
    *   `DevTrace: Rollback`: Rolls back code changes in Hotswap Mode.
    *   `DevTrace: Apply Fix`: Applies an AI-suggested or manual fix.
    *   `DevTrace: Exit`: Exits the current DevTrace mode.

**Example Workflow**

1.  Open a Node.js project in VS Code.
2.  Start the DevTrace backend (`npm run start` in the `src/backend` directory).
3.  Start the DevTrace extension (`F5`).
4.  Open the Command Palette and run `DevTrace: Start Insight Mode`.
5.  DevTrace will analyze your code and display potential issues and suggestions.
6.  Use other commands as needed to explore Flow Mode, Live Trace Mode, or Hotswap Mode.

### Features in Detail

*   **Insight Mode:**
    *   Automatically analyzes your code for potential issues using static analysis and runtime data (when available).
    *   Provides clear descriptions of the issues and their severity.
    *   Offers AI-powered code suggestions to fix the issues.
*   **Flow Mode:**
    *   Visualizes the execution flow of your functions using a graph.
    *   Shows how data moves through your application.
    *   Helps identify performance bottlenecks.
*   **Live Trace Mode:**
    *   Streams real-time diagnostics (errors, logs, events).
    *   Helps you identify and debug issues quickly.
*   **Hotswap Mode:**
    *   Lets you rollback to previous states.
    *   Enables applying fixes without restarting.

### Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

### License

This project is licensed under the MIT License.
