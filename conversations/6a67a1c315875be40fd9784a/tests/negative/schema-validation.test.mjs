import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createEnvelope } from '../../src/adapters/progressme/envelope.js';

const SCHEMA_PATH = join(process.cwd(), 'schemas/progressme.websocket.schema.json');
const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));

/**
 * Minimal JSON Schema validator (no external deps).
 * Supports: type, required, const, enum, additionalProperties, $ref, allOf,
 * properties, array items. Sufficient for the negative tests below.
 */
function validateAgainstDef(value, defName, defs) {
  const errors = [];
  const def = defs[defName];
  if (!def) return [`Unknown definition: ${defName}`];

  _validate(value, def, defs, '', errors);
  return errors;
}

function _validate(value, def, defs, path, errors) {
  // Resolve $ref
  if (def.$ref) {
    const refName = def.$ref.replace('#/$defs/', '');
    const refDef = defs[refName];
    if (!refDef) { errors.push(`${path || 'root'}: unresolvable $ref ${def.$ref}`); return; }
    _validate(value, refDef, defs, path, errors);
    return;
  }

  // allOf
  if (def.allOf) {
    for (const sub of def.allOf) {
      _validate(value, sub, defs, path, errors);
    }
    return;
  }

  // type check
  if (def.type) {
    const types = Array.isArray(def.type) ? def.type : [def.type];
    const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    if (!types.includes(actualType)) {
      errors.push(`${path || 'root'}: expected type ${types.join('|')}, got ${actualType}`);
      return; // no point checking further if type is wrong
    }
  }

  // const check
  if (def.const !== undefined && value !== def.const) {
    errors.push(`${path || 'root'}: expected const ${JSON.stringify(def.const)}, got ${JSON.stringify(value)}`);
  }

  // enum check
  if (def.enum && !def.enum.includes(value)) {
    errors.push(`${path || 'root'}: value ${JSON.stringify(value)} not in enum ${JSON.stringify(def.enum)}`);
  }

  // required fields (for objects)
  if (def.required && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    for (const field of def.required) {
      if (!(field in value)) {
        errors.push(`${path || 'root'}: missing required field '${field}'`);
      }
    }
  }

  // properties (for objects)
  if (def.properties && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    for (const [key, subDef] of Object.entries(def.properties)) {
      if (key in value) {
        _validate(value[key], subDef, defs, path ? `${path}.${key}` : key, errors);
      }
    }
  }

  // array items — validate each element against the items schema
  if (def.items && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      _validate(value[i], def.items, defs, path ? `${path}[${i}]` : `[${i}]`, errors);
    }
  }

  // additionalProperties (for objects) — only check if explicitly false
  if (def.additionalProperties === false && typeof value === 'object' && value !== null) {
    const knownKeys = Object.keys(def.properties || {});
    for (const key of Object.keys(value)) {
      if (!knownKeys.includes(key)) {
        errors.push(`${path || 'root'}: additional property '${key}' not allowed`);
      }
    }
  }
}

const defs = schema.$defs;

// ─── Envelope negative tests ───────────────────────────────────────

describe('Envelope validation — negative cases', () => {
  it('rejects envelope missing Controller', () => {
    const env = { Method: 'X', ProjectName: 'Books', RequestId: 'abc', Value: '""' };
    const errors = validateAgainstDef(env, 'Envelope', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Controller'")));
  });

  it('rejects envelope missing RequestId', () => {
    const env = { Controller: 'BookWsController', Method: 'X', ProjectName: 'Books', Value: '""' };
    const errors = validateAgainstDef(env, 'Envelope', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'RequestId'")));
  });

  it('rejects envelope with Value as object (not string)', () => {
    const env = { Controller: 'X', Method: 'Y', ProjectName: 'Z', RequestId: 'abc', Value: { Id: 1 } };
    const errors = validateAgainstDef(env, 'Envelope', defs);
    assert.ok(errors.some(e => e.includes('expected type string') && e.includes('Value')));
  });

  it('rejects envelope missing Value', () => {
    const env = { Controller: 'X', Method: 'Y', ProjectName: 'Z', RequestId: 'abc' };
    const errors = validateAgainstDef(env, 'Envelope', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Value'")));
  });
});

// ─── BookUpsertPayload negative tests ──────────────────────────────

describe('BookUpsertPayload validation — negative cases', () => {
  it('rejects payload missing Name', () => {
    const payload = { Id: null };
    const errors = validateAgainstDef(payload, 'BookUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Name'")));
  });

  it('rejects payload missing Id', () => {
    const payload = { Name: 'Test' };
    const errors = validateAgainstDef(payload, 'BookUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Id'")));
  });

  it('rejects Name as number instead of string', () => {
    const payload = { Id: null, Name: 123 };
    const errors = validateAgainstDef(payload, 'BookUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes('Name') && e.includes('expected type string')));
  });

  it('rejects Id as boolean', () => {
    const payload = { Id: true, Name: 'Test' };
    const errors = validateAgainstDef(payload, 'BookUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes('Id') && e.includes('expected type')));
  });
});

// ─── LessonUpsertPayload negative tests ────────────────────────────

describe('LessonUpsertPayload validation — negative cases', () => {
  it('rejects payload missing CourseId', () => {
    const payload = { Id: 0, Name: 'Unit 1', Number: 1 };
    const errors = validateAgainstDef(payload, 'LessonUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'CourseId'")));
  });

  it('rejects payload missing Name', () => {
    const payload = { Id: 0, CourseId: 1, Number: 1 };
    const errors = validateAgainstDef(payload, 'LessonUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Name'")));
  });

  it('rejects payload missing Number', () => {
    const payload = { Id: 0, Name: 'Unit 1', CourseId: 1 };
    const errors = validateAgainstDef(payload, 'LessonUpsertPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Number'")));
  });
});

// ─── SaveExerciseWordFillPayload negative tests ────────────────────

describe('SaveExerciseWordFillPayload (type 18) — negative cases', () => {
  it('rejects exercise missing LessonSectionId', () => {
    const payload = { Id: 0, Type: 18, Name: 'Test', PasteWordByDrag: { Text: 'hello' } };
    const errors = validateAgainstDef(payload, 'SaveExerciseWordFillPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'LessonSectionId'")));
  });

  it('rejects exercise with Type 5 instead of 18', () => {
    const payload = {
      Id: 0, Type: 5, Name: 'Test', LessonSectionId: 1,
      PasteWordByDrag: { Text: 'hello' },
    };
    const errors = validateAgainstDef(payload, 'SaveExerciseWordFillPayload', defs);
    assert.ok(errors.some(e => e.includes('const') && e.includes('5')));
  });

  it('rejects exercise missing PasteWordByDrag', () => {
    const payload = { Id: 0, Type: 18, Name: 'Test', LessonSectionId: 1 };
    const errors = validateAgainstDef(payload, 'SaveExerciseWordFillPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'PasteWordByDrag'")));
  });
});

// ─── SaveExerciseTestPayload negative tests ─────────────────────────

describe('SaveExerciseTestPayload (type 5) — negative cases', () => {
  it('rejects exercise missing Test', () => {
    const payload = { Id: 0, Type: 5, Name: 'Test', LessonSectionId: 1 };
    const errors = validateAgainstDef(payload, 'SaveExerciseTestPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Test'")));
  });

  it('rejects exercise with Type 18 instead of 5', () => {
    const payload = {
      Id: 0, Type: 18, Name: 'Test', LessonSectionId: 1,
      Test: { Questions: [] },
    };
    const errors = validateAgainstDef(payload, 'SaveExerciseTestPayload', defs);
    assert.ok(errors.some(e => e.includes('const') && e.includes('18')));
  });

  it('rejects Test missing Questions', () => {
    const payload = {
      Id: 0, Type: 5, Name: 'Test', LessonSectionId: 1,
      Test: { IsEnabledTimer: true },
    };
    const errors = validateAgainstDef(payload, 'SaveExerciseTestPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Questions'")));
  });

  it('rejects question missing Answers', () => {
    const payload = {
      Id: 0, Type: 5, Name: 'Test', LessonSectionId: 1,
      Test: {
        Questions: [{ Id: 1, Question: 'Q?', QuestionAnswers: ['true'] }],
      },
    };
    const errors = validateAgainstDef(payload, 'SaveExerciseTestPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Answers'")));
  });
});

// ─── LoginPayload negative tests ────────────────────────────────────

describe('LoginPayload validation — negative cases', () => {
  it('rejects login missing Email', () => {
    const payload = {
      Password: 'x', RememberMe: true, UserRole: 4,
      AuthToken: 't', CurrentDomain: 'progressme.ru', AccountRole: 1,
    };
    const errors = validateAgainstDef(payload, 'LoginPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Email'")));
  });

  it('rejects login missing Password', () => {
    const payload = {
      Email: 'x', RememberMe: true, UserRole: 4,
      AuthToken: 't', CurrentDomain: 'progressme.ru', AccountRole: 1,
    };
    const errors = validateAgainstDef(payload, 'LoginPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'Password'")));
  });

  it('rejects login missing AuthToken', () => {
    const payload = {
      Email: 'x', Password: 'p', RememberMe: true, UserRole: 4,
      CurrentDomain: 'progressme.ru', AccountRole: 1,
    };
    const errors = validateAgainstDef(payload, 'LoginPayload', defs);
    assert.ok(errors.some(e => e.includes("missing required field 'AuthToken'")));
  });
});

// ─── Envelope builder edge cases (negative) ─────────────────────────

describe('Envelope builder — edge cases', () => {
  it('Value for object payload is NOT a nested object', () => {
    const env = createEnvelope('A', 'B', 'C', { Id: 1 });
    assert.equal(typeof env.Value, 'string');
    assert.notEqual(typeof env.Value, 'object');
    // Parse to confirm it's valid JSON
    assert.doesNotThrow(() => JSON.parse(env.Value));
  });

  it('Value for empty payload is the string \'""\' not empty string', () => {
    const env = createEnvelope('A', 'B', 'C');
    assert.equal(env.Value, '""');
    assert.notEqual(env.Value, '');
  });
});
