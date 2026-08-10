import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ASYNC_API_PATH = join(process.cwd(), 'asyncapi/progressme.websocket.asyncapi.yaml');
const WS_GUIDE_PATH = join(process.cwd(), 'ProgressMe_WebSocket_Guide.md');

const asyncApiContent = readFileSync(ASYNC_API_PATH, 'utf-8');
const wsGuideContent = readFileSync(WS_GUIDE_PATH, 'utf-8');

describe('AsyncAPI file exists and is valid YAML structure', () => {
  it('file exists', () => assert.ok(existsSync(ASYNC_API_PATH)));
  it('starts with asyncapi: 3.0.0', () =>
    assert.ok(asyncApiContent.startsWith('asyncapi: 3.0.0'), 'Should start with asyncapi: 3.0.0'));
  it('has info section with title', () =>
    assert.ok(asyncApiContent.includes('title: ProgressMe WebSocket Authoring API')));
  it('has info section with version', () =>
    assert.ok(asyncApiContent.includes('version: 0.1.0')));
  it('has x-status field', () =>
    assert.ok(asyncApiContent.includes('x-status: observed-private-websocket-authoring')));
  it('has servers section', () => assert.ok(asyncApiContent.includes('servers:')));
  it('has channels section', () => assert.ok(asyncApiContent.includes('channels:')));
  it('has operations section', () => assert.ok(asyncApiContent.includes('operations:')));
  it('has components section', () => assert.ok(asyncApiContent.includes('components:')));
  it('has messages section under components', () => assert.ok(asyncApiContent.includes('messages:')));
  it('has schemas section under components', () => assert.ok(asyncApiContent.includes('schemas:')));
});

// Extract all Method names from the WebSocket guide's merged operation inventory table.
// The table rows look like: | Area | `Controller.Method` | Project | Capture status |
const guideMethods = [...wsGuideContent.matchAll(/`(\w+WsController)\.(\w+)`|`(ProfileBlockController)\.(\w+)`/g)]
  .map(m => m[2] || m[4])
  .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

// Also check methods that are listed differently (e.g. SaveExercise type variants)
const allGuideMethodNames = new Set([
  ...guideMethods,
  // SaveExercise appears as two variants in the guide
  'SaveExercise',
]);

describe('AsyncAPI covers all operations from WebSocket guide', () => {
  for (const method of allGuideMethodNames) {
    it(`AsyncAPI contains method: ${method}`, () => {
      assert.ok(
        asyncApiContent.includes(method),
        `AsyncAPI spec missing method '${method}' found in WebSocket guide`
      );
    });
  }
});

// Check specific controller names
const expectedControllers = [
  'BookWsController',
  'CourseWsController',
  'LessonWsController',
  'ExerciseWsController',
  'MaterialTagsWsController',
  'SharingMaterialWsController',
  'AccountWsController',
  'UserWsController',
  'ProfileBlockController',
];

describe('AsyncAPI contains all expected controllers', () => {
  for (const controller of expectedControllers) {
    it(`contains controller: ${controller}`, () => {
      assert.ok(asyncApiContent.includes(controller), `Missing controller: ${controller}`);
    });
  }
});

// Check ProjectName values
const expectedProjectNames = ['Books', 'Users', 'MainWs'];

describe('AsyncAPI contains all expected ProjectName values', () => {
  for (const pn of expectedProjectNames) {
    it(`contains ProjectName: ${pn}`, () => {
      assert.ok(asyncApiContent.includes(pn), `Missing ProjectName: ${pn}`);
    });
  }
});

describe('AsyncAPI response bodies are untyped', () => {
  it('has a GenericResponse message', () =>
    assert.ok(asyncApiContent.includes('GenericResponse')));
  it('GenericResponse uses additionalProperties: true', () => {
    // Find the GenericResponse section and check for additionalProperties: true
    const genericRespIdx = asyncApiContent.indexOf('GenericResponse:');
    assert.ok(genericRespIdx >= 0, 'GenericResponse not found');
    const nextMsgIdx = asyncApiContent.indexOf('message:', genericRespIdx + 100);
    const section = asyncApiContent.slice(genericRespIdx, nextMsgIdx > 0 ? nextMsgIdx : genericRespIdx + 500);
    assert.ok(
      section.includes('additionalProperties: true'),
      'GenericResponse should use additionalProperties: true'
    );
  });
  it('mentions that response bodies are not captured', () => {
    assert.ok(
      asyncApiContent.includes('not yet captured') || asyncApiContent.includes('not yet') || asyncApiContent.includes('uncaptured'),
      'AsyncAPI should note that response bodies are not captured'
    );
  });
});

describe('AsyncAPI envelope schema', () => {
  it('has an Envelope message definition', () =>
    assert.ok(asyncApiContent.includes('Envelope:')));
  it('Envelope requires Controller', () =>
    assert.ok(asyncApiContent.includes('Controller:')));
  it('Envelope requires Method', () =>
    assert.ok(asyncApiContent.includes('Method:')));
  it('Envelope requires ProjectName', () =>
    assert.ok(asyncApiContent.includes('ProjectName:')));
  it('Envelope requires RequestId', () =>
    assert.ok(asyncApiContent.includes('RequestId:')));
  it('Envelope payload is type string', () => {
    // The Envelope message uses `payload:` (AsyncAPI convention) with `type: string`
    // to represent the Value field (which is JSON.stringify(payload)).
    const envelopeIdx = asyncApiContent.indexOf('Envelope:');
    const section = asyncApiContent.slice(envelopeIdx, envelopeIdx + 1200);
    assert.ok(
      section.includes('payload:') && section.includes('type: string'),
      'Envelope payload should be type: string'
    );
  });
  it('Envelope payload description mentions stringified', () => {
    const envelopeIdx = asyncApiContent.indexOf('Envelope:');
    const section = asyncApiContent.slice(envelopeIdx, envelopeIdx + 1200);
    assert.ok(
      section.includes('string') && section.includes('not a nested object'),
      'Envelope payload should mention it is a string, not a nested object'
    );
  });
});
