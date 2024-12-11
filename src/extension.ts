// src/extension.ts

import * as vscode from "vscode";
import { RuntimeFacade } from "./services/RuntimeFacade.ts"; // Import from .ts file
import { devTraceActor } from "./stateMachine.ts"; // Import from .ts file
import { FlowPanel } from "./ui/FlowPanel.ts"; // Import from .ts file
import { HotswapPanel } from "./ui/HotswapPanel.ts"; // Import from .ts file
import { InsightPanel } from "./ui/InsightPanel.ts"; // Import from .ts file
import { LiveTracePanel } from "./ui/LiveTracePanel.ts"; // Import from .ts file

/**
 * Activates the DevTrace AI extension.
 * @param context The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  // Create runtime facade
  const runtimeFacade = new RuntimeFacade();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("devtrace.startInsightMode", () => {
      devTraceActor.send({ type: "start.insightMode" });
    }),
    vscode.commands.registerCommand("devtrace.startFlowMode", () => {
      devTraceActor.send({ type: "start.flowMode" });
    }),
    vscode.commands.registerCommand("devtrace.startLiveTraceMode", () => {
      devTraceActor.send({ type: "start.liveTraceMode" });
    }),
    vscode.commands.registerCommand("devtrace.startHotswapMode", () => {
      devTraceActor.send({ type: "start.hotswapMode" });
    }),
    vscode.commands.registerCommand("devtrace.analyze", () => {
      devTraceActor.send({ type: "analyze" });
    }),
    vscode.commands.registerCommand(
      "devtrace.generateFlow",
      (functionName: string) => {
        devTraceActor.send({ type: "generateFlow", functionName });
      },
    ),
    vscode.commands.registerCommand("devtrace.streamLiveEvents", () => {
      devTraceActor.send({ type: "streamLiveEvents" });
    }),
    vscode.commands.registerCommand("devtrace.rollback", (stateId: string) => {
      devTraceActor.send({ type: "rollback", stateId });
    }),
    vscode.commands.registerCommand(
      "devtrace.applyFix",
      (stateId: string, newCode: string) => {
        devTraceActor.send({ type: "applyFix", stateId, newCode });
      },
    ),
    vscode.commands.registerCommand(
      "devtrace.playForward",
      (stateId: string) => {
        devTraceActor.send({ type: "playForward", stateId });
      },
    ),
    vscode.commands.registerCommand("devtrace.exit", () => {
      devTraceActor.send({ type: "exit" });
    }),
  );

  // Create UI panels
  const insightPanel = new InsightPanel(
    context.extensionUri,
    runtimeFacade,
    devTraceActor,
  );
  const flowPanel = new FlowPanel(
    context.extensionUri,
    runtimeFacade,
    devTraceActor,
  );
  const liveTracePanel = new LiveTracePanel(
    context.extensionUri,
    runtimeFacade,
    devTraceActor,
  );
  const hotswapPanel = new HotswapPanel(
    context.extensionUri,
    runtimeFacade,
    devTraceActor,
  );

  // Register webview views
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "devtrace.insightView",
      insightPanel,
    ),
    vscode.window.registerWebviewViewProvider("devtrace.flowView", flowPanel),
    vscode.window.registerWebviewViewProvider(
      "devtrace.liveTraceView",
      liveTracePanel,
    ),
    vscode.window.registerWebviewViewProvider(
      "devtrace.hotswapView",
      hotswapPanel,
    ),
  );
}

/**
 * Deactivates the DevTrace AI extension.
 */
export function deactivate() { }
