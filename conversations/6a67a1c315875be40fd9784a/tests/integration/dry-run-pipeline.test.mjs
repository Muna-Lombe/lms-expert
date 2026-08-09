/**
 * Integration test: dry-run pipeline end-to-end.
 *
 * Tests the full flow: domain object → ProgressMeAdapter → createEnvelope →
 * WebSocketClient (dry-run) → mock response → adapter maps back to domain object.
 *
 * No real WebSocket connection — dry-run mode only.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressMeAdapter } from '../../src/adapters/progressme/index.js';
import { createBook, createLesson, createExercise, ExerciseType } from '../../src/domain/index.js';

// Silent logger to keep test output clean
const silentLogger = { info() {}, warn() {}, error() {} };

/**
 * Create a real ProgressMeAdapter in dry-run mode with a real WebSocketClient.
 */
function createDryRunAdapter() {
  return new ProgressMeAdapter({
    wsUrl: 'wss://proxy-a.edvibe.com/websocket',
    dryRun: true,
    logger: silentLogger,
  });
}

// ─── Book pipeline ──────────────────────────────────────────────────

describe('Integration: Book pipeline (dry-run)', () => {
  const adapter = createDryRunAdapter();

  it('creates a book end-to-end and gets a domain Book back', async () => {
    const book = createBook({
      name: 'B1 English Progress Programme',
      languageId: 1,
      enableGroupingLessons: true,
    });

    const result = await adapter.bookUpsert(book);

    assert.ok(result, 'Should return a result');
    assert.ok(result.id, 'Should have an assigned ID from mock response');
    assert.equal(typeof result.id, 'number');
    assert.equal(result.name, 'B1 English Progress Programme');
    assert.equal(result.languageId, 1);
    assert.equal(result.enableGroupingLessons, true);
  });

  it('updates a book end-to-end', async () => {
    const book = createBook({
      id: 801168,
      name: 'B1 Programme v2',
      enableAccessBook: true,
    });

    const result = await adapter.bookUpsert(book);

    assert.ok(result.id, 'Should preserve the ID');
    assert.equal(result.name, 'B1 Programme v2');
  });

  it('reads a book via getBook', async () => {
    const response = await adapter.getBook(801168);

    assert.ok(response, 'Should get a response');
    assert.equal(response.Controller, 'BookWsController');
    assert.equal(response.Method, 'GetBook');
    assert.ok(response.RequestId, 'Should have a RequestId');
    assert.ok(response.Body, 'Should have a response body');
    assert.equal(response.Body.dryRun, true, 'Should be a dry-run mock');
  });

  it('lists personal books', async () => {
    const response = await adapter.getPersonalBooks();

    assert.equal(response.Controller, 'BookWsController');
    assert.equal(response.Method, 'GetPersonalBooks');
    assert.equal(response.Body.dryRun, true);
  });

  it('copies a book with copyright protection', async () => {
    const response = await adapter.copyBook(801168, {
      isVisible: true,
      isProtectedCopyright: true,
    });

    assert.equal(response.Method, 'CopyBook');
    assert.ok(response.Body);
  });
});

// ─── Lesson pipeline ────────────────────────────────────────────────

describe('Integration: Lesson pipeline (dry-run)', () => {
  const adapter = createDryRunAdapter();

  it('creates a lesson end-to-end and gets a domain Lesson back', async () => {
    const lesson = createLesson({
      name: 'Unit 1 — Introductions',
      courseId: 10001,
      number: 1,
      text: 'Introductions and goals',
      tags: { vocabulary: 'greetings', grammar: 'present simple' },
    });

    const result = await adapter.lessonUpsert(lesson);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.name, 'Unit 1 — Introductions');
    assert.equal(result.courseId, 10001);
    assert.equal(result.number, 1);
  });

  it('reads lessons for a course', async () => {
    const response = await adapter.getCourseLessons(10001);

    assert.equal(response.Controller, 'LessonWsController');
    assert.equal(response.Method, 'GetCourseLessons');
    assert.ok(response.Body);
  });

  it('reads a specific lesson by ID', async () => {
    const response = await adapter.getLessonWithId(500);

    assert.equal(response.Method, 'GetLessonWithId');
  });
});

// ─── Exercise pipeline ──────────────────────────────────────────────

describe('Integration: Exercise pipeline (dry-run)', () => {
  const adapter = createDryRunAdapter();

  it('creates a word-fill exercise end-to-end', async () => {
    const exercise = createExercise({
      type: ExerciseType.WORD_FILL_DRAG,
      name: 'Complete the sentence',
      lessonSectionId: 20001,
      content: { text: 'hello [friend] (someone).' },
    });

    const result = await adapter.saveExercise(exercise);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.name, 'Complete the sentence');
    assert.equal(result.type, ExerciseType.WORD_FILL_DRAG);
    assert.equal(result.lessonSectionId, 20001);
  });

  it('creates a test exercise end-to-end', async () => {
    const exercise = createExercise({
      type: ExerciseType.TEST,
      name: 'Take the test',
      lessonSectionId: 20001,
      content: {
        isEnabledTimer: true,
        timerDuration: 3,
        isEnabledPoints: false,
        questions: [{
          id: 12345,
          points: 1,
          question: 'What is 1 + 1?',
          answers: ['2', '1', '3'],
          questionAnswers: ['true', '', ''],
        }],
      },
    });

    const result = await adapter.saveExercise(exercise);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.name, 'Take the test');
    assert.equal(result.type, ExerciseType.TEST);
  });

  it('loads exercises for a material', async () => {
    const response = await adapter.loadExercisesInMaterial(500);

    assert.equal(response.Controller, 'ExerciseWsController');
    assert.equal(response.Method, 'LoadExercisesInMaterial');
  });
});

// ─── Tags and auth pipeline ─────────────────────────────────────────

describe('Integration: Tags and auth (dry-run)', () => {
  const adapter = createDryRunAdapter();

  it('fetches book tags', async () => {
    const response = await adapter.getBookTags(801168);
    assert.equal(response.Controller, 'MaterialTagsWsController');
    assert.equal(response.Method, 'GetBookTags');
  });

  it('fetches book lesson tags', async () => {
    const response = await adapter.getBookLessonTags(801168);
    assert.equal(response.Method, 'GetBookLessonTags');
  });

  it('gets current user', async () => {
    const response = await adapter.getCurrentUser();
    assert.equal(response.Controller, 'AccountWsController');
    assert.equal(response.Method, 'GetCurrentUser');
    // ProjectName is on the request envelope, not the response.
    // The mock response echoes Controller/Method/RequestId/Body only.
    assert.ok(response.RequestId, 'Should have a RequestId');
  });
});

// ─── Connection lifecycle ───────────────────────────────────────────

describe('Integration: Connection lifecycle (dry-run)', () => {
  it('connect and disconnect are no-ops in dry-run', async () => {
    const adapter = createDryRunAdapter();
    await adapter.connect();
    assert.ok(adapter.client.isConnected, 'Client should report connected in dry-run');
    await adapter.disconnect();
  });

  it('multiple operations work without reconnect', async () => {
    const adapter = createDryRunAdapter();
    await adapter.connect();

    const r1 = await adapter.getBook(1);
    const r2 = await adapter.getBook(2);
    const r3 = await adapter.getPersonalBooks();

    assert.ok(r1.RequestId !== r2.RequestId, 'Each request should have unique RequestId');
    assert.ok(r2.RequestId !== r3.RequestId, 'Each request should have unique RequestId');
    assert.ok(r1.RequestId !== r3.RequestId, 'Each request should have unique RequestId');
  });
});

// ─── RequestId uniqueness ──────────────────────────────────────────

describe('Integration: RequestId correlation', () => {
  it('every envelope gets a unique RequestId', async () => {
    const adapter = createDryRunAdapter();
    const ids = new Set();

    for (let i = 0; i < 20; i++) {
      const response = await adapter.getBook(i);
      ids.add(response.RequestId);
    }

    assert.equal(ids.size, 20, 'All 20 RequestIds should be unique');
  });
});
