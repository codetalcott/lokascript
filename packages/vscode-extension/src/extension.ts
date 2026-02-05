/**
 * LokaScript VS Code Extension
 *
 * Provides language support for hyperscript via the LokaScript Language Server.
 */

import * as path from 'path';
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext): void {
  // Path to the language server module
  const serverModule = context.asAbsolutePath(
    path.join('..', 'language-server', 'dist', 'server.js')
  );

  // If the extension is launched in debug mode, use the development server
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // Server options - run the server as a module
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.stdio,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: debugOptions,
    },
  };

  // Client options
  const clientOptions: LanguageClientOptions = {
    // Register the server for HTML documents (where _="..." attributes live)
    documentSelector: [
      { scheme: 'file', language: 'html' },
      { scheme: 'file', language: 'hyperscript' },
      { scheme: 'file', pattern: '**/*.hs' },
    ],
    synchronize: {
      // Notify the server about file changes to hyperscript files
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.hs'),
    },
    initializationOptions: {
      language: vscode.workspace.getConfiguration('lokascript').get('language', 'en'),
    },
  };

  // Create the language client and start it
  client = new LanguageClient(
    'lokascript',
    'LokaScript Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client (also launches the server)
  client.start();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('lokascript.restartServer', async () => {
      if (client) {
        await client.stop();
        await client.start();
        vscode.window.showInformationMessage('LokaScript Language Server restarted');
      }
    })
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('lokascript')) {
        // The server will pick up configuration changes via the standard LSP mechanism
        vscode.window.showInformationMessage(
          'LokaScript configuration changed. Some settings may require a server restart.'
        );
      }
    })
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
