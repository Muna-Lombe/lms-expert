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
| TASK-008 | Update feature.yaml gate to "contract-reviewed" | REQ-PM-V1-001..005 | Todo | agent |
| TASK-009 | Update CHANGELOG.md with v0.1.0 contract entry | REQ-PM-V1-001..005 | Todo | agent |
| TASK-010 | Update docs/plans/NOW.md to reflect completed gate | REQ-PM-V1-001..005 | Todo | agent |
| TASK-011 | Run npm run check — verify 0 errors | REQ-PM-V1-001..005 | Todo | agent |
