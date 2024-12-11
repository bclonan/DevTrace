// src/ui/LiveTracePanel.ts

import * as vscode from "vscode";
import { Actor } from "xstate";
import { RuntimeFacade } from "../services/RuntimeFacade.ts";
import { devTraceMachine } from "../stateMachine.ts";

/**
 * The Live Trace Panel UI class.
 * Manages the webview for the Live Trace panel.
 */
export class LiveTracePanel implements vscode.WebviewViewProvider {
    private devTraceService: Actor<typeof devTraceMachine>;

    /**
     * Creates a new instance of the LiveTracePanel class.
     * @param _extensionUri The URI of the extension.
     * @param runtimeFacade The runtime facade.
     * @param devTraceService The DevTrace state machine service.
     */
    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly runtimeFacade: RuntimeFacade,
        devTraceService: Actor<typeof devTraceMachine>,
    ) {
        this.devTraceService = devTraceService;
    }

    /**
     * Resolves the webview view for the Live Trace panel.
     * @param webviewView The webview view.
     */
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
                liveEvents: state.context.liveEvents,
                errorMessage: state.context.errorMessage,
            });
        });
    }

    /**
     * Generates the HTML content for the webview.
     * @param webview The webview.
     * @returns The HTML content.
     */
    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this._extensionUri,
                "media",
                "liveTracePanel.js",
            ),
        );

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevTrace - Live Trace</title>
        <style>
          /* ... CSS styles */
        </style>
      </head>
      <body>
        <div id="root">
          <div id="loader" style="display: none;">Streaming live events...</div>
          <div id="events" style="display: none;">
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
