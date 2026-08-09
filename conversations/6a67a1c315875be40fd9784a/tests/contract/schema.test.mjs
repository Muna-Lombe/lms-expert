import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SCHEMA_PATH = join(process.cwd(), 'schemas/progressme.websocket.schema.json');
const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));

describe('JSON Schema file is valid', () => {
  it('file exists', () => assert.ok(existsSync(SCHEMA_PATH)));
  it('has $schema pointing to draft 2020-12', () =>
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema'));
  it('has $id', () => assert.ok(schema.$id));
  it('has title', () => assert.ok(schema.title));
  it('has $defs section', () => assert.ok(schema.$defs));
  it('type is object', () => assert.equal(schema.type, 'object'));
});

// All expected $defs that should be present
const expectedDefs = [
  'Envelope',
  'BookTags',
  'LessonTags',
  'BookUpsertPayload',
  'GetBookPayload',
  'CopyBookPayload',
  'LessonUpsertPayload',
  'ExerciseCommonFields',
  'SaveExerciseWordFillPayload',
  'SaveExerciseTestPayload',
  'LoginPayload',
  'GenericResponse',
];

describe('JSON Schema contains all expected definitions', () => {
  for (const defName of expectedDefs) {
    it(`has $def: ${defName}`, () => {
      assert.ok(schema.$defs[defName], `Missing $def: ${defName}`);
    });
  }
});

describe('Envelope schema', () => {
  const env = schema.$defs.Envelope;
  it('requires all 5 fields', () => {
    assert.deepEqual(
      env.required.sort(),
      ['Controller', 'Method', 'ProjectName', 'RequestId', 'Value'].sort()
    );
  });
  it('Controller is type string', () => assert.equal(env.properties.Controller.type, 'string'));
  it('Method is type string', () => assert.equal(env.properties.Method.type, 'string'));
  it('ProjectName is type string', () => assert.equal(env.properties.ProjectName.type, 'string'));
  it('RequestId has format uuid', () => assert.equal(env.properties.RequestId.format, 'uuid'));
  it('Value is type string', () => assert.equal(env.properties.Value.type, 'string'));
});

describe('BookUpsertPayload schema', () => {
  const bp = schema.$defs.BookUpsertPayload;
  it('requires Id and Name', () => {
    assert.ok(bp.required.includes('Id'));
    assert.ok(bp.required.includes('Name'));
  });
  it('Id accepts integer or null', () => {
    assert.deepEqual(bp.properties.Id.type, ['integer', 'null']);
  });
  it('Name is type string', () => assert.equal(bp.properties.Name.type, 'string'));
  it('has Tags ref to BookTags', () => {
    assert.ok(bp.properties.Tags.$ref, 'Tags should have a $ref');
    assert.ok(bp.properties.Tags.$ref.includes('BookTags'));
  });
  it('has NoPhotoColor field', () => assert.ok(bp.properties.NoPhotoColor));
});

describe('LessonUpsertPayload schema', () => {
  const lp = schema.$defs.LessonUpsertPayload;
  it('requires Id, Name, CourseId, Number', () => {
    assert.ok(lp.required.includes('Id'));
    assert.ok(lp.required.includes('Name'));
    assert.ok(lp.required.includes('CourseId'));
    assert.ok(lp.required.includes('Number'));
  });
  it('has Tags ref to LessonTags', () => {
    assert.ok(lp.properties.Tags.$ref.includes('LessonTags'));
  });
});

describe('SaveExerciseWordFillPayload schema (type 18)', () => {
  const ex = schema.$defs.SaveExerciseWordFillPayload;
  it('is an allOf composition', () => assert.ok(Array.isArray(ex.allOf)));
  it('has Type const 18 in the second allOf branch', () => {
    const branch = ex.allOf[1];
    assert.equal(branch.properties.Type.const, 18);
  });
  it('requires PasteWordByDrag', () => {
    const branch = ex.allOf[1];
    assert.ok(branch.required.includes('PasteWordByDrag'));
  });
  it('PasteWordByDrag.Text is type string', () => {
    const branch = ex.allOf[1];
    assert.equal(branch.properties.PasteWordByDrag.properties.Text.type, 'string');
  });
});

describe('SaveExerciseTestPayload schema (type 5)', () => {
  const ex = schema.$defs.SaveExerciseTestPayload;
  it('is an allOf composition', () => assert.ok(Array.isArray(ex.allOf)));
  it('has Type const 5 in the second allOf branch', () => {
    const branch = ex.allOf[1];
    assert.equal(branch.properties.Type.const, 5);
  });
  it('requires Test', () => {
    const branch = ex.allOf[1];
    assert.ok(branch.required.includes('Test'));
  });
  it('Test has Questions array', () => {
    const test = ex.allOf[1].properties.Test;
    assert.equal(test.properties.Questions.type, 'array');
  });
  it('Question has Answers and QuestionAnswers arrays', () => {
    const questions = ex.allOf[1].properties.Test.properties.Questions;
    const questionItem = questions.items;
    assert.equal(questionItem.properties.Answers.type, 'array');
    assert.equal(questionItem.properties.QuestionAnswers.type, 'array');
    assert.ok(questionItem.required.includes('Answers'));
    assert.ok(questionItem.required.includes('QuestionAnswers'));
  });
});

describe('LoginPayload schema', () => {
  const lp = schema.$defs.LoginPayload;
  it('requires all 7 fields', () => {
    assert.equal(lp.required.length, 7);
    assert.ok(lp.required.includes('Email'));
    assert.ok(lp.required.includes('Password'));
    assert.ok(lp.required.includes('RememberMe'));
    assert.ok(lp.required.includes('UserRole'));
    assert.ok(lp.required.includes('AuthToken'));
    assert.ok(lp.required.includes('CurrentDomain'));
    assert.ok(lp.required.includes('AccountRole'));
  });
  it('Email description references env var', () =>
    assert.ok(lp.properties.Email.description.includes('PROGRESSME_EMAIL')));
  it('Password description references env var', () =>
    assert.ok(lp.properties.Password.description.includes('PROGRESSME_PASSWORD')));
});

describe('GenericResponse schema is untyped', () => {
  const gr = schema.$defs.GenericResponse;
  it('uses additionalProperties: true', () => assert.equal(gr.additionalProperties, true));
  it('type is object', () => assert.equal(gr.type, 'object'));
  it('does not have typed properties', () => {
    assert.ok(!gr.properties || Object.keys(gr.properties).length === 0,
      'GenericResponse should not have typed properties');
  });
  it('description mentions uncaptured', () =>
    assert.ok(gr.description.includes('not') || gr.description.includes('uncaptured')));
});
