// src/ui/FlowPanel.ts

import * as vscode from "vscode";
import { Actor } from "xstate";
import { RuntimeFacade } from "../services/RuntimeFacade.ts";
import { devTraceMachine } from "../stateMachine.ts";

/**
 * The Flow Panel UI class.
 * Manages the webview for the Flow panel.
 */
export class FlowPanel implements vscode.WebviewViewProvider {
    private devTraceActor: Actor<typeof devTraceMachine>;

    /**
     * Creates a new instance of the FlowPanel class.
     * @param _extensionUri The URI of the extension.
     * @param runtimeFacade The runtime facade.
     * @param devTraceActor The DevTrace state machine actor.
     */
    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly runtimeFacade: RuntimeFacade,
        devTraceActor: Actor<typeof devTraceMachine>,
    ) {
        this.devTraceActor = devTraceActor;
    }

    /**
     * Resolves the webview view for the Flow panel.
     * @param webviewView The webview view.
     */
    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Listen for state changes
        this.devTraceActor.subscribe((state) => {
            // Send the current state to the webview
            webviewView.webview.postMessage({
                type: "stateChanged",
                state: state.value,
                flowResults: state.context.flowResults,
                errorMessage: state.context.errorMessage,
            });
        });

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case "generateFlow":
                    this.devTraceActor.send({
                        type: "process",
                        data: {
                            functionName: message.functionName,
                        },
                    });
                    break;
                case "exit":
                    this.devTraceActor.send({ type: "exit" });
                    break;
                    // ... handle other messages from the webview
            }
        });
    }

    /**
     * Generates the HTML content for the webview.
     * @param webview The webview.
     * @returns The HTML content.
     */
    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "flowPanel.js"),
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "styles.css"),
        );
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevTrace - Flow</title>
        <link href="${styleUri}" rel="stylesheet" type="text/css">
        <style>
          /* Add any additional CSS styles here */
        </style>
      </head>
      <body>
        <div id="root">
          <div id="loader" class="loader">Generating flow data...</div>
          <div id="flow" class="flow-container">
          </div>
          <div id="error" class="error-message" style="display: none;">
          </div>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
    }
}

/**
 * Generates a nonce value for security.
 * @returns The nonce value.
 */
function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
