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
