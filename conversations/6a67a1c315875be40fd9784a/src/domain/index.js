/**
 * Neutral domain model — the canonical entity types that adapters map to/from.
 *
 * These types are vendor-neutral. ProgressMe-specific terminology (BookWsController,
 * LessonSection, etc.) must never leak here. Adapters in src/adapters/ handle
 * the translation between vendor protocol shapes and these neutral types.
 */

/**
 * @typedef {Object} Book
 * @property {number|string|null} id   - null for new, existing ID for update
 * @property {string} name
 * @property {string} [description]
 * @property {number} [languageId]
 * @property {boolean} [enableGroupingLessons]
 * @property {boolean} [enableAccessBook]
 * @property {Object} [tags]           - neutral tag structure
 */

/**
 * @typedef {Object} Course
 * @property {number|string} id
 * @property {number|string} bookId
 * @property {string} name
 */

/**
 * @typedef {Object} Lesson
 * @property {number|string} id        - 0 for new, existing ID for update
 * @property {number|string} courseId
 * @property {string} name
 * @property {number} [number]
 * @property {string} [text]
 * @property {Object} [tags]
 */

/**
 * @typedef {Object} LessonSection
 * @property {number|string} id
 * @property {number|string} lessonId
 */

/**
 * @typedef {Object} Exercise
 * @property {number|string} id        - 0 for new
 * @property {number|string} lessonSectionId
 * @property {number} type             - e.g. 18=word-fill/drag, 5=test
 * @property {string} name
 * @property {boolean} [autoCheck]
 * @property {Object} [content]        - type-specific payload
 */

/** Neutral domain model classes — plain objects with field defaults. */

export function createBook(overrides = {}) {
  return {
    id: null,
    name: '',
    description: '',
    languageId: 1,
    enableGroupingLessons: false,
    enableAccessBook: false,
    tags: { ages: [], levels: [], types: [] },
    ...overrides,
  };
}

export function createCourse(overrides = {}) {
  return {
    id: null,
    bookId: null,
    name: '',
    ...overrides,
  };
}

export function createLesson(overrides = {}) {
  return {
    id: 0,
    courseId: null,
    name: '',
    number: 1,
    text: '',
    tags: {},
    ...overrides,
  };
}

export function createLessonSection(overrides = {}) {
  return {
    id: null,
    lessonId: null,
    ...overrides,
  };
}

export function createExercise(overrides = {}) {
  return {
    id: 0,
    lessonSectionId: null,
    type: null,
    name: '',
    autoCheck: true,
    content: {},
    ...overrides,
  };
}

export const ExerciseType = Object.freeze({
  WORD_FILL_DRAG: 18,
  TEST: 5,
});

export default {
  createBook,
  createCourse,
  createLesson,
  createLessonSection,
  createExercise,
  ExerciseType,
};
