# Task List: ProgressMe v1 WebSocket Contract

> Every task references one or more Requirement IDs.

## Tasks

| Task ID | Description | Requirement IDs | Status | Assignee |
| --- | --- | --- | --- | --- |
| TASK-001 | Cross-check AsyncAPI operations against ProgressMe_WebSocket_Guide.md merged inventory | REQ-PM-V1-001 | Done | agent |
| TASK-002 | Verify JSON Schema payload definitions match captured examples | REQ-PM-V1-002 | Done | agent |
| TASK-003 | Confirm GenericResponse and all response payloads use additionalProperties: true | REQ-PM-V1-003 | Done | agent |
| TASK-004 | Validate capability map statuses match PROGRESSME_STATUS.md | REQ-PM-V1-004 | Done | agent |
| TASK-005 | Verify domain model factory functions and ExerciseType enum | REQ-PM-V1-005 | Done | agent |
| TASK-006 | Grep src/domain/ for ProgressMe-specific terms (expect zero) | REQ-PM-V1-005 | Done | agent |
| TASK-007 | Test envelope builder with object, string, and empty payloads | REQ-PM-V1-001 | Done | agent |
| TASK-008 | Write unit tests for domain model factory functions | REQ-PM-V1-005 | Done | agent |
| TASK-009 | Write contract tests for AsyncAPI spec validation | REQ-PM-V1-001 | Done | agent |
| TASK-010 | Write contract tests for JSON Schema validation | REQ-PM-V1-002 | Done | agent |
| TASK-011 | Write contract tests for capability map validation | REQ-PM-V1-004 | Done | agent |
| TASK-012 | Write negative tests for schema validation failures | REQ-PM-V1-002, REQ-PM-V1-003 | Done | agent |
| TASK-013 | Update feature.yaml gate to "build-ready" | REQ-PM-V1-001..005 | Done | agent |
| TASK-014 | Update CHANGELOG.md with test suite completion | REQ-PM-V1-001..005 | Done | agent |
| TASK-015 | Update docs/plans/NOW.md to reflect build-ready gate | REQ-PM-V1-001..005 | Done | agent |
| TASK-016 | Run npm run check — verify 0 errors | REQ-PM-V1-001..005 | Done | agent |
