import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBook, createCourse, createLesson, createLessonSection,
  createExercise, ExerciseType,
} from '../../src/domain/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('createBook', () => {
  it('returns an object with default values', () => {
    const book = createBook();
    assert.equal(book.id, null);
    assert.equal(book.name, '');
    assert.equal(book.description, '');
    assert.equal(book.languageId, 1);
    assert.equal(book.enableGroupingLessons, false);
    assert.equal(book.enableAccessBook, false);
    assert.deepEqual(book.tags, { ages: [], levels: [], types: [] });
  });

  it('applies overrides', () => {
    const book = createBook({ name: 'B1 Programme', id: 801168, languageId: 2 });
    assert.equal(book.id, 801168);
    assert.equal(book.name, 'B1 Programme');
    assert.equal(book.languageId, 2);
    assert.equal(book.enableGroupingLessons, false);
    assert.deepEqual(book.tags, { ages: [], levels: [], types: [] });
  });

  it('allows partial tag override', () => {
    const book = createBook({ tags: { ages: ['adult'], levels: [], types: [] } });
    assert.deepEqual(book.tags.ages, ['adult']);
  });

  it('returns a new object each call (no shared references)', () => {
    const a = createBook();
    const b = createBook();
    assert.notEqual(a, b);
    assert.notEqual(a.tags, b.tags);
  });
});

describe('createCourse', () => {
  it('returns an object with default values', () => {
    const course = createCourse();
    assert.equal(course.id, null);
    assert.equal(course.bookId, null);
    assert.equal(course.name, '');
  });

  it('applies overrides', () => {
    const course = createCourse({ id: 10001, bookId: 801168, name: 'Course A' });
    assert.equal(course.id, 10001);
    assert.equal(course.bookId, 801168);
    assert.equal(course.name, 'Course A');
  });
});

describe('createLesson', () => {
  it('returns an object with default values', () => {
    const lesson = createLesson();
    assert.equal(lesson.id, 0);
    assert.equal(lesson.courseId, null);
    assert.equal(lesson.name, '');
    assert.equal(lesson.number, 1);
    assert.equal(lesson.text, '');
    assert.deepEqual(lesson.tags, {});
  });

  it('applies overrides', () => {
    const lesson = createLesson({ id: 500, courseId: 10001, name: 'Unit 1', number: 3, text: 'Intro' });
    assert.equal(lesson.id, 500);
    assert.equal(lesson.courseId, 10001);
    assert.equal(lesson.name, 'Unit 1');
    assert.equal(lesson.number, 3);
    assert.equal(lesson.text, 'Intro');
  });

  it('id defaults to 0 (create convention)', () => {
    assert.equal(createLesson().id, 0);
  });
});

describe('createLessonSection', () => {
  it('returns an object with default values', () => {
    const section = createLessonSection();
    assert.equal(section.id, null);
    assert.equal(section.lessonId, null);
  });

  it('applies overrides', () => {
    const section = createLessonSection({ id: 20001, lessonId: 500 });
    assert.equal(section.id, 20001);
    assert.equal(section.lessonId, 500);
  });
});

describe('createExercise', () => {
  it('returns an object with default values', () => {
    const exercise = createExercise();
    assert.equal(exercise.id, 0);
    assert.equal(exercise.lessonSectionId, null);
    assert.equal(exercise.type, null);
    assert.equal(exercise.name, '');
    assert.equal(exercise.autoCheck, true);
    assert.deepEqual(exercise.content, {});
  });

  it('applies overrides for word-fill type', () => {
    const exercise = createExercise({
      type: ExerciseType.WORD_FILL_DRAG,
      name: 'Complete the sentence',
      lessonSectionId: 20001,
      content: { text: 'hello [friend] (someone).' },
    });
    assert.equal(exercise.type, 18);
    assert.equal(exercise.name, 'Complete the sentence');
    assert.equal(exercise.content.text, 'hello [friend] (someone).');
  });

  it('applies overrides for test type', () => {
    const exercise = createExercise({
      type: ExerciseType.TEST,
      name: 'Take the test',
      lessonSectionId: 20001,
      content: { questions: [{ id: 1, question: '1+1?', answers: ['2'] }] },
    });
    assert.equal(exercise.type, 5);
    assert.equal(exercise.content.questions[0].question, '1+1?');
  });

  it('id defaults to 0 (create convention)', () => {
    assert.equal(createExercise().id, 0);
  });

  it('returns a new object each call (no shared content reference)', () => {
    const a = createExercise();
    const b = createExercise();
    assert.notEqual(a.content, b.content);
  });
});

describe('ExerciseType', () => {
  it('WORD_FILL_DRAG equals 18', () => assert.equal(ExerciseType.WORD_FILL_DRAG, 18));
  it('TEST equals 5', () => assert.equal(ExerciseType.TEST, 5));
  it('is frozen (immutable)', () => {
    assert.ok(Object.isFrozen(ExerciseType));
    assert.throws(() => { ExerciseType.WORD_FILL_DRAG = 999; }, TypeError);
  });
});

describe('Vendor isolation in domain model', () => {
  // Read the actual source file and check that ProgressMe protocol terms
  // only appear in comments, never in executable code.
  const source = readFileSync(join(process.cwd(), 'src/domain/index.js'), 'utf-8');
  // Strip JSDoc comment blocks (/* ... */ and lines starting with *)
  const codeOnly = source
    .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
    .replace(/\/\/.*$/gm, '');           // line comments

  it('no BookWsController in executable code', () =>
    assert.ok(!codeOnly.includes('BookWsController'), 'BookWsController found in domain code'));
  it('no LessonWsController in executable code', () =>
    assert.ok(!codeOnly.includes('LessonWsController'), 'LessonWsController found in domain code'));
  it('no ExerciseWsController in executable code', () =>
    assert.ok(!codeOnly.includes('ExerciseWsController'), 'ExerciseWsController found in domain code'));
  it('no PasteWordByDrag in executable code', () =>
    assert.ok(!codeOnly.includes('PasteWordByDrag'), 'PasteWordByDrag found in domain code'));
  it('no ProjectName in executable code', () =>
    assert.ok(!codeOnly.includes('ProjectName'), 'ProjectName found in domain code'));
});
