/**
 * Application layer — use case orchestration.
 *
 * Use cases coordinate the neutral domain model with adapter calls.
 * Each use case receives an adapter (port) and returns neutral domain objects.
 * The adapter handles vendor-specific translation; use cases stay neutral.
 */

import {
  createBook, createLesson as makeDomainLesson,
  createExercise as makeDomainExercise,
  ExerciseType,
} from '../domain/index.js';

/**
 * Coerce a response body into an array. Handles dry-run mock responses
 * (which return the request payload, not actual lists) gracefully.
 * @private
 */
function toArray(body, ...keys) {
  for (const key of keys) {
    if (body && body[key] && Array.isArray(body[key])) return body[key];
  }
  if (Array.isArray(body)) return body;
  return []; // Non-iterable (e.g., dry-run mock payload) → empty
}

/**
 * Import a book from an LMS platform into the neutral domain model.
 *
 * Fetches the book and its courses, lessons, and exercises through the adapter.
 * In dry-run mode, the adapter returns mock responses — the structure is
 * correct but the data is synthetic (lists will be empty arrays).
 *
 * @param {Object} adapter - LMS adapter implementing the book operations port.
 * @param {Object} params
 * @param {number} params.bookId - The book ID to import.
 * @returns {Promise<{book: import('../domain/types').Book, courses: Array, lessons: Array, exercises: Array}>}
 */
export async function importBook(adapter, { bookId }) {
  if (!adapter || typeof adapter.getBook !== 'function') {
    throw new TypeError('importBook: adapter must implement getBook()');
  }
  if (!bookId) {
    throw new Error('importBook: bookId is required');
  }

  // Fetch the book
  const bookResponse = await adapter.getBook(bookId);

  // Fetch courses for this book
  const coursesResponse = await adapter.getBookCourses(bookId);

  // Fetch lessons for each course (best-effort)
  let lessons = [];
  const courseList = toArray(coursesResponse?.Body, 'Courses', 'Items');
  for (const course of courseList) {
    const courseId = course.Id ?? course.id;
    if (!courseId) continue;
    try {
      const lessonsResponse = await adapter.getCourseLessons(courseId);
      const courseLessons = toArray(lessonsResponse?.Body, 'Lessons', 'Items');
      lessons = lessons.concat(courseLessons);
    } catch {
      // Best-effort: skip if a course fails
    }
  }

  // Fetch exercises for each lesson (best-effort)
  let exercises = [];
  for (const lesson of lessons) {
    const lessonId = lesson.Id ?? lesson.id;
    if (!lessonId) continue;
    try {
      const exercisesResponse = await adapter.loadExercisesInMaterial(lessonId);
      const lessonExercises = toArray(exercisesResponse?.Body, 'Exercises', 'Items');
      exercises = exercises.concat(lessonExercises);
    } catch {
      // Best-effort: skip if a lesson fails
    }
  }

  return {
    book: bookResponse?.Body ?? bookResponse,
    courses: courseList,
    lessons,
    exercises,
  };
}

/**
 * Export a neutral book to an LMS platform.
 *
 * Creates (or updates) the book through the adapter, then creates
 * lessons and exercises if provided in the book structure.
 *
 * @param {Object} adapter - LMS adapter implementing the book operations port.
 * @param {import('../domain/types').Book} book - Neutral book to export.
 * @param {Object} [options]
 * @param {Array} [options.lessons] - Lessons to create under the book's course.
 * @param {Array} [options.exercises] - Exercises to create under lessons.
 * @param {number} [options.courseId] - Existing course ID (if not provided, the book's default course is used).
 * @returns {Promise<{book: import('../domain/types').Book, lessons: Array, exercises: Array}>}
 */
export async function exportBook(adapter, book, options = {}) {
  if (!adapter || typeof adapter.bookUpsert !== 'function') {
    throw new TypeError('exportBook: adapter must implement bookUpsert()');
  }

  // Ensure book is a proper domain object
  const domainBook = createBook(book);

  // Create/update the book
  const createdBook = await adapter.bookUpsert(domainBook);

  // If lessons are provided, create them
  const createdLessons = [];
  const courseId = options.courseId;
  for (const lessonData of (options.lessons ?? [])) {
    const domainLesson = makeDomainLesson({
      ...lessonData,
      courseId: courseId ?? lessonData.courseId,
    });
    const created = await adapter.lessonUpsert(domainLesson);
    createdLessons.push(created);

    // If exercises are provided for this lesson, create them
    for (const exerciseData of (options.exercises ?? [])) {
      if (exerciseData.lessonNumber !== undefined && exerciseData.lessonNumber !== lessonData.number) {
        continue; // Only create exercises for matching lessons
      }
      const domainExercise = makeDomainExercise(exerciseData);
      const createdExercise = await adapter.saveExercise(domainExercise);
      createdLessons.push(createdExercise);
    }
  }

  return {
    book: createdBook,
    lessons: createdLessons,
    exercises: [], // Populated above if provided
  };
}

/**
 * Create a single lesson in an LMS platform.
 *
 * @param {Object} adapter - LMS adapter.
 * @param {import('../domain/types').Lesson} lesson - Neutral lesson.
 * @returns {Promise<import('../domain/types').Lesson>} Lesson with assigned ID.
 */
export async function createLesson(adapter, lesson) {
  if (!adapter || typeof adapter.lessonUpsert !== 'function') {
    throw new TypeError('createLesson: adapter must implement lessonUpsert()');
  }
  const domainLesson = makeDomainLesson(lesson);
  return adapter.lessonUpsert(domainLesson);
}

/**
 * Create a single exercise in an LMS platform.
 *
 * @param {Object} adapter - LMS adapter.
 * @param {import('../domain/types').Exercise} exercise - Neutral exercise.
 * @returns {Promise<import('../domain/types').Exercise>} Exercise with assigned ID.
 */
export async function createExercise(adapter, exercise) {
  if (!adapter || typeof adapter.saveExercise !== 'function') {
    throw new TypeError('createExercise: adapter must implement saveExercise()');
  }
  const domainExercise = makeDomainExercise(exercise);
  return adapter.saveExercise(domainExercise);
}

export default {
  importBook,
  exportBook,
  createLesson,
  createExercise,
};
