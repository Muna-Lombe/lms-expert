import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  importBook, exportBook, createLesson, createExercise,
} from '../../src/application/index.js';
import { createBook, createExercise as makeExercise, ExerciseType } from '../../src/domain/index.js';

/**
 * Mock adapter that records calls and returns canned responses.
 */
function createMockAdapter() {
  const calls = [];
  const adapter = {
    async getBook(bookId) {
      calls.push({ method: 'getBook', bookId });
      return { Body: { Id: bookId, Name: 'Mock Book' } };
    },
    async getBookCourses(bookId) {
      calls.push({ method: 'getBookCourses', bookId });
      return { Body: [{ Id: 100, Name: 'Course A' }, { Id: 200, Name: 'Course B' }] };
    },
    async getCourseLessons(courseId) {
      calls.push({ method: 'getCourseLessons', courseId });
      return { Body: [{ Id: 500, Name: `Lesson for ${courseId}` }] };
    },
    async loadExercisesInMaterial(materialId) {
      calls.push({ method: 'loadExercisesInMaterial', materialId });
      return { Body: [{ Id: 900, Type: 18, Name: 'Exercise' }] };
    },
    async bookUpsert(book) {
      calls.push({ method: 'bookUpsert', book });
      return { id: 999, name: book.name };
    },
    async lessonUpsert(lesson) {
      calls.push({ method: 'lessonUpsert', lesson });
      return { ...lesson, id: 888, courseId: lesson.courseId, name: lesson.name };
    },
    async saveExercise(exercise) {
      calls.push({ method: 'saveExercise', exercise });
      return { ...exercise, id: 777 };
    },
  };
  return { adapter, calls };
}

// ─── importBook ────────────────────────────────────────────────────

describe('importBook', () => {
  it('fetches book, courses, lessons, and exercises', async () => {
    const { adapter, calls } = createMockAdapter();
    const result = await importBook(adapter, { bookId: 801168 });

    assert.ok(result.book, 'Should return a book');
    assert.ok(Array.isArray(result.courses), 'Should return courses array');
    assert.ok(Array.isArray(result.lessons), 'Should return lessons array');
    assert.ok(Array.isArray(result.exercises), 'Should return exercises array');

    assert.ok(calls.some(c => c.method === 'getBook' && c.bookId === 801168));
    assert.ok(calls.some(c => c.method === 'getBookCourses' && c.bookId === 801168));
    assert.ok(calls.filter(c => c.method === 'getCourseLessons').length === 2);
    assert.ok(calls.filter(c => c.method === 'loadExercisesInMaterial').length === 2);
  });

  it('throws if adapter is null', async () => {
    await assert.rejects(() => importBook(null, { bookId: 1 }), /adapter must implement getBook/);
  });

  it('throws if bookId is missing', async () => {
    const { adapter } = createMockAdapter();
    await assert.rejects(() => importBook(adapter, {}), /bookId is required/);
  });

  it('handles empty courses gracefully', async () => {
    const adapter = {
      async getBook() { return { Body: { Id: 1, Name: 'Book' } }; },
      async getBookCourses() { return { Body: [] }; },
    };
    const result = await importBook(adapter, { bookId: 1 });
    assert.deepEqual(result.courses, []);
    assert.deepEqual(result.lessons, []);
    assert.deepEqual(result.exercises, []);
  });
});

// ─── exportBook ────────────────────────────────────────────────────

describe('exportBook', () => {
  it('creates book via adapter', async () => {
    const { adapter, calls } = createMockAdapter();
    const book = createBook({ name: 'Export Test' });
    const result = await exportBook(adapter, book);

    assert.ok(result.book, 'Should return created book');
    assert.equal(result.book.id, 999);
    assert.equal(result.book.name, 'Export Test');
    assert.ok(calls.some(c => c.method === 'bookUpsert'));
  });

  it('creates lessons if provided', async () => {
    const { adapter, calls } = createMockAdapter();
    const book = createBook({ name: 'Book with lessons' });
    const lessons = [
      { name: 'Lesson 1', courseId: 100, number: 1 },
      { name: 'Lesson 2', courseId: 100, number: 2 },
    ];
    const result = await exportBook(adapter, book, { lessons, courseId: 100 });

    assert.equal(calls.filter(c => c.method === 'lessonUpsert').length, 2);
    assert.equal(result.lessons.length, 2);
  });

  it('throws if adapter is null', async () => {
    await assert.rejects(() => exportBook(null, createBook()), /adapter must implement bookUpsert/);
  });
});

// ─── createLesson ──────────────────────────────────────────────────

describe('createLesson (use case)', () => {
  it('delegates to adapter.lessonUpsert', async () => {
    const { adapter, calls } = createMockAdapter();
    const lesson = { name: 'New Lesson', courseId: 100 };
    const result = await createLesson(adapter, lesson);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.id, 888);
    assert.ok(calls.some(c => c.method === 'lessonUpsert'));
  });

  it('throws if adapter is null', async () => {
    await assert.rejects(() => createLesson(null, {}), /adapter must implement lessonUpsert/);
  });
});

// ─── createExercise ────────────────────────────────────────────────

describe('createExercise (use case)', () => {
  it('delegates to adapter.saveExercise', async () => {
    const { adapter, calls } = createMockAdapter();
    const exercise = makeExercise({
      type: ExerciseType.WORD_FILL_DRAG,
      name: 'Fill',
      lessonSectionId: 1,
      content: { text: 'hello [world]' },
    });
    const result = await createExercise(adapter, exercise);

    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.id, 777);
    assert.ok(calls.some(c => c.method === 'saveExercise'));
  });

  it('throws if adapter is null', async () => {
    await assert.rejects(() => createExercise(null, {}), /adapter must implement saveExercise/);
  });
});

// ─── Vendor isolation: application layer ───────────────────────────

describe('vendor isolation — application layer', () => {
  const source = readFileSync(join(process.cwd(), 'src/application/index.js'), 'utf-8');
  const codeOnly = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it('no BookWsController in application code', () =>
    assert.ok(!codeOnly.includes('BookWsController'), 'BookWsController found in application'));
  it('no LessonWsController in application code', () =>
    assert.ok(!codeOnly.includes('LessonWsController'), 'LessonWsController found in application'));
  it('no ExerciseWsController in application code', () =>
    assert.ok(!codeOnly.includes('ExerciseWsController'), 'ExerciseWsController found in application'));
  it('no PasteWordByDrag in application code', () =>
    assert.ok(!codeOnly.includes('PasteWordByDrag'), 'PasteWordByDrag found in application'));
  it('no ProjectName in application code', () =>
    assert.ok(!codeOnly.includes('ProjectName'), 'ProjectName found in application'));
  it('no PascalCase IsEnable in application code', () =>
    assert.ok(!codeOnly.includes('IsEnable'), 'IsEnable* found in application'));
});
