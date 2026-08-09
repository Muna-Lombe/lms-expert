import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEnvelope } from '../../src/adapters/progressme/envelope.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('createEnvelope', () => {

  describe('with an object payload', () => {
    const result = createEnvelope('BookWsController', 'BookUpsert', 'Books', { Id: null, Name: 'Test Book' });

    it('sets Controller', () => assert.equal(result.Controller, 'BookWsController'));
    it('sets Method', () => assert.equal(result.Method, 'BookUpsert'));
    it('sets ProjectName', () => assert.equal(result.ProjectName, 'Books'));
    it('generates a valid UUID for RequestId', () => assert.match(result.RequestId, UUID_RE));
    it('stringifies the payload into Value', () => {
      assert.equal(typeof result.Value, 'string');
      const parsed = JSON.parse(result.Value);
      assert.equal(parsed.Name, 'Test Book');
      assert.equal(parsed.Id, null);
    });
  });

  describe('with an empty payload (undefined)', () => {
    const result = createEnvelope('BookWsController', 'GetPersonalBooks', 'Books');

    it('produces Value as encoded empty string', () => assert.equal(result.Value, '""'));
  });

  describe('with an empty string payload', () => {
    const result = createEnvelope('BookWsController', 'GetPersonalBooks', 'Books', '');

    it('produces Value as encoded empty string', () => assert.equal(result.Value, '""'));
  });

  describe('with a null payload', () => {
    const result = createEnvelope('BookWsController', 'GetPersonalBooks', 'Books', null);

    it('produces Value as encoded empty string', () => assert.equal(result.Value, '""'));
  });

  describe('with a pre-stringified payload', () => {
    const payload = '{"BookId":801168}';
    const result = createEnvelope('BookWsController', 'GetBook', 'Books', payload);

    it('passes the string through as-is', () => assert.equal(result.Value, payload));
  });

  describe('RequestId uniqueness', () => {
    const a = createEnvelope('A', 'B', 'C');
    const b = createEnvelope('A', 'B', 'C');

    it('generates different UUIDs per call', () => assert.notEqual(a.RequestId, b.RequestId));
  });

  describe('envelope shape', () => {
    const result = createEnvelope('BookWsController', 'BookUpsert', 'Books', { Id: 1 });

    it('has exactly 5 properties', () => assert.equal(Object.keys(result).length, 5));
    it('has the correct property names', () => {
      assert.deepEqual(
        Object.keys(result).sort(),
        ['Controller', 'Method', 'ProjectName', 'RequestId', 'Value']
      );
    });
  });

  describe('BookUpsert create payload (from capture)', () => {
    const payload = {
      Id: null,
      Name: 'B1 English Progress Programme',
      LanguageId: 1,
      Description: 'Structured B1 programme',
      IsEnableGroupingLessons: true,
      IsEnableAccessBook: false,
      Number: -1,
      Tags: { BookId: 0, TagAge: [], TagLevel: [], TagType: [] },
      NoPhotoColor: 3,
      UserId: null,
      UserRole: null,
      SchoolId: null,
      FolderId: null,
    };
    const result = createEnvelope('BookWsController', 'BookUpsert', 'Books', payload);

    it('preserves all PascalCase keys in stringified Value', () => {
      const parsed = JSON.parse(result.Value);
      assert.deepEqual(Object.keys(parsed).sort(), Object.keys(payload).sort());
    });
    it('preserves nested Tags structure', () => {
      const parsed = JSON.parse(result.Value);
      assert.deepEqual(parsed.Tags, payload.Tags);
    });
  });

  describe('LessonUpsert payload (from capture)', () => {
    const payload = {
      Id: 0,
      Name: 'Unit 1',
      CourseId: 10001,
      Text: 'Introductions and goals',
      Number: 1,
      Tags: {
        LessonId: 0, TagAge: [], TagLevel: [], TagType: [],
        TagSkills: [], TagTime: [], Vocabulary: '', Grammar: '',
        Functions: '', Other: '',
      },
      Data: null,
      NoPhotoColor: 0,
    };
    const result = createEnvelope('LessonWsController', 'LessonUpsert', 'Books', payload);

    it('sets Controller to LessonWsController', () => assert.equal(result.Controller, 'LessonWsController'));
    it('preserves all fields in Value', () => {
      const parsed = JSON.parse(result.Value);
      assert.equal(parsed.Name, 'Unit 1');
      assert.equal(parsed.CourseId, 10001);
      assert.equal(parsed.Tags.Vocabulary, '');
    });
  });

  describe('SaveExercise type 18 payload (from capture)', () => {
    const payload = {
      Id: 0, Type: 18, PersonalMaterialId: null, HomeworkLessonId: null,
      Number: 0, IsShowExerciseNumber: true,
      PasteWordByDrag: { Text: 'hello [friend] (someone).' },
      Name: 'Complete the sentence', IsAutoCheck: true, IsHidePupil: false,
      LessonSectionId: 20001,
    };
    const result = createEnvelope('ExerciseWsController', 'SaveExercise', 'Books', payload);

    it('sets Controller to ExerciseWsController', () => assert.equal(result.Controller, 'ExerciseWsController'));
    it('preserves PasteWordByDrag in Value', () => {
      const parsed = JSON.parse(result.Value);
      assert.equal(parsed.Type, 18);
      assert.equal(parsed.PasteWordByDrag.Text, 'hello [friend] (someone).');
    });
  });

  describe('SaveExercise type 5 payload (from capture)', () => {
    const payload = {
      Id: 0, Type: 5, PersonalMaterialId: null, HomeworkLessonId: null,
      Number: 2, IsShowExerciseNumber: true,
      Test: {
        IsEnabledTimer: true, TimerDuration: 3, IsEnabledPoints: false,
        Questions: [{
          Id: 1707722834513, Points: 1, Question: 'What is 1 + 1?',
          Answers: ['2', '1', '3'], QuestionAnswers: ['true', '', ''],
        }],
      },
      Name: 'Take the test', IsAutoCheck: true, IsHidePupil: false,
      LessonSectionId: 20001,
    };
    const result = createEnvelope('ExerciseWsController', 'SaveExercise', 'Books', payload);

    it('preserves Test.Questions in Value', () => {
      const parsed = JSON.parse(result.Value);
      assert.equal(parsed.Type, 5);
      assert.equal(parsed.Test.Questions[0].Question, 'What is 1 + 1?');
      assert.deepEqual(parsed.Test.Questions[0].Answers, ['2', '1', '3']);
      assert.deepEqual(parsed.Test.Questions[0].QuestionAnswers, ['true', '', '']);
    });
  });

  describe('Login payload (env-var placeholders)', () => {
    const payload = {
      Email: '${PROGRESSME_EMAIL}',
      Password: '${PROGRESSME_PASSWORD}',
      RememberMe: true,
      UserRole: 4,
      AuthToken: '${PROGRESSME_AUTH_TOKEN}',
      CurrentDomain: 'progressme.ru',
      AccountRole: 1,
    };
    const result = createEnvelope('AccountWsController', 'Login', 'Users', payload);

    it('sets ProjectName to Users', () => assert.equal(result.ProjectName, 'Users'));
    it('uses env-var placeholders not real credentials', () => {
      const parsed = JSON.parse(result.Value);
      assert.equal(parsed.Email, '${PROGRESSME_EMAIL}');
      assert.equal(parsed.Password, '${PROGRESSME_PASSWORD}');
    });
  });
});
