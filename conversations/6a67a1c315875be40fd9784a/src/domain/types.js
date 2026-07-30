/**
 * JSDoc type definitions for the neutral domain model.
 * Import with: @typedef {import('./types').Book} Book
 */

/**
 * @typedef {Object} Book
 * @property {number|string|null} id
 * @property {string} name
 * @property {string} [description]
 * @property {number} [languageId]
 * @property {boolean} [enableGroupingLessons]
 * @property {boolean} [enableAccessBook]
 * @property {BookTags} [tags]
 */

/**
 * @typedef {Object} BookTags
 * @property {Array} [ages]
 * @property {Array} [levels]
 * @property {Array} [types]
 */

/**
 * @typedef {Object} Course
 * @property {number|string|null} id
 * @property {number|string|null} bookId
 * @property {string} name
 */

/**
 * @typedef {Object} Lesson
 * @property {number|string} id
 * @property {number|string} courseId
 * @property {string} name
 * @property {number} [number]
 * @property {string} [text]
 * @property {LessonTags} [tags]
 */

/**
 * @typedef {Object} LessonTags
 * @property {Array} [ages]
 * @property {Array} [levels]
 * @property {Array} [types]
 * @property {Array} [skills]
 * @property {Array} [time]
 * @property {string} [vocabulary]
 * @property {string} [grammar]
 * @property {string} [functions]
 * @property {string} [other]
 */

/**
 * @typedef {Object} LessonSection
 * @property {number|string|null} id
 * @property {number|string} lessonId
 */

/**
 * @typedef {Object} Exercise
 * @property {number|string} id
 * @property {number|string} lessonSectionId
 * @property {ExerciseTypeValue} type
 * @property {string} name
 * @property {boolean} [autoCheck]
 * @property {Object} [content]
 */

/**
 * @typedef {Object} WordFillContent
 * @property {string} text - exercise text with [word] placeholders
 */

/**
 * @typedef {Object} TestQuestion
 * @property {number} id
 * @property {number} [points]
 * @property {string} question
 * @property {string[]} answers
 * @property {string[]} questionAnswers - "true"/"" flags matching answers
 */

/**
 * @typedef {Object} TestContent
 * @property {boolean} [isEnabledTimer]
 * @property {number} [timerDuration]
 * @property {boolean} [isEnabledPoints]
 * @property {TestQuestion[]} questions
 */

/**
 * @enum {number}
 */
export const ExerciseType = {
  /** Word-fill / drag exercise */
  WORD_FILL_DRAG: 18,
  /** Test exercise with questions */
  TEST: 5,
};

export default { ExerciseType };
