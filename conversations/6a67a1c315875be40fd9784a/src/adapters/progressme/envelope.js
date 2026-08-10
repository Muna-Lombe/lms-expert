/**
 * ProgressMe WebSocket envelope builder.
 *
 * Creates the canonical request envelope for all ProgressMe WebSocket
 * RPC operations:
 *
 * {
 *   "Controller": "BookWsController",
 *   "Method": "BookUpsert",
 *   "ProjectName": "Books",
 *   "RequestId": "<UUID>",
 *   "Value": "<JSON.stringify(payload)>"
 * }
 *
 * Rules:
 * - Preserve PascalCase property names (vendor convention).
 * - Value is JSON.stringify(payload), not a nested object.
 * - RequestId is a fresh UUID per call.
 * - Use '""' for empty payloads (encoded empty string).
 */

import { randomUUID } from 'crypto';

/**
 * Build a ProgressMe WebSocket request envelope.
 *
 * @param {string} controller - Controller name (e.g. 'BookWsController')
 * @param {string} method - Method name (e.g. 'BookUpsert')
 * @param {string} projectName - Project namespace (e.g. 'Books', 'Users', 'MainWs')
 * @param {Object|string} [value] - Payload object to stringify, or '' for empty.
 *                                  If omitted or '', Value becomes '""'.
 * @returns {Object} The envelope object ready to JSON.stringify and send.
 */
export function createEnvelope(controller, method, projectName, value) {
  const envelope = {
    Controller: controller,
    Method: method,
    ProjectName: projectName,
    RequestId: randomUUID(),
    Value: value === undefined || value === '' || value === null
      ? '""'
      : typeof value === 'string'
        ? value
        : JSON.stringify(value),
  };
  return envelope;
}

export default { createEnvelope };
