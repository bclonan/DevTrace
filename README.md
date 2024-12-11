## DevTrace AI - VS Code Extension

**Level up your debugging with AI-powered insights and live code manipulation!**

DevTrace AI is a powerful VS Code extension that reimagines debugging with features like:

* **Insight Mode:**  Automatically analyzes your code for potential issues and suggests fixes.
* **Flow Mode:** Visualizes the execution flow of your functions, helping you understand how data moves through your application.
* **Live Trace Mode:**  Streams real-time diagnostics, showing you errors and events as they happen.
* **Hotswap Mode:**  Lets you rollback to previous states, apply AI-powered or manual fixes, and continue execution without restarting.

### Getting Started

**1. Installation**

* Clone this repository to your local machine.
* Open the project folder in VS Code.
* Run `npm install` to install the dependencies.

**2. Configuration**

* **Backend:**
    *   Start the backend server by running `npm run start`. This will start the Express.js server on `http://localhost:3000`.
* **Extension:**
    *   Open the `src/stateMachine.ts` file and configure the `aiProvider` and `apiKey` in the machine's context based on your preferred AI provider (OpenAI, Anthropic, or Google AI).
    *   (Optional) If you want to use GitHub Copilot for suggestions, ensure that the GitHub Copilot extension is installed and enabled in VS Code.

**3. Running the Extension**

* Press `F5` to start the extension in debug mode. This will open a new VS Code window with the extension loaded.
* Open a Node.js project in the new window.
* Use the commands in the Command Palette (`Ctrl+Shift+P`) to interact with the extension:
    *   `DevTrace: Start Insight Mode`
    *   `DevTrace: Start Flow Mode`
    *   `DevTrace: Start Live Trace Mode`
    *   `DevTrace: Start Hotswap Mode`
    *   `DevTrace: Analyze`
    *   `DevTrace: Generate Flow`
    *   `DevTrace: Stream Live Events`
    *   `DevTrace: Rollback`
    *   `DevTrace: Apply Fix`
    *   `DevTrace: Play Forward`
    *   `DevTrace: Exit`

**4. Publishing the Extension**

*   Create a publisher account on the VS Code Marketplace.
*   Install the `vsce` (Visual Studio Code Extensions) CLI: `npm install -g vsce`.
*   Update the `package.json` file with your extension details (publisher name, description, etc.).
*   Package the extension: `vsce package`.
*   Publish the extension: `vsce publish`.

### Features in Detail

* **Insight Mode:**
    *   Automatically analyzes your code for potential issues using static analysis and runtime data.
    *   Provides clear descriptions of the issues and their severity.
    *   Offers AI-powered code suggestions to fix the issues.
* **Flow Mode:**
    *   Visualizes the execution flow of your functions using a graph.
    *   Shows how data moves through your application, making it easier to understand complex logic.
    *   Highlights performance bottlenecks and potential areas for optimization.
* **Live Trace Mode:**
    *   Streams real-time diagnostics, showing you errors, logs, and other events as they happen.
    *   Helps you identify and debug issues quickly in dynamic environments.
    *   Provides insights into the behavior of your application under different conditions.
* **Hotswap Mode:**
    *   Lets you rollback to previous states of your application, allowing you to "rewind" execution.
    *   Enables you to apply AI-powered or manual fixes to your code without restarting the application.
    *   Helps you experiment with different solutions and see their impact immediately.

### Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the extension.

### License

This project is licensed under the MIT License.
