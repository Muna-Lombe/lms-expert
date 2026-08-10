/**
 * Infrastructure layer — WebSocket client for ProgressMe RPC.
 *
 * Dry-run mode (default): logs envelopes to stdout, returns mock responses.
 * Real mode: dynamically imports `ws` and connects to the WebSocket endpoint.
 * Response correlation by RequestId is implemented but response bodies are
 * not parsed (inbound captures not yet available).
 *
 * @see docs/core/PROGRESSME_STATUS.md for capture gaps.
 */

/** Default mock response for dry-run mode. */
function mockResponse(envelope) {
  return {
    RequestId: envelope.RequestId,
    Controller: envelope.Controller,
    Method: envelope.Method,
    // Response body is untyped — return a minimal mock with a fake ID
    // so the caller can proceed in dry-run mode.
    Body: { ok: true, dryRun: true, Id: Math.floor(Math.random() * 1000000) + 1 },
  };
}

export class WebSocketClient {
  /**
   * @param {Object} options
   * @param {string} options.url - WebSocket URL (PROGRESSME_WS_URL)
   * @param {string} [options.token] - Session token (PROGRESSME_TOKEN)
   * @param {boolean} [options.dryRun] - Log instead of connecting (default: true)
   * @param {Object} [options.logger] - Console-like object with .info/.warn/.error
   */
  constructor({ url, token, dryRun = true, logger } = {}) {
    this.url = url;
    this.token = token;
    this.dryRun = dryRun;
    this.logger = logger || console;
    this.ws = null;
    this.pendingRequests = new Map();
    this._messageHandler = null;
  }

  /**
   * Connect to the WebSocket endpoint.
   * In dry-run mode, this is a no-op.
   * In real mode, dynamically imports `ws` and connects.
   */
  async connect() {
    if (this.dryRun) {
      this.logger.info(`[dry-run] WebSocketClient: would connect to ${this.url}`);
      return;
    }

    if (!this.url) {
      throw new Error('WebSocketClient: url is required for real mode');
    }

    // Dynamic import — keeps zero dependencies when dry-run
    let WebSocketImpl;
    try {
      const ws = await import('ws');
      WebSocketImpl = ws.WebSocket || ws.default;
    } catch {
      throw new Error(
        'WebSocketClient: real mode requires the `ws` package. ' +
        'Install it with `npm install ws`, or use dryRun: true.'
      );
    }

    return new Promise((resolve, reject) => {
      const wsUrl = this.token
        ? `${this.url}?token=${encodeURIComponent(this.token)}`
        : this.url;

      this.ws = new WebSocketImpl(wsUrl);
      this.ws.on('open', () => {
        this.logger.info(`WebSocketClient: connected to ${wsUrl}`);
        resolve();
      });
      this.ws.on('error', (err) => {
        this.logger.error(`WebSocketClient: connection error — ${err.message}`);
        reject(err);
      });
      this.ws.on('message', (data) => {
        this._handleMessage(data);
      });
      this.ws.on('close', () => {
        this.logger.info('WebSocketClient: connection closed');
        // Reject any pending requests
        for (const [requestId, { reject: rej }] of this.pendingRequests) {
          rej(new Error(`WebSocket closed before response for RequestId ${requestId}`));
          this.pendingRequests.delete(requestId);
        }
      });
    });
  }

  /**
   * Disconnect from the WebSocket endpoint.
   */
  async disconnect() {
    if (this.dryRun) {
      this.logger.info('[dry-run] WebSocketClient: would disconnect');
      return;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send an envelope and return the correlated response.
   *
   * In dry-run mode: logs the envelope and returns a mock response.
   * In real mode: sends the envelope, waits for the response with
   * matching RequestId, and resolves with the parsed JSON body.
   *
   * @param {Object} envelope - ProgressMe request envelope (from createEnvelope)
   * @param {number} [timeoutMs=10000] - Response timeout (real mode only)
   * @returns {Promise<Object>} Response correlated by RequestId
   */
  async send(envelope, timeoutMs = 10000) {
    if (this.dryRun) {
      const payload = JSON.stringify(envelope, null, 2);
      this.logger.info(`[dry-run] SEND →\n${payload}`);
      return mockResponse(envelope);
    }

    if (!this.ws || this.ws.readyState !== 1 /* OPEN */) {
      throw new Error('WebSocketClient: not connected. Call connect() first.');
    }

    const json = JSON.stringify(envelope);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(envelope.RequestId);
        reject(new Error(`Timeout waiting for response to RequestId ${envelope.RequestId}`));
      }, timeoutMs);

      this.pendingRequests.set(envelope.RequestId, {
        resolve: (body) => { clearTimeout(timer); resolve(body); },
        reject: (err) => { clearTimeout(timer); reject(err); },
      });

      this.ws.send(json, (err) => {
        if (err) {
          clearTimeout(timer);
          this.pendingRequests.delete(envelope.RequestId);
          reject(new Error(`Send error: ${err.message}`));
        }
      });
    });
  }

  /**
   * Handle an inbound WebSocket message.
   * Routes by RequestId to the pending request.
   * @private
   */
  _handleMessage(data) {
    let parsed;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      this.logger.warn(`WebSocketClient: received non-JSON message, ignoring`);
      return;
    }

    const requestId = parsed.RequestId;
    if (!requestId) {
      this.logger.warn(`WebSocketClient: received message without RequestId, ignoring`);
      return;
    }

    const pending = this.pendingRequests.get(requestId);
    if (pending) {
      this.pendingRequests.delete(requestId);
      pending.resolve(parsed);
    } else {
      this.logger.warn(`WebSocketClient: no pending request for RequestId ${requestId}`);
    }
  }

  /**
   * Check if the client is connected.
   */
  get isConnected() {
    if (this.dryRun) return true;
    return this.ws !== null && this.ws.readyState === 1;
  }
}

export default { WebSocketClient };
