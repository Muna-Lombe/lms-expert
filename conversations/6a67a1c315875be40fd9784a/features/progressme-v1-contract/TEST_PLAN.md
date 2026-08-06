# Test Plan: ProgressMe v1 WebSocket Contract

## Unit tests
- Test the envelope builder (`src/adapters/progressme/envelope.js`).
- Test domain model factory functions (`src/domain/index.js`).
- Key test scenarios:
  - [ ] `createEnvelope` produces correct Controller/Method/ProjectName/RequestId/Value fields.
  - [ ] `createEnvelope` stringifies object payloads into `Value`.
  - [ ] `createEnvelope` produces `'""'` for empty/undefined payloads.
  - [ ] `createEnvelope` generates a unique UUID for each call.
  - [ ] `createBook` returns a book with sensible defaults and applied overrides.
  - [ ] `createLesson` returns a lesson with `id: 0` and applied overrides.
  - [ ] `createExercise` returns an exercise with `id: 0` and `content: {}`.
  - [ ] `ExerciseType.WORD_FILL_DRAG` equals 18 and `ExerciseType.TEST` equals 5.

## Contract tests
- Validate the AsyncAPI YAML is syntactically valid AsyncAPI 3.0.
- Validate the JSON Schema files are valid JSON Schema draft 2020-12.
- Validate the capability map JSON is well-formed and has expected keys.
- Key test scenarios:
  - [ ] AsyncAPI spec parses without errors.
  - [ ] AsyncAPI spec contains all 28+ operations from the merged inventory.
  - [ ] JSON Schema `Envelope` definition requires all 5 fields.
  - [ ] JSON Schema `BookUpsertPayload` requires `Id` and `Name`.
  - [ ] JSON Schema `SaveExerciseWordFillPayload` has `Type: 18` and `PasteWordByDrag`.
  - [ ] JSON Schema `SaveExerciseTestPayload` has `Type: 5` and `Test.Questions`.
  - [ ] JSON Schema `LoginPayload` has all 7 required fields.
  - [ ] `GenericResponse` uses `additionalProperties: true` (not typed fields).
  - [ ] Capability map has entries for all domain areas.
  - [ ] Capability map marks course create, delete ops, and binary upload as "missing".

## Integration tests
- Not applicable for this contract-only feature. Integration tests will be written when the adapter is implemented.

## Negative tests
- **Schema validation**: Payloads with missing required fields must fail validation.
- **Type mismatches**: `Value` as a nested object (not stringified) must be detected.
- **Invalid UUID**: `RequestId` that is not a valid UUID must be flagged.
- Key test scenarios:
  - [ ] BookUpsert payload without `Name` fails schema validation.
  - [ ] LessonUpsert payload without `CourseId` fails schema validation.
  - [ ] SaveExercise payload with unknown type (not 5 or 18) is flagged as unknown.
  - [ ] Envelope with `Value` as a nested object (not string) is flagged.

## Fixtures needed
- Sample ProgressMe request envelopes (one per operation type) — sanitized, no real IDs or tokens.
- Sample BookUpsert create and update payloads.
- Sample LessonUpsert create payload.
- Sample SaveExercise type 18 and type 5 payloads.
- Sample Login payload with env-var placeholders.

## Coverage targets
- **Contract Schema Coverage**: 100% of defined operations have a schema reference.
- **Capability Map Coverage**: 100% of domain areas have confirmed/missing status.
- **AsyncAPI Operation Coverage**: 100% of merged-inventory operations are present.
