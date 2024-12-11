import * as vscode from 'vscode';
import { RuntimeFacade } from './services/RuntimeFacade';
import { InsightPanel } from './ui/InsightPanel';
import { FlowPanel } from './ui/FlowPanel';
import { LiveTracePanel } from './ui/LiveTracePanel';
import { HotswapPanel } from './ui/HotswapPanel';
import { devTraceMachine, devTraceService } from './stateMachine';

export function activate(context: vscode.ExtensionContext) {
  // Create runtime facade
  const runtimeFacade = new RuntimeFacade();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devtrace.startInsightMode', () => {
      devTraceService.send('start.insightMode');
    }),
    vscode.commands.registerCommand('devtrace.startFlowMode', () => {
      devTraceService.send('start.flowMode');
    }),
    vscode.commands.registerCommand('devtrace.startLiveTraceMode', () => {
      devTraceService.send('start.liveTraceMode');
    }),
    vscode.commands.registerCommand('devtrace.startHotswapMode', () => {
      devTraceService.send('start.hotswapMode');
    }),
    vscode.commands.registerCommand('devtrace.analyze', () => {
      devTraceService.send('analyze');
    }),
    // ... other commands for exit, generateFlow, streamLiveEvents, rollback, applyFix, playForward
  );

  // Create UI panels
  const insightPanel = new InsightPanel(context.extensionUri, runtimeFacade, devTraceService);
  const flowPanel = new FlowPanel(context.extensionUri, runtimeFacade, devTraceService);
  const liveTracePanel = new LiveTracePanel(context.extensionUri, runtimeFacade, devTraceService);
  const hotswapPanel = new HotswapPanel(context.extensionUri, runtimeFacade, devTraceService);

  // Register webview views
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('devtrace.insightView', insightPanel),
    vscode.window.registerWebviewViewProvider('devtrace.flowView', flowPanel),
    vscode.window.registerWebviewViewProvider('devtrace.liveTraceView', liveTracePanel),
    vscode.window.registerWebviewViewProvider('devtrace.hotswapView', hotswapPanel),
  );
}

export function deactivate() {}