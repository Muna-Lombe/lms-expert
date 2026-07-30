/**
 * Application layer — use case orchestration.
 *
 * Use cases coordinate the neutral domain model with adapter calls.
 * They contain the business logic for importing, exporting, and
 * synchronizing LMS content. Each use case receives an adapter
 * (port) and returns neutral domain objects.
 *
 * Not yet implemented — will be built per feature as gates pass.
 */

/**
 * Import a book from an LMS platform into the neutral domain model.
 * @param {Object} adapter - LMS adapter implementing the book operations port.
 * @param {Object} params - Import parameters (bookId, etc.)
 * @returns {Promise<import('../domain/types').Book>} Neutral book object.
 */
export async function importBook(adapter, params) {
  throw new Error('Not implemented: importBook');
}

/**
 * Export a neutral book to an LMS platform.
 * @param {Object} adapter - LMS adapter implementing the book operations port.
 * @param {import('../domain/types').Book} book - Neutral book to export.
 * @returns {Promise<import('../domain/types').Book>} Book with assigned IDs.
 */
export async function exportBook(adapter, book) {
  throw new Error('Not implemented: exportBook');
}

/**
 * Create a lesson in an LMS platform from the neutral domain model.
 * @param {Object} adapter
 * @param {import('../domain/types').Lesson} lesson
 * @returns {Promise<import('../domain/types').Lesson>}
 */
export async function createLesson(adapter, lesson) {
  throw new Error('Not implemented: createLesson');
}

/**
 * Create an exercise in an LMS platform from the neutral domain model.
 * @param {Object} adapter
 * @param {import('../domain/types').Exercise} exercise
 * @returns {Promise<import('../domain/types').Exercise>}
 */
export async function createExercise(adapter, exercise) {
  throw new Error('Not implemented: createExercise');
}

export default {
  importBook,
  exportBook,
  createLesson,
  createExercise,
};
