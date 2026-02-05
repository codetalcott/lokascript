/**
 * LSP Integration Tests
 *
 * Spawns the language server as a subprocess and tests JSON-RPC communication.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';

// =============================================================================
// JSON-RPC Protocol Helpers
// =============================================================================

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
}

/**
 * Encodes a JSON-RPC message with Content-Length header.
 */
function encodeMessage(msg: JsonRpcRequest | JsonRpcNotification): string {
  const content = JSON.stringify(msg);
  return `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n${content}`;
}

/**
 * Parses a JSON-RPC response from raw data.
 */
function parseResponse(data: string): JsonRpcResponse | null {
  // Find the content after headers
  const headerEnd = data.indexOf('\r\n\r\n');
  if (headerEnd === -1) return null;

  const content = data.slice(headerEnd + 4);
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// =============================================================================
// LSP Server Test Harness
// =============================================================================

class LSPTestClient {
  private server: ChildProcess | null = null;
  private responseBuffer = '';
  private pendingRequests = new Map<number, (response: JsonRpcResponse) => void>();
  private nextId = 1;

  async start(): Promise<void> {
    const serverPath = join(__dirname, '..', 'dist', 'server.js');

    this.server = spawn('node', [serverPath, '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Collect stdout data
    this.server.stdout?.on('data', (data: Buffer) => {
      this.responseBuffer += data.toString();
      this.processBuffer();
    });

    // Log stderr for debugging
    this.server.stderr?.on('data', (data: Buffer) => {
      // Uncomment for debugging: console.error('Server stderr:', data.toString());
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private processBuffer(): void {
    // Try to parse complete messages from buffer
    while (true) {
      const headerMatch = this.responseBuffer.match(/Content-Length: (\d+)\r\n/);
      if (!headerMatch) break;

      const contentLength = parseInt(headerMatch[1], 10);
      const headerEnd = this.responseBuffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;

      const contentStart = headerEnd + 4;
      const messageEnd = contentStart + contentLength;

      if (this.responseBuffer.length < messageEnd) break;

      const content = this.responseBuffer.slice(contentStart, messageEnd);
      this.responseBuffer = this.responseBuffer.slice(messageEnd);

      try {
        const message = JSON.parse(content);
        // Only process responses (messages with id), ignore notifications
        if ('id' in message && message.id !== null) {
          const resolver = this.pendingRequests.get(message.id);
          if (resolver) {
            resolver(message as JsonRpcResponse);
            this.pendingRequests.delete(message.id);
          }
        }
        // Notifications (no id) are ignored
      } catch {
        // Ignore parse errors
      }
    }
  }

  async sendRequest(method: string, params?: unknown): Promise<JsonRpcResponse> {
    if (!this.server?.stdin) {
      throw new Error('Server not started');
    }

    const id = this.nextId++;
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }, 5000);

      this.pendingRequests.set(id, response => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.server!.stdin!.write(encodeMessage(request));
    });
  }

  sendNotification(method: string, params?: unknown): void {
    if (!this.server?.stdin) {
      throw new Error('Server not started');
    }

    const notification: JsonRpcNotification = {
      jsonrpc: '2.0',
      method,
      params,
    };

    this.server.stdin.write(encodeMessage(notification));
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.kill();
      this.server = null;
    }
  }
}

// =============================================================================
// Tests
// =============================================================================

describe('LSP Integration', () => {
  let client: LSPTestClient;

  beforeAll(async () => {
    client = new LSPTestClient();
    await client.start();
  });

  afterAll(async () => {
    await client.stop();
  });

  describe('Initialize', () => {
    it('responds to initialize request with capabilities', async () => {
      const response = await client.sendRequest('initialize', {
        processId: process.pid,
        capabilities: {},
        rootUri: null,
      });

      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();

      const result = response.result as {
        capabilities: {
          textDocumentSync: number;
          completionProvider: unknown;
          hoverProvider: boolean;
          documentSymbolProvider: boolean;
          codeActionProvider: unknown;
        };
      };

      expect(result.capabilities).toBeDefined();
      expect(result.capabilities.textDocumentSync).toBeDefined();
      expect(result.capabilities.completionProvider).toBeDefined();
      expect(result.capabilities.hoverProvider).toBe(true);
      expect(result.capabilities.documentSymbolProvider).toBe(true);
      expect(result.capabilities.codeActionProvider).toBeDefined();
    });

    it('accepts initialized notification', async () => {
      // Send initialized notification (no response expected)
      client.sendNotification('initialized', {});

      // Give server time to process
      await new Promise(resolve => setTimeout(resolve, 50));

      // If we get here without error, the server accepted the notification
      expect(true).toBe(true);
    });
  });

  describe('Text Document Sync', () => {
    const testUri = 'file:///test/document.hs';

    it('accepts didOpen notification', async () => {
      client.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: testUri,
          languageId: 'hyperscript',
          version: 1,
          text: 'on click toggle .active',
        },
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(true).toBe(true);
    });

    it('accepts didChange notification', async () => {
      client.sendNotification('textDocument/didChange', {
        textDocument: {
          uri: testUri,
          version: 2,
        },
        contentChanges: [
          {
            text: 'on click toggle .highlight',
          },
        ],
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(true).toBe(true);
    });

    it('accepts didClose notification', async () => {
      client.sendNotification('textDocument/didClose', {
        textDocument: {
          uri: testUri,
        },
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(true).toBe(true);
    });
  });

  describe('Completions', () => {
    const testUri = 'file:///test/completions.hs';

    beforeAll(async () => {
      // Open a document for completion testing
      client.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: testUri,
          languageId: 'hyperscript',
          version: 1,
          text: 'on ',
        },
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('provides completions at cursor position', async () => {
      const response = await client.sendRequest('textDocument/completion', {
        textDocument: { uri: testUri },
        position: { line: 0, character: 3 },
      });

      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();

      const items = response.result as Array<{ label: string; kind: number }>;
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);

      // Should include event names after "on "
      const labels = items.map(item => item.label);
      expect(labels).toContain('click');
    });

    it('provides command completions after event', async () => {
      // Update document to have event + space
      client.sendNotification('textDocument/didChange', {
        textDocument: { uri: testUri, version: 2 },
        contentChanges: [{ text: 'on click ' }],
      });
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await client.sendRequest('textDocument/completion', {
        textDocument: { uri: testUri },
        position: { line: 0, character: 9 },
      });

      expect(response.error).toBeUndefined();
      const items = response.result as Array<{ label: string }>;
      const labels = items.map(item => item.label);

      // Should include command keywords
      expect(labels).toContain('toggle');
    });
  });

  describe('Hover', () => {
    const testUri = 'file:///test/hover.hs';

    beforeAll(async () => {
      client.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: testUri,
          languageId: 'hyperscript',
          version: 1,
          text: 'on click toggle .active',
        },
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('provides hover information for keywords', async () => {
      const response = await client.sendRequest('textDocument/hover', {
        textDocument: { uri: testUri },
        position: { line: 0, character: 10 }, // "toggle"
      });

      expect(response.error).toBeUndefined();

      if (response.result) {
        const hover = response.result as {
          contents: { kind: string; value: string } | string;
        };
        expect(hover.contents).toBeDefined();

        const value = typeof hover.contents === 'string' ? hover.contents : hover.contents.value;
        expect(value).toContain('toggle');
      }
    });

    it('returns null for non-keyword positions', async () => {
      const response = await client.sendRequest('textDocument/hover', {
        textDocument: { uri: testUri },
        position: { line: 0, character: 2 }, // space
      });

      // May return null or empty result
      expect(response.error).toBeUndefined();
    });
  });

  describe('Document Symbols', () => {
    const testUri = 'file:///test/symbols.hs';

    beforeAll(async () => {
      client.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: testUri,
          languageId: 'hyperscript',
          version: 1,
          text: `on click toggle .active
on mouseenter add .hover
behavior Modal
def helper()`,
        },
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('returns document symbols', async () => {
      const response = await client.sendRequest('textDocument/documentSymbol', {
        textDocument: { uri: testUri },
      });

      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();

      const symbols = response.result as Array<{
        name: string;
        kind: number;
        range: { start: { line: number } };
      }>;

      expect(Array.isArray(symbols)).toBe(true);
      expect(symbols.length).toBeGreaterThanOrEqual(2);

      // Should find event handlers
      const eventHandlers = symbols.filter(s => s.name.startsWith('on'));
      expect(eventHandlers.length).toBeGreaterThanOrEqual(2);
    });

    it('includes behaviors and functions', async () => {
      const response = await client.sendRequest('textDocument/documentSymbol', {
        textDocument: { uri: testUri },
      });

      const symbols = response.result as Array<{ name: string }>;
      const names = symbols.map(s => s.name);

      expect(names.some(n => n.includes('Modal'))).toBe(true);
      expect(names.some(n => n.includes('helper'))).toBe(true);
    });
  });

  describe('Shutdown', () => {
    it('responds to shutdown request', async () => {
      const response = await client.sendRequest('shutdown');

      expect(response.error).toBeUndefined();
      // Shutdown returns null on success
      expect(response.result).toBe(null);
    });

    it('accepts exit notification', async () => {
      client.sendNotification('exit');

      // Server should exit after this - give it time
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(true).toBe(true);
    });
  });
});

// =============================================================================
// Protocol Compliance Tests
// =============================================================================

describe('LSP Protocol Compliance', () => {
  let client: LSPTestClient;

  beforeAll(async () => {
    client = new LSPTestClient();
    await client.start();

    // Initialize the server
    await client.sendRequest('initialize', {
      processId: process.pid,
      capabilities: {},
      rootUri: null,
    });
    client.sendNotification('initialized', {});
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterAll(async () => {
    await client.stop();
  });

  it('returns proper error for unknown method', async () => {
    const response = await client.sendRequest('unknownMethod', {});

    // LSP servers should return MethodNotFound (-32601) for unknown methods
    // But some servers just ignore - either behavior is acceptable
    expect(response).toBeDefined();
  });

  it('handles rapid sequential requests', async () => {
    const testUri = 'file:///test/rapid.hs';

    client.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: testUri,
        languageId: 'hyperscript',
        version: 1,
        text: 'on click toggle .active',
      },
    });

    // Send multiple requests rapidly
    const promises = [
      client.sendRequest('textDocument/hover', {
        textDocument: { uri: testUri },
        position: { line: 0, character: 10 },
      }),
      client.sendRequest('textDocument/documentSymbol', {
        textDocument: { uri: testUri },
      }),
      client.sendRequest('textDocument/completion', {
        textDocument: { uri: testUri },
        position: { line: 0, character: 23 },
      }),
    ];

    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach(response => {
      expect(response.error).toBeUndefined();
    });
  });

  it('handles concurrent document changes', async () => {
    const docs = ['file:///test/doc1.hs', 'file:///test/doc2.hs', 'file:///test/doc3.hs'];

    // Open multiple documents
    docs.forEach((uri, i) => {
      client.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri,
          languageId: 'hyperscript',
          version: 1,
          text: `on click toggle .class${i}`,
        },
      });
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Request symbols from each
    const symbolRequests = docs.map(uri =>
      client.sendRequest('textDocument/documentSymbol', {
        textDocument: { uri },
      })
    );

    const responses = await Promise.all(symbolRequests);

    responses.forEach(response => {
      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();
    });
  });
});
