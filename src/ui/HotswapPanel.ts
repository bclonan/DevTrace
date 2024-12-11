// src/ui/HotswapPanel.ts

import * as vscode from 'vscode';
import { RuntimeFacade } from '../services/RuntimeFacade.ts';
import { Actor } from 'xstate';
import { devTraceMachine } from '../stateMachine.ts';

/**
 * The Hotswap Panel UI class.
 * Manages the webview for the Hotswap panel.
 */
export class HotswapPanel implements vscode.WebviewViewProvider {
  private devTraceService: Actor<typeof devTraceMachine>;

  /**
   * Creates a new instance of the HotswapPanel class.
   * @param _extensionUri The URI of the extension.
   * @param runtimeFacade The runtime facade.
   * @param devTraceService The DevTrace state machine service.
   */
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly runtimeFacade: RuntimeFacade,
    devTraceService: Actor<typeof devTraceMachine>
  ) {
    this.devTraceService = devTraceService;
  }

  /**
   * Resolves the webview view for the Hotswap panel.
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
        type: 'stateChanged',
        state: state.value,
        hotswapData: state.context.hotswapData,
        errorMessage: state.context.errorMessage,
      });
    });
  }

  /**
   * Generates the HTML content for the webview.
   * @param webview The webview.
   * @returns The HTML content.
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'hotswapPanel.js')
    );