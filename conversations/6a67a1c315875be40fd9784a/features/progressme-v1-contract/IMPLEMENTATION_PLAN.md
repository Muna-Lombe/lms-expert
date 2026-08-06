# Implementation Plan: ProgressMe v1 WebSocket Contract

## Overview
This is a contract-only feature — no runtime code is implemented. The artifacts already exist in the repository (AsyncAPI spec, JSON Schema, capability map, domain model, envelope builder). This plan validates and locks them as version 0.1.0.

---

## Phase 1: Contract Review & Validation
- **Requirement IDs**: REQ-PM-V1-001, REQ-PM-V1-002, REQ-PM-V1-003, REQ-PM-V1-004
- **Description**: Review existing AsyncAPI and JSON Schema against the ProgressMe WebSocket Guide merged inventory. Confirm all operations are present, response bodies are untyped, and capability map is accurate.
- **Tasks**:
  - Cross-check every operation in the AsyncAPI spec against the merged inventory table in ProgressMe_WebSocket_Guide.md.
  - Verify JSON Schema payload definitions match captured examples.
  - Confirm GenericResponse uses additionalProperties: true.
  - Verify capability map statuses match PROGRESSME_STATUS.md.
- **Acceptance Criteria**:
  - [ ] All 28+ operations present in AsyncAPI spec.
  - [ ] JSON Schema covers all distinct payload shapes.
  - [ ] No response schema contains typed fields.
  - [ ] Capability map marks all known-missing operations as "missing".

---

## Phase 2: Domain Model Validation
- **Requirement IDs**: REQ-PM-V1-005
- **Description**: Confirm the neutral domain model has factory functions for all entities, ExerciseType enum is correct, and no vendor terminology leaks outside the adapter boundary.
- **Tasks**:
  - Verify factory functions exist for Book, Course, Lesson, LessonSection, Exercise.
  - Confirm ExerciseType.WORD_FILL_DRAG = 18, ExerciseType.TEST = 5.
  - Grep src/domain/ for ProgressMe-specific terms (PascalCase fields, controller names) — expect zero results.
- **Acceptance Criteria**:
  - [ ] All 5 factory functions present and exported.
  - [ ] ExerciseType values correct.
  - [ ] No vendor terminology in src/domain/ files.

---

## Phase 3: Envelope Builder Validation
- **Requirement IDs**: REQ-PM-V1-001
- **Description**: Verify the envelope builder produces correct canonical envelopes.
- **Tasks**:
  - Test createEnvelope with a known payload and verify all 5 fields.
  - Test with empty payload (should produce `'""'`).
  - Test with string payload (should pass through).
  - Verify RequestId is a valid UUID.
- **Acceptance Criteria**:
  - [ ] Envelope builder handles object, string, and empty payloads correctly.
  - [ ] RequestId is a unique UUID per call.

---

## Phase 4: Gate Review & Lock
- **Requirement IDs**: REQ-PM-V1-001 through REQ-PM-V1-005
- **Description**: Complete the feature gate review. Update feature.yaml gate to "contract-reviewed" and update CHANGELOG.md.
- **Tasks**:
  - Review all acceptance criteria across phases.
  - Update feature.yaml gate status.
  - Update CHANGELOG.md with the v0.1.0 contract entry.
  - Update docs/plans/NOW.md to reflect completed gate.
- **Acceptance Criteria**:
  - [ ] All acceptance criteria met.
  - [ ] feature.yaml gate updated.
  - [ ] CHANGELOG.md updated.
  - [ ] npm run check passes.
