# Requirement & Implementation Traceability Rules

## Overview

This document specifies the traceability protocol for the contract-first LMS authoring integration project. Traceability guarantees that every business requirement maps directly to actionable tasks, automated tests, empirical evidence (captures/fixtures), and current lifecycle gate status.

---

## Traceability Rules & Identification Standards

### 1. Requirement Identifier Standard (`REQ-<FEATURE>-<NNN>`)
* Every requirement must be assigned a unique, immutable identifier formatted as `REQ-<FEATURE>-<NNN>`.
  * `<FEATURE>`: Uppercase feature component slug (e.g., `PROGRESSME`, `COURSE`, `AUTH`).
  * `<NNN>`: Zero-padded 3-digit sequential integer (e.g., `001`, `002`).
* **Rule:** Requirement IDs are stable. Once assigned, an ID must never be reassigned, even if the requirement is deprecated or modified.

### 2. Task Identification & Linking
* Every execution task in `docs/plans/NOW.md`, task management files, or PR descriptions MUST reference one or more requirement IDs.
* Format: `TASK-<NNN> [REQ-<FEATURE>-<NNN>] Description`
* Example: `TASK-012 [REQ-PROGRESSME-001] Implement AsyncAPI v1 schema validator`

### 3. Test Traceability
* Every automated test case (unit, integration, or schema test) MUST explicitly declare which requirement ID(s) it validates.
* Code Annotation Standard:
  * Python / PyTest: `@pytest.mark.requirement("REQ-PROGRESSME-001")` or comment header `# REQ-PROGRESSME-001: Validates AsyncAPI v1 course schema`
  * TypeScript / Jest: `// Verification for REQ-PROGRESSME-001` within test block metadata or test title.

### 4. Evidence Traceability
* Every claim regarding API compatibility, payload structure, or contract adherence MUST reference empirical evidence.
* Evidence standard sources:
  * Raw network capture files (e.g., `captures/progressme/v1/inbound_websocket_frame.json`)
  * Validated mock payload fixtures (e.g., `fixtures/progressme/v1/course_upsert_payload.json`)
  * Sanitized runtime log traces verifying protocol handshakes or message correlation.

---

## Traceability Matrix Format

Every feature module must maintain a Traceability Matrix within its feature documentation directory (`features/<feature-name>/TRACEABILITY.md`) following this structure:

| Requirement ID | Requirement Description | Task Reference | Test Reference | Evidence / Source Reference | Status |
|---|---|---|---|---|---|
| `REQ-PROGRESSME-001` | Parse and validate ProgressMe v1 AsyncAPI schema | `TASK-001`, `TASK-002` | `tests/contract/test_asyncapi_v1.py::test_parse_schema` | `captures/v1/raw_asyncapi_spec.json` | Complete |
| `REQ-PROGRESSME-002` | Transform ProgressMe course frame to neutral LMS entity | `TASK-003` | `tests/domain/test_course_mapper.py::test_transform_course` | `fixtures/neutral_course_sample.json` | Verifying |
| `REQ-PROGRESSME-003` | Handle correlated inbound WebSocket response payloads | `TASK-004` | `tests/integration/test_websocket_adapter.py` | `captures/v2/ws_correlated_response.json` | Scoped |

---

## Gate State Updates & NOW.md Synchronization

* **Gate Transition Rule:** Whenever a feature transitions between lifecycle gates (e.g., from `reviewed` to `build-ready`), `docs/plans/NOW.md` MUST be updated in the same commit or PR.
* `NOW.md` reflects the active state of all in-flight features, active blockers, gate transition timestamps, and immediate next steps.
