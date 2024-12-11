import * as vscode from "vscode";
import { InterpreterFrom } from "xstate";
import { RuntimeFacade } from "../services/RuntimeFacade";
import { devTraceMachine } from "../stateMachine";

export class InsightPanel implements vscode.WebviewViewProvider {
  private devTraceService: InterpreterFrom<typeof devTraceMachine>;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly runtimeFacade: RuntimeFacade,
    devTraceService: InterpreterFrom<typeof devTraceMachine>,
  ) {
    this.devTraceService = devTraceService;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for state changes
    this.devTraceService.onTransition((state) => {
      // Send the current state to the webview
      webviewView.webview.postMessage({
        type: "stateChanged",
        state: state.value,
      });
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "insightPanel.js"),
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    // ... HTML content with JavaScript to handle state changes and display data
    return `
       <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevTrace - Insight</title>
        <style>
          /* ... CSS styles */
        </style>
      </head>
      <body>
        <div id="root">
          <div id="loader" style="display: none;">Analyzing...</div>
          <div id="results" style="display: none;">
            </div>
          <div id="error" style="display: none;">
            </div>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
