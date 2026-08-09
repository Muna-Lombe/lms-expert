# Changelog

All notable project and contract changes are recorded here.

## Unreleased

- Established the documentation-first project scaffold.
- Added mandatory reading rules and a gated feature lifecycle.
- Preserved the original LMS API research as the baseline evidence package.

## [0.1.0] — 2026-08-06

### Added
- AsyncAPI 3.0 specification for ProgressMe WebSocket RPC (28+ operations).
- JSON Schema (draft 2020-12) for all captured request payload shapes.
- ProgressMe capability map (machine-readable, confirmed vs missing).
- Contract status authority (`docs/core/PROGRESSME_STATUS.md`).
- Neutral domain model with factory functions (Book, Course, Lesson, LessonSection, Exercise).
- Envelope builder for the canonical ProgressMe WebSocket request envelope.
- Feature `FEAT-001: progressme-v1-contract` — contract reviewed and locked at gate "contract-reviewed".

### Known limitations
- Response bodies uncaptured — all response payloads use `additionalProperties: true`.
- WebSocket path not captured — env.example uses `wss://proxy-a.edvibe.com/websocket` as assumption.
- No course-upsert, delete, or binary upload operations captured.
- Five operations appeared without request bodies (not yet callable).

## [0.1.1] — 2026-08-09

### Added
- Unit test suite: envelope builder (12 test groups, all passing).
- Unit test suite: domain model factory functions and ExerciseType (6 test groups, all passing).
- Unit test suite: vendor isolation in domain model (5 checks, all passing).
- Contract test suite: AsyncAPI spec validation (27 operations, 9 controllers, 3 project names — all passing).
- Contract test suite: JSON Schema validation (12 definitions, all fields verified — all passing).
- Contract test suite: capability map validation (9 domain areas, confirmed/missing statuses — all passing).
- Negative test suite: schema validation failures (envelope, BookUpsert, LessonUpsert, SaveExercise, Login — all passing).
- Test scripts added to package.json: `npm test`, `npm run test:unit`, `npm run test:contract`, `npm run test:negative`.
- Feature `FEAT-001: progressme-v1-contract` — advanced to gate "build-ready".
- Total: 213 tests, 0 failures.
