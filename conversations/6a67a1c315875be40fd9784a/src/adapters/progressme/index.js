/**
 * ProgressMe adapter — maps between the neutral domain model and
 * the ProgressMe/Edvibe private WebSocket RPC protocol.
 *
 * This adapter is the ONLY place where ProgressMe-specific terminology
 * (BookWsController, PascalCase fields, etc.) appears in application code.
 * It translates neutral domain objects to ProgressMe WebSocket envelopes
 * and delegates transport to a WebSocketClient.
 *
 * Response bodies are not yet typed (inbound captures not available).
 * In dry-run mode, the client returns mock responses with generated IDs.
 * In real mode, the raw response is returned as-is (additionalProperties: true).
 */

import { createEnvelope } from './envelope.js';
import { ExerciseType } from '../../domain/index.js';
import { WebSocketClient } from '../../infrastructure/index.js';

// ─── Domain → ProgressMe payload mappers ─────────────────────────

/**
 * Map a neutral Book to a ProgressMe BookUpsert payload.
 * @param {import('../../domain/types').Book} book
 * @returns {Object} ProgressMe PascalCase payload
 */
function bookToUpsertPayload(book) {
  return {
    Id: book.id ?? null,
    Name: book.name,
    LanguageId: book.languageId ?? 1,
    Description: book.description ?? '',
    IsEnableGroupingLessons: book.enableGroupingLessons ?? false,
    IsEnableAccessBook: book.enableAccessBook ?? false,
    Number: -1,
    Tags: {
      BookId: book.id ?? 0,
      TagAge: book.tags?.ages ?? [],
      TagLevel: book.tags?.levels ?? [],
      TagType: book.tags?.types ?? [],
    },
    NoPhotoColor: 3,
    UserId: null,
    UserRole: null,
    SchoolId: null,
    FolderId: null,
  };
}

/**
 * Map a neutral Lesson to a ProgressMe LessonUpsert payload.
 * @param {import('../../domain/types').Lesson} lesson
 * @returns {Object} ProgressMe PascalCase payload
 */
function lessonToUpsertPayload(lesson) {
  return {
    Id: lesson.id ?? 0,
    Name: lesson.name,
    CourseId: lesson.courseId,
    Text: lesson.text ?? '',
    Number: lesson.number ?? 1,
    Tags: {
      LessonId: lesson.id ?? 0,
      TagAge: lesson.tags?.ages ?? [],
      TagLevel: lesson.tags?.levels ?? [],
      TagType: lesson.tags?.types ?? [],
      TagSkills: lesson.tags?.skills ?? [],
      TagTime: lesson.tags?.time ?? [],
      Vocabulary: lesson.tags?.vocabulary ?? '',
      Grammar: lesson.tags?.grammar ?? '',
      Functions: lesson.tags?.functions ?? '',
      Other: lesson.tags?.other ?? '',
    },
    Data: null,
    NoPhotoColor: 0,
  };
}

/**
 * Map a neutral Exercise to a ProgressMe SaveExercise payload.
 * Dispatches on exercise.type to produce the correct shape.
 * @param {import('../../domain/types').Exercise} exercise
 * @returns {Object} ProgressMe PascalCase payload
 * @throws {Error} if exercise.type is not a known ExerciseType
 */
function exerciseToSavePayload(exercise) {
  const common = {
    Id: exercise.id ?? 0,
    PersonalMaterialId: null,
    HomeworkLessonId: null,
    Number: 0,
    IsShowExerciseNumber: true,
    Name: exercise.name,
    IsAutoCheck: exercise.autoCheck ?? true,
    IsHidePupil: false,
    LessonSectionId: exercise.lessonSectionId,
  };

  if (exercise.type === ExerciseType.WORD_FILL_DRAG) {
    return {
      ...common,
      Type: 18,
      PasteWordByDrag: {
        Text: exercise.content?.text ?? '',
      },
    };
  }

  if (exercise.type === ExerciseType.TEST) {
    return {
      ...common,
      Type: 5,
      Test: {
        IsEnabledTimer: exercise.content?.isEnabledTimer ?? false,
        TimerDuration: exercise.content?.timerDuration ?? 0,
        IsEnabledPoints: exercise.content?.isEnabledPoints ?? false,
        Questions: (exercise.content?.questions ?? []).map(q => ({
          Id: q.id,
          Points: q.points ?? 1,
          Question: q.question,
          Answers: q.answers,
          QuestionAnswers: q.questionAnswers,
        })),
      },
    };
  }

  throw new Error(
    `exerciseToSavePayload: unknown exercise type ${exercise.type}. ` +
    `Known types: ${ExerciseType.WORD_FILL_DRAG} (WORD_FILL_DRAG), ${ExerciseType.TEST} (TEST).`
  );
}

// ─── Response mappers (minimal — response bodies not yet typed) ─

/**
 * Map a ProgressMe response body to a neutral Book.
 * Response bodies are not yet captured, so this is a best-effort mapper
 * that extracts known fields if present.
 * @param {Object} body - Untyped response body
 * @param {import('../../domain/types').Book} [original] - Original request book (for fallback)
 * @returns {import('../../domain/types').Book}
 */
function responseToBook(body, original) {
  return {
    id: body?.Id ?? body?.id ?? original?.id ?? null,
    name: body?.Name ?? body?.name ?? original?.name ?? '',
    description: body?.Description ?? original?.description ?? '',
    languageId: body?.LanguageId ?? original?.languageId ?? 1,
    enableGroupingLessons: body?.IsEnableGroupingLessons ?? original?.enableGroupingLessons ?? false,
    enableAccessBook: body?.IsEnableAccessBook ?? original?.enableAccessBook ?? false,
    tags: original?.tags ?? { ages: [], levels: [], types: [] },
  };
}

/**
 * Map a ProgressMe response body to a neutral Lesson.
 * @param {Object} body
 * @param {import('../../domain/types').Lesson} [original]
 * @returns {import('../../domain/types').Lesson}
 */
function responseToLesson(body, original) {
  return {
    id: body?.Id ?? body?.id ?? original?.id ?? 0,
    courseId: body?.CourseId ?? body?.courseId ?? original?.courseId ?? null,
    name: body?.Name ?? body?.name ?? original?.name ?? '',
    number: body?.Number ?? original?.number ?? 1,
    text: body?.Text ?? original?.text ?? '',
    tags: original?.tags ?? {},
  };
}

/**
 * Map a ProgressMe response body to a neutral Exercise.
 * @param {Object} body
 * @param {import('../../domain/types').Exercise} [original]
 * @returns {import('../../domain/types').Exercise}
 */
function responseToExercise(body, original) {
  return {
    id: body?.Id ?? body?.id ?? original?.id ?? 0,
    lessonSectionId: body?.LessonSectionId ?? original?.lessonSectionId ?? null,
    type: body?.Type ?? original?.type ?? null,
    name: body?.Name ?? body?.name ?? original?.name ?? '',
    autoCheck: body?.IsAutoCheck ?? original?.autoCheck ?? true,
    content: original?.content ?? {},
  };
}

// ─── Adapter class ──────────────────────────────────────────────

export class ProgressMeAdapter {
  /**
   * @param {Object} options
   * @param {string} options.wsUrl - WebSocket URL from PROGRESSME_WS_URL
   * @param {string} [options.token] - Session token from PROGRESSME_TOKEN
   * @param {boolean} [options.dryRun] - If true, log but don't send (default: true)
   * @param {Object} [options.client] - Inject a WebSocketClient (for testing)
   * @param {Object} [options.logger] - Console-like logger
   */
  constructor({ wsUrl, token, dryRun = true, client, logger } = {}) {
    this.dryRun = dryRun;
    this.logger = logger || console;

    // Use injected client or create one
    if (client) {
      this.client = client;
    } else {
      this.client = new WebSocketClient({ url: wsUrl, token, dryRun, logger: this.logger });
    }
  }

  // --- Connection ---

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.disconnect();
  }

  // --- Book operations ---

  async getBook(bookId) {
    const envelope = createEnvelope('BookWsController', 'GetBook', 'Books', { BookId: bookId });
    const response = await this.client.send(envelope);
    return response;
  }

  async getPersonalBooks() {
    const envelope = createEnvelope('BookWsController', 'GetPersonalBooks', 'Books');
    const response = await this.client.send(envelope);
    return response;
  }

  /**
   * Create or update a book.
   * @param {import('../../domain/types').Book} book - Neutral domain book
   * @returns {Promise<import('../../domain/types').Book>} Book with assigned ID
   */
  async bookUpsert(book) {
    const payload = bookToUpsertPayload(book);
    const envelope = createEnvelope('BookWsController', 'BookUpsert', 'Books', payload);
    const response = await this.client.send(envelope);
    return responseToBook(response.Body || response, book);
  }

  /**
   * Copy a book.
   * @param {number} bookId - Source book ID
   * @param {Object} [options]
   * @param {boolean} [options.isVisible=true]
   * @param {boolean} [options.isProtectedCopyright=true]
   * @returns {Promise<Object>} Response (untyped)
   */
  async copyBook(bookId, { isVisible = true, isProtectedCopyright = true } = {}) {
    const payload = { BookId: bookId, IsVisible: isVisible, IsProtectedCopyright: isProtectedCopyright };
    const envelope = createEnvelope('BookWsController', 'CopyBook', 'Books', payload);
    const response = await this.client.send(envelope);
    return response;
  }

  // --- Course operations ---

  async getBookCourses(bookId) {
    const envelope = createEnvelope('CourseWsController', 'GetBookCourses', 'Books', { BookId: bookId });
    const response = await this.client.send(envelope);
    return response;
  }

  // --- Lesson operations ---

  async getCourseLessons(courseId) {
    const envelope = createEnvelope('LessonWsController', 'GetCourseLessons', 'Books', { CourseId: courseId });
    const response = await this.client.send(envelope);
    return response;
  }

  /**
   * Create or update a lesson.
   * @param {import('../../domain/types').Lesson} lesson - Neutral domain lesson
   * @returns {Promise<import('../../domain/types').Lesson>} Lesson with assigned ID
   */
  async lessonUpsert(lesson) {
    const payload = lessonToUpsertPayload(lesson);
    const envelope = createEnvelope('LessonWsController', 'LessonUpsert', 'Books', payload);
    const response = await this.client.send(envelope);
    return responseToLesson(response.Body || response, lesson);
  }

  async getLessonWithId(lessonId) {
    const envelope = createEnvelope('LessonWsController', 'GetLessonWithId', 'Books', { LessonId: lessonId });
    const response = await this.client.send(envelope);
    return response;
  }

  // --- Exercise operations ---

  async loadExercisesInMaterial(materialId) {
    const envelope = createEnvelope('ExerciseWsController', 'LoadExercisesInMaterial', 'Books', { MaterialId: materialId });
    const response = await this.client.send(envelope);
    return response;
  }

  /**
   * Save (create or update) an exercise.
   * @param {import('../../domain/types').Exercise} exercise - Neutral domain exercise
   * @returns {Promise<import('../../domain/types').Exercise>} Exercise with assigned ID
   */
  async saveExercise(exercise) {
    const payload = exerciseToSavePayload(exercise);
    const envelope = createEnvelope('ExerciseWsController', 'SaveExercise', 'Books', payload);
    const response = await this.client.send(envelope);
    return responseToExercise(response.Body || response, exercise);
  }

  // --- Tags operations ---

  async getBookTags(bookId) {
    const envelope = createEnvelope('MaterialTagsWsController', 'GetBookTags', 'Books', { BookId: bookId });
    const response = await this.client.send(envelope);
    return response;
  }

  async getBookLessonTags(bookId) {
    const envelope = createEnvelope('MaterialTagsWsController', 'GetBookLessonTags', 'Books', { BookId: bookId });
    const response = await this.client.send(envelope);
    return response;
  }

  // --- Auth operations ---

  /**
   * Login with credentials. Uses environment variables for secrets.
   * @param {Object} [options]
   * @param {string} [options.email] - Overrides PROGRESSME_EMAIL
   * @param {string} [options.password] - Overrides PROGRESSME_PASSWORD
   * @param {boolean} [options.rememberMe=true]
   * @param {string} [options.authToken] - Overrides PROGRESSME_AUTH_TOKEN
   * @returns {Promise<Object>} Response (untyped)
   */
  async login({ email, password, rememberMe = true, authToken } = {}) {
    const payload = {
      Email: email || process.env.PROGRESSME_EMAIL || '${PROGRESSME_EMAIL}',
      Password: password || process.env.PROGRESSME_PASSWORD || '${PROGRESSME_PASSWORD}',
      RememberMe: rememberMe,
      UserRole: 4,
      AuthToken: authToken || process.env.PROGRESSME_AUTH_TOKEN || '${PROGRESSME_AUTH_TOKEN}',
      CurrentDomain: process.env.PROGRESSME_DOMAIN || 'progressme.ru',
      AccountRole: 1,
    };
    const envelope = createEnvelope('AccountWsController', 'Login', 'Users', payload);
    const response = await this.client.send(envelope);
    return response;
  }

  async getCurrentUser() {
    const envelope = createEnvelope('AccountWsController', 'GetCurrentUser', 'Users');
    const response = await this.client.send(envelope);
    return response;
  }
}

export default { ProgressMeAdapter };
