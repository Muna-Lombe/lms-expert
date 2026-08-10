import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressMeAdapter } from '../../src/adapters/progressme/index.js';
import { createBook, createLesson, createExercise, ExerciseType } from '../../src/domain/index.js';

/**
 * Mock WebSocketClient that records envelopes and returns canned responses.
 * The mock Id is spread FIRST so it takes precedence over the payload's Id.
 */
function createMockClient() {
  const sent = [];
  const client = {
    connected: false,
    async connect() { this.connected = true; },
    async disconnect() { this.connected = false; },
    async send(envelope) {
      sent.push(envelope);
      const payload = envelope.Value === '""' ? {} : JSON.parse(envelope.Value);
      return {
        RequestId: envelope.RequestId,
        Controller: envelope.Controller,
        Method: envelope.Method,
        Body: { ...payload, Id: 999, dryRun: true },
      };
    },
  };
  return { client, sent };
}

describe('ProgressMeAdapter', () => {
  describe('constructor', () => {
    it('accepts injected client', () => {
      const { client } = createMockClient();
      const adapter = new ProgressMeAdapter({ client, dryRun: false });
      assert.equal(adapter.client, client);
      assert.equal(adapter.dryRun, false);
    });

    it('creates WebSocketClient if none injected', () => {
      const adapter = new ProgressMeAdapter({ wsUrl: 'wss://test', dryRun: true });
      assert.ok(adapter.client, 'Should create a client');
      assert.equal(adapter.dryRun, true);
    });

    it('defaults to dryRun: true', () => {
      const adapter = new ProgressMeAdapter({ wsUrl: 'wss://test' });
      assert.equal(adapter.dryRun, true);
    });
  });

  describe('connect / disconnect', () => {
    it('delegates to client', async () => {
      const { client } = createMockClient();
      const adapter = new ProgressMeAdapter({ client, dryRun: false });
      await adapter.connect();
      assert.equal(client.connected, true);
      await adapter.disconnect();
      assert.equal(client.connected, false);
    });
  });
});

// ─── Domain → ProgressMe payload mapping ───────────────────────────

describe('bookUpsert — domain to payload mapping', () => {
  const { client, sent } = createMockClient();
  const adapter = new ProgressMeAdapter({ client, dryRun: false });

  it('maps neutral book to ProgressMe PascalCase payload', async () => {
    const book = createBook({ name: 'B1 Programme', languageId: 2, enableGroupingLessons: true });
    await adapter.bookUpsert(book);

    const envelope = sent[sent.length - 1];
    assert.equal(envelope.Controller, 'BookWsController');
    assert.equal(envelope.Method, 'BookUpsert');
    assert.equal(envelope.ProjectName, 'Books');

    const payload = JSON.parse(envelope.Value);
    assert.equal(payload.Id, null);
    assert.equal(payload.Name, 'B1 Programme');
    assert.equal(payload.LanguageId, 2);
    assert.equal(payload.IsEnableGroupingLessons, true);
    assert.equal(payload.IsEnableAccessBook, false);
    assert.equal(payload.Number, -1);
    assert.ok(payload.Tags);
    assert.deepEqual(payload.Tags.TagAge, []);
    assert.deepEqual(payload.Tags.TagLevel, []);
    assert.deepEqual(payload.Tags.TagType, []);
  });

  it('returns a neutral Book from the response', async () => {
    const book = createBook({ name: 'Test Book' });
    const result = await adapter.bookUpsert(book);
    assert.ok(result.id, 'Should have an assigned ID');
    assert.equal(result.id, 999);
    assert.equal(result.name, 'Test Book');
  });

  it('maps tag overrides to PascalCase tag arrays', async () => {
    const book = createBook({
      name: 'Tagged Book',
      tags: { ages: ['adult', 'teen'], levels: ['B1'], types: ['grammar'] },
    });
    await adapter.bookUpsert(book);
    const payload = JSON.parse(sent[sent.length - 1].Value);
    assert.deepEqual(payload.Tags.TagAge, ['adult', 'teen']);
    assert.deepEqual(payload.Tags.TagLevel, ['B1']);
    assert.deepEqual(payload.Tags.TagType, ['grammar']);
  });
});

describe('lessonUpsert — domain to payload mapping', () => {
  const { client, sent } = createMockClient();
  const adapter = new ProgressMeAdapter({ client, dryRun: false });

  it('maps neutral lesson to ProgressMe PascalCase payload', async () => {
    const lesson = createLesson({ name: 'Unit 1', courseId: 10001, number: 3, text: 'Intro' });
    await adapter.lessonUpsert(lesson);

    const envelope = sent[sent.length - 1];
    assert.equal(envelope.Controller, 'LessonWsController');
    assert.equal(envelope.Method, 'LessonUpsert');

    const payload = JSON.parse(envelope.Value);
    assert.equal(payload.Id, 0);
    assert.equal(payload.Name, 'Unit 1');
    assert.equal(payload.CourseId, 10001);
    assert.equal(payload.Number, 3);
    assert.equal(payload.Text, 'Intro');
    assert.ok(payload.Tags);
    assert.equal(payload.Tags.Vocabulary, '');
    assert.equal(payload.Tags.Grammar, '');
    assert.equal(payload.Data, null);
  });

  it('maps lesson tag overrides', async () => {
    const lesson = createLesson({
      name: 'Lesson with tags',
      courseId: 1,
      tags: { vocabulary: 'food', grammar: 'present simple', skills: ['speaking'] },
    });
    await adapter.lessonUpsert(lesson);
    const payload = JSON.parse(sent[sent.length - 1].Value);
    assert.equal(payload.Tags.Vocabulary, 'food');
    assert.equal(payload.Tags.Grammar, 'present simple');
    assert.deepEqual(payload.Tags.TagSkills, ['speaking']);
  });

  it('returns a neutral Lesson from the response', async () => {
    const lesson = createLesson({ name: 'Result Lesson', courseId: 1 });
    const result = await adapter.lessonUpsert(lesson);
    assert.ok(result.id !== undefined);
    assert.equal(result.id, 999);
    assert.equal(result.name, 'Result Lesson');
  });
});

describe('saveExercise — domain to payload mapping', () => {
  const { client, sent } = createMockClient();
  const adapter = new ProgressMeAdapter({ client, dryRun: false });

  it('maps word-fill exercise (type 18) with PasteWordByDrag', async () => {
    const exercise = createExercise({
      type: ExerciseType.WORD_FILL_DRAG,
      name: 'Fill the blank',
      lessonSectionId: 20001,
      content: { text: 'hello [friend] (someone).' },
    });
    await adapter.saveExercise(exercise);

    const envelope = sent[sent.length - 1];
    assert.equal(envelope.Controller, 'ExerciseWsController');
    assert.equal(envelope.Method, 'SaveExercise');

    const payload = JSON.parse(envelope.Value);
    assert.equal(payload.Type, 18);
    assert.ok(payload.PasteWordByDrag);
    assert.equal(payload.PasteWordByDrag.Text, 'hello [friend] (someone).');
    assert.equal(payload.LessonSectionId, 20001);
    assert.equal(payload.IsAutoCheck, true);
    assert.equal(payload.IsHidePupil, false);
  });

  it('maps test exercise (type 5) with Test.Questions', async () => {
    const exercise = createExercise({
      type: ExerciseType.TEST,
      name: 'Quick test',
      lessonSectionId: 20001,
      content: {
        isEnabledTimer: true,
        timerDuration: 3,
        isEnabledPoints: false,
        questions: [{
          id: 12345,
          points: 2,
          question: 'What is 2+2?',
          answers: ['4', '3', '5'],
          questionAnswers: ['true', '', ''],
        }],
      },
    });
    await adapter.saveExercise(exercise);

    const payload = JSON.parse(sent[sent.length - 1].Value);
    assert.equal(payload.Type, 5);
    assert.ok(payload.Test);
    assert.equal(payload.Test.IsEnabledTimer, true);
    assert.equal(payload.Test.TimerDuration, 3);
    assert.equal(payload.Test.Questions.length, 1);
    assert.equal(payload.Test.Questions[0].Question, 'What is 2+2?');
    assert.deepEqual(payload.Test.Questions[0].Answers, ['4', '3', '5']);
    assert.deepEqual(payload.Test.Questions[0].QuestionAnswers, ['true', '', '']);
  });

  it('throws on unknown exercise type', async () => {
    const exercise = createExercise({ type: 99, name: 'Bad', lessonSectionId: 1 });
    await assert.rejects(
      () => adapter.saveExercise(exercise),
      /unknown exercise type 99/
    );
  });

  it('returns a neutral Exercise from the response', async () => {
    const exercise = createExercise({
      type: ExerciseType.TEST,
      name: 'Result Test',
      lessonSectionId: 1,
      content: { questions: [] },
    });
    const result = await adapter.saveExercise(exercise);
    assert.ok(result.id !== undefined);
    assert.equal(result.id, 999);
    assert.equal(result.name, 'Result Test');
  });
});

// ─── Read operations ───────────────────────────────────────────────

describe('read operations — envelope construction', () => {
  const { client, sent } = createMockClient();
  const adapter = new ProgressMeAdapter({ client, dryRun: false });

  it('getBook sends correct envelope', async () => {
    await adapter.getBook(801168);
    const env = sent[sent.length - 1];
    assert.equal(env.Controller, 'BookWsController');
    assert.equal(env.Method, 'GetBook');
    assert.equal(JSON.parse(env.Value).BookId, 801168);
  });

  it('getPersonalBooks sends with empty Value', async () => {
    await adapter.getPersonalBooks();
    const env = sent[sent.length - 1];
    assert.equal(env.Controller, 'BookWsController');
    assert.equal(env.Method, 'GetPersonalBooks');
    assert.equal(env.Value, '""');
  });

  it('getBookCourses sends correct envelope', async () => {
    await adapter.getBookCourses(801168);
    const env = sent[sent.length - 1];
    assert.equal(env.Controller, 'CourseWsController');
    assert.equal(env.Method, 'GetBookCourses');
    assert.equal(JSON.parse(env.Value).BookId, 801168);
  });

  it('getCourseLessons sends correct envelope', async () => {
    await adapter.getCourseLessons(10001);
    const env = sent[sent.length - 1];
    assert.equal(env.Controller, 'LessonWsController');
    assert.equal(env.Method, 'GetCourseLessons');
    assert.equal(JSON.parse(env.Value).CourseId, 10001);
  });

  it('copyBook sends with IsVisible and IsProtectedCopyright', async () => {
    await adapter.copyBook(801168, { isVisible: false, isProtectedCopyright: false });
    const env = sent[sent.length - 1];
    const payload = JSON.parse(env.Value);
    assert.equal(payload.BookId, 801168);
    assert.equal(payload.IsVisible, false);
    assert.equal(payload.IsProtectedCopyright, false);
  });

  it('getCurrentUser sends empty envelope to Users project', async () => {
    await adapter.getCurrentUser();
    const env = sent[sent.length - 1];
    assert.equal(env.Controller, 'AccountWsController');
    assert.equal(env.Method, 'GetCurrentUser');
    assert.equal(env.ProjectName, 'Users');
    assert.equal(env.Value, '""');
  });
});

// ─── Login ──────────────────────────────────────────────────────────

describe('login — credential handling', () => {
  const { client, sent } = createMockClient();
  const adapter = new ProgressMeAdapter({ client, dryRun: false });

  it('uses env vars for credentials when not provided', async () => {
    process.env.PROGRESSME_EMAIL = 'test@example.com';
    process.env.PROGRESSME_PASSWORD = 'secret';
    process.env.PROGRESSME_AUTH_TOKEN = 'tok123';

    await adapter.login();
    const payload = JSON.parse(sent[sent.length - 1].Value);
    assert.equal(payload.Email, 'test@example.com');
    assert.equal(payload.Password, 'secret');
    assert.equal(payload.AuthToken, 'tok123');
    assert.equal(payload.RememberMe, true);
    assert.equal(payload.UserRole, 4);
    assert.equal(payload.AccountRole, 1);

    delete process.env.PROGRESSME_EMAIL;
    delete process.env.PROGRESSME_PASSWORD;
    delete process.env.PROGRESSME_AUTH_TOKEN;
  });

  it('uses explicit credentials when provided', async () => {
    await adapter.login({ email: 'direct@test.com', password: 'direct', rememberMe: false });
    const payload = JSON.parse(sent[sent.length - 1].Value);
    assert.equal(payload.Email, 'direct@test.com');
    assert.equal(payload.Password, 'direct');
    assert.equal(payload.RememberMe, false);
  });
});
