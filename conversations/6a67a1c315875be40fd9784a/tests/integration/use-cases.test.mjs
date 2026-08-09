/**
 * Integration test: application use cases with a real ProgressMeAdapter.
 *
 * Unlike unit tests that inject a mock adapter, these tests use the actual
 * ProgressMeAdapter in dry-run mode. This verifies the full pipeline:
 * use case → real adapter → real WebSocketClient (dry-run) → mock response.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  importBook, exportBook, createLesson, createExercise,
} from '../../src/application/index.js';
import { ProgressMeAdapter } from '../../src/adapters/progressme/index.js';
import {
  createBook, createLesson as makeDomainLesson,
  createExercise as makeExercise, ExerciseType,
} from '../../src/domain/index.js';

const silentLogger = { info() {}, warn() {}, error() {} };

function createRealAdapter() {
  return new ProgressMeAdapter({
    wsUrl: 'wss://proxy-a.edvibe.com/websocket',
    dryRun: true,
    logger: silentLogger,
  });
}

// ─── importBook with real adapter ──────────────────────────────────

describe('Integration: importBook with real adapter (dry-run)', () => {
  it('returns a book structure from the real adapter pipeline', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const result = await importBook(adapter, { bookId: 801168 });

    assert.ok(result, 'Should return a result');
    assert.ok(result.book, 'Should return a book object');
    // In dry-run, Body is the mock (payload + Id:999), which is an object not a Book
    assert.ok(result.book.Id !== undefined || result.book.id !== undefined, 'Book should have an ID');
  });

  it('throws on null adapter', async () => {
    await assert.rejects(() => importBook(null, { bookId: 1 }), /adapter must implement/);
  });

  it('throws on missing bookId', async () => {
    const adapter = createRealAdapter();
    await assert.rejects(() => importBook(adapter, {}), /bookId is required/);
  });
});

// ─── exportBook with real adapter ──────────────────────────────────

describe('Integration: exportBook with real adapter (dry-run)', () => {
  it('creates a book through the real adapter and gets a domain Book back', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const book = createBook({ name: 'Integration Export Book', languageId: 1 });
    const result = await exportBook(adapter, book);

    assert.ok(result.book, 'Should return a created book');
    assert.ok(result.book.id, 'Should have an assigned ID from dry-run mock');
    assert.equal(result.book.name, 'Integration Export Book');
  });

  it('creates book + lessons through the real adapter', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const book = createBook({ name: 'Book with lessons' });
    const lessons = [
      { name: 'Lesson A', courseId: 100, number: 1 },
      { name: 'Lesson B', courseId: 100, number: 2 },
    ];
    const result = await exportBook(adapter, book, { lessons, courseId: 100 });

    assert.ok(result.book, 'Should have a created book');
    assert.equal(result.lessons.length, 2, 'Should have 2 created lessons');
    assert.ok(result.lessons[0].id, 'Lesson should have an ID');
    assert.equal(result.lessons[0].name, 'Lesson A');
  });

  it('throws on null adapter', async () => {
    await assert.rejects(() => exportBook(null, createBook()), /adapter must implement/);
  });
});

// ─── createLesson with real adapter ───────────────────────────────

describe('Integration: createLesson use case with real adapter (dry-run)', () => {
  it('creates a lesson and gets a domain Lesson back', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const result = await createLesson(adapter, {
      name: 'Integration Lesson',
      courseId: 10001,
      number: 5,
    });

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.name, 'Integration Lesson');
    assert.equal(result.courseId, 10001);
    assert.equal(result.number, 5);
  });

  it('throws on null adapter', async () => {
    await assert.rejects(() => createLesson(null, {}), /adapter must implement/);
  });
});

// ─── createExercise with real adapter ─────────────────────────────

describe('Integration: createExercise use case with real adapter (dry-run)', () => {
  it('creates a word-fill exercise and gets a domain Exercise back', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const exercise = makeExercise({
      type: ExerciseType.WORD_FILL_DRAG,
      name: 'Integration Fill',
      lessonSectionId: 20001,
      content: { text: 'The [cat] sat on the [mat].' },
    });

    const result = await createExercise(adapter, exercise);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.name, 'Integration Fill');
    assert.equal(result.type, ExerciseType.WORD_FILL_DRAG);
  });

  it('creates a test exercise and gets a domain Exercise back', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const exercise = makeExercise({
      type: ExerciseType.TEST,
      name: 'Integration Test',
      lessonSectionId: 20001,
      content: {
        isEnabledTimer: true,
        timerDuration: 5,
        questions: [{
          id: 1,
          question: '2+2?',
          answers: ['4', '3', '5'],
          questionAnswers: ['true', '', ''],
        }],
      },
    });

    const result = await createExercise(adapter, exercise);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.name, 'Integration Test');
    assert.equal(result.type, ExerciseType.TEST);
  });

  it('throws on null adapter', async () => {
    await assert.rejects(() => createExercise(null, {}), /adapter must implement/);
  });
});

// ─── Full workflow: create book → create lesson → create exercise ─

describe('Integration: Full authoring workflow (dry-run)', () => {
  it('creates a book, then a lesson, then an exercise in sequence', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    // Step 1: Create a book
    const book = createBook({
      name: 'Full Workflow Book',
      languageId: 1,
      enableGroupingLessons: true,
    });
    const createdBook = await adapter.bookUpsert(book);
    assert.ok(createdBook.id, 'Book should have an ID');

    // Step 2: Create a lesson under a course (using a placeholder courseId)
    const lesson = makeDomainLesson({
      name: 'Workflow Lesson 1',
      courseId: 10001,
      number: 1,
    });
    const createdLesson = await adapter.lessonUpsert(lesson);
    assert.ok(createdLesson.id, 'Lesson should have an ID');

    // Step 3: Create an exercise under the lesson's section
    const exercise = makeExercise({
      type: ExerciseType.WORD_FILL_DRAG,
      name: 'Workflow Exercise',
      lessonSectionId: 20001,
      content: { text: 'I [am] a teacher.' },
    });
    const createdExercise = await adapter.saveExercise(exercise);
    assert.ok(createdExercise.id, 'Exercise should have an ID');

    // Verify the hierarchy is consistent
    assert.equal(createdBook.name, 'Full Workflow Book');
    assert.equal(createdLesson.name, 'Workflow Lesson 1');
    assert.equal(createdExercise.name, 'Workflow Exercise');
  });

  it('exportBook with lessons and exercises through real adapter', async () => {
    const adapter = createRealAdapter();
    await adapter.connect();

    const book = createBook({ name: 'Export with Exercises' });
    const lessons = [
      { name: 'Lesson 1', number: 1 },
      { name: 'Lesson 2', number: 2 },
    ];
    const result = await exportBook(adapter, book, { lessons, courseId: 100 });

    assert.ok(result.book.id, 'Book should have an ID');
    assert.equal(result.lessons.length, 2, 'Should have 2 lessons');
    assert.ok(result.lessons[0].id, 'First lesson should have an ID');
    assert.ok(result.lessons[1].id, 'Second lesson should have an ID');
  });
});
