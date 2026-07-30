/**
 * Infrastructure layer — WebSocket client and external service connections.
 *
 * The real implementation will use the `ws` package or a similar WebSocket
 * client. This stub exists so adapter code can reference the interface.
 *
 * Responsibilities:
 * - Connect to the ProgressMe WebSocket endpoint
 * - Send JSON-stringified envelopes
 * - Receive and route responses by RequestId
 * - Handle reconnection and session token refresh
 */

export class WebSocketClient {
  /**
   * @param {Object} options
   * @param {string} options.url - WebSocket URL
   * @param {string} [options.token] - Session token
   * @param {boolean} [options.dryRun] - Log instead of connecting
   */
  constructor({ url, token, dryRun = true } = {}) {
    this.url = url;
    this.token = token;
    this.dryRun = dryRun;
    this.ws = null;
    this.pendingRequests = new Map();
  }

  async connect() {
    throw new Error('Not implemented: WebSocketClient.connect');
  }

  async disconnect() {
    throw new Error('Not implemented: WebSocketClient.disconnect');
  }

  /**
   * Send an envelope and wait for the correlated response.
   * @param {Object} envelope - ProgressMe request envelope
   * @returns {Promise<Object>} Response body correlated by RequestId
   */
  async send(envelope) {
    throw new Error('Not implemented: WebSocketClient.send');
  }
}

export default { WebSocketClient };
