# Requirements: ProgressMe v1 WebSocket Contract

## Requirements Summary

| ID | Description | Priority | Evidence | Confidence |
| --- | --- | --- | --- | --- |
| REQ-PM-V1-001 | Define AsyncAPI 3.0 spec for all 28 captured outbound operations | High | ProgressMe_WebSocket_Guide.md, sanitized captures | High |
| REQ-PM-V1-002 | Define JSON Schema for request envelopes and payloads | High | ProgressMe_WebSocket_Guide.md, sanitized captures | High |
| REQ-PM-V1-003 | Mark all response bodies as uncaptured (additionalProperties: true) | High | Absence of inbound frames in captures | High |
| REQ-PM-V1-004 | Document capability map showing confirmed vs missing operations | High | PROGRESSME_STATUS.md, platform-catalog.json | High |
| REQ-PM-V1-005 | Establish the neutral domain model for Book → Course → Lesson → Exercise | Medium | DOMAIN_MODEL.md, LMS_API_Research_2026-07-27.md | Medium |

## Detailed Requirements

### REQ-PM-V1-001: AsyncAPI 3.0 specification

- **Description**: Create an AsyncAPI 3.0 document covering all 28+ captured outbound WebSocket operations across Book, Course, Lesson, Exercise, Tags, Sharing, and User controllers. Each operation must specify the canonical envelope (Controller, Method, ProjectName, RequestId, Value) with controller-specific header constraints.
- **Priority**: High
- **Evidence**: Sanitized first-party browser captures (2026-07-28), ProgressMe_WebSocket_Guide.md merged operation inventory.
- **Confidence**: High
- **Rationale**: The AsyncAPI spec is the machine-readable contract that adapters, tests, and documentation reference. Without it, the protocol is only described in prose.
- **Acceptance Criteria**:
  - [ ] All operations from the merged inventory table are present in the spec.
  - [ ] Each operation references the canonical envelope schema.
  - [ ] Controller and Method names use PascalCase as captured.
  - [ ] ProjectName values match captured values (Books, Users, MainWs).

### REQ-PM-V1-002: JSON Schema for request payloads

- **Description**: Define JSON Schema (draft 2020-12) for every distinct request payload shape: BookUpsert, GetBook, CopyBook, LessonUpsert, SaveExercise (type 18 and type 5), Login, and the remaining operations with known shapes or additionalProperties: true for unknowns.
- **Priority**: High
- **Evidence**: Captured payload examples in ProgressMe_WebSocket_Guide.md.
- **Confidence**: High
- **Rationale**: Payload schemas enable automated validation of outbound messages and future fixture-based contract tests.
- **Acceptance Criteria**:
  - [ ] BookUpsertPayload schema covers all captured fields.
  - [ ] SaveExerciseWordFillPayload and SaveExerciseTestPayload are distinct schemas.
  - [ ] LoginPayload uses env-var placeholders, never real credentials.
  - [ ] Unknown payloads use additionalProperties: true, not invented fields.

### REQ-PM-V1-003: Response bodies remain uncaptured

- **Description**: All response payloads in the AsyncAPI spec and JSON Schema must use `additionalProperties: true` with a description noting inbound frames are not yet captured. No response schema may be invented.
- **Priority**: High
- **Evidence**: Captures contain outbound messages only — no inbound response frames were supplied.
- **Confidence**: High
- **Rationale**: Inventing response schemas would make the contract unreliable. The AGENTS.md rule "Unknown fields remain unknown; do not invent a schema to make validation pass" applies directly.
- **Acceptance Criteria**:
  - [ ] GenericResponse message in AsyncAPI uses additionalProperties: true.
  - [ ] No response schema contains typed fields.
  - [ ] PROGRESSME_STATUS.md lists next-capture requirements for inbound frames.

### REQ-PM-V1-004: Capability map

- **Description**: Create a machine-readable capability map (JSON) showing which operations are confirmed, inferred, or missing for each domain area (book, course, lesson, exercise, sharing, tags, auth, responses, binary upload).
- **Priority**: High
- **Evidence**: PROGRESSME_STATUS.md, merged operation inventory in ProgressMe_WebSocket_Guide.md.
- **Confidence**: High
- **Rationale**: The capability map lets tooling and future feature work quickly determine what is safe to build against and what still needs capture.
- **Acceptance Criteria**:
  - [ ] Each domain area has a status per CRUD operation.
  - [ ] Missing operations (course upsert, delete, binary upload, response bodies) are explicitly marked.
  - [ ] Evidence references point to the guide document.

### REQ-PM-V1-005: Neutral domain model

- **Description**: Define the vendor-neutral domain model (Book, Course, Lesson, LessonSection, Exercise) with factory functions and JSDoc types. The model must not expose ProgressMe-specific terminology (PascalCase fields, controller names) — those belong in the adapter.
- **Priority**: Medium
- **Evidence**: DOMAIN_MODEL.md, captured hierarchy (Book → Course → Lesson → LessonSection → Exercise).
- **Confidence**: Medium
- **Rationale**: The neutral model is the integration boundary. Future adapters (ClassIn, Canvas, etc.) map to the same model.
- **Acceptance Criteria**:
  - [ ] Factory functions exist for Book, Course, Lesson, LessonSection, Exercise.
  - [ ] ExerciseType enum covers type 18 (word-fill) and type 5 (test).
  - [ ] No ProgressMe-specific field names appear outside src/adapters/progressme/.
