/**
 * ProgressMe adapter — maps between the neutral domain model and
 * the ProgressMe/Edvibe private WebSocket RPC protocol.
 *
 * This adapter is the ONLY place where ProgressMe-specific terminology
 * (BookWsController, LessonSection, PascalCase fields, etc.) appears
 * in application code. It translates neutral domain objects to/from
 * ProgressMe WebSocket envelopes.
 *
 * All methods throw until the corresponding feature gate passes.
 */

import { createEnvelope } from './envelope.js';
import { ExerciseType } from '../../domain/index.js';

export class ProgressMeAdapter {
  /**
   * @param {Object} options
   * @param {string} options.wsUrl - WebSocket URL from PROGRESSME_WS_URL
   * @param {string} [options.token] - Session token from PROGRESSME_TOKEN
   * @param {boolean} [options.dryRun] - If true, log but don't send (default: true)
   */
  constructor({ wsUrl, token, dryRun = true } = {}) {
    this.wsUrl = wsUrl;
    this.token = token;
    this.dryRun = dryRun;
    this.wsClient = null;
  }

  // --- Connection ---

  async connect() {
    throw new Error('Not implemented: connect');
  }

  async disconnect() {
    throw new Error('Not implemented: disconnect');
  }

  // --- Book operations ---

  async getBook(bookId) {
    throw new Error('Not implemented: getBook');
  }

  async getPersonalBooks() {
    throw new Error('Not implemented: getPersonalBooks');
  }

  async bookUpsert(book) {
    throw new Error('Not implemented: bookUpsert');
  }

  async copyBook(bookId, { isVisible = true, isProtectedCopyright = true } = {}) {
    throw new Error('Not implemented: copyBook');
  }

  // --- Course operations ---

  async getBookCourses(bookId) {
    throw new Error('Not implemented: getBookCourses');
  }

  // --- Lesson operations ---

  async getCourseLessons(courseId) {
    throw new Error('Not implemented: getCourseLessons');
  }

  async lessonUpsert(lesson) {
    throw new Error('Not implemented: lessonUpsert');
  }

  async getLessonWithId(lessonId) {
    throw new Error('Not implemented: getLessonWithId');
  }

  // --- Exercise operations ---

  async loadExercisesInMaterial(materialId) {
    throw new Error('Not implemented: loadExercisesInMaterial');
  }

  async saveExercise(exercise) {
    throw new Error('Not implemented: saveExercise');
  }

  // --- Tags operations ---

  async getBookTags(bookId) {
    throw new Error('Not implemented: getBookTags');
  }

  async getBookLessonTags(bookId) {
    throw new Error('Not implemented: getBookLessonTags');
  }

  // --- Auth operations ---

  async login({ email, password, rememberMe = true } = {}) {
    throw new Error('Not implemented: login');
  }

  async getCurrentUser() {
    throw new Error('Not implemented: getCurrentUser');
  }
}

export default { ProgressMeAdapter };
