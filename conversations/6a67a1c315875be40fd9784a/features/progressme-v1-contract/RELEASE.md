# Release Notes: ProgressMe v1 WebSocket Contract

## Summary
First versioned contract for the ProgressMe/Edvibe private WebSocket RPC authoring protocol. Covers 28+ captured outbound operations across Book, Course, Lesson, Exercise, Tags, Sharing, and User controllers. Response bodies remain uncaptured and untyped.

## Changes

### Contract Changes
- Added AsyncAPI 3.0 specification: `asyncapi/progressme.websocket.asyncapi.yaml`
- Added JSON Schema (draft 2020-12): `schemas/progressme.websocket.schema.json`
- Added capability map: `schemas/platforms/progressme.capability.json`
- Added contract status authority: `docs/core/PROGRESSME_STATUS.md`
- Versioned as 0.1.0

### User-Visible Changes
None — contract-only feature, no runtime behavior.

### Internal Changes
- Established neutral domain model in `src/domain/` with factory functions.
- Established envelope builder in `src/adapters/progressme/envelope.js`.
- Established adapter and infrastructure stubs.

## Breaking changes
None — first versioned release.

## Migration guide
No migration required.

## Verification results
- **AsyncAPI Operation Coverage**: All 28+ operations from the merged inventory are present.
- **JSON Schema Coverage**: All distinct payload shapes have schemas.
- **Response Typing**: Correctly untyped (additionalProperties: true).
- **Capability Map**: All domain areas have confirmed/missing status.
- **Domain Model**: No vendor terminology outside adapter boundary.
- **npm run check**: Passed (0 errors, 0 warnings).
- **npm run build:research-baseline**: Passed (0 errors).

## Known limitations
- **Response bodies uncaptured**: No inbound WebSocket frames were in the capture. All response payloads are `additionalProperties: true` until correlated inbound frames are recorded.
- **WebSocket path unknown**: The exact `wss://` path was not in the capture. The env.example uses `wss://proxy-a.edvibe.com/websocket` as a working assumption.
- **No course-upsert operation**: A from-zero book importer cannot create courses — only read them. Either a course-upsert message, a default course created with the book, or a separate REST/partner operation is needed.
- **No delete operations**: No delete messages for books, lessons, or exercises were captured.
- **No binary upload**: No file/binary upload operation was observed.
- **Uncalled operations**: Five operations appeared without request bodies and are not yet callable specifications.
