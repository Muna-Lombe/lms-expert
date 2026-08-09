# Current Execution Plan (NOW.md)

## Overview

This document serves as the live operational plan and current execution state for the contract-first LMS authoring integration project.

---

## Roadmap & Phase Status

```
[ Phase 1: Baseline & Scaffold ]  ──>  [ Phase 2: v1 Contract & Domain ]  ──>  [ Phase 3: v2 Contract & Inbound Captures ]
           ( COMPLETE )                       ( BUILD-READY )                    ( PLANNED / NEXT )
```

### Phase Details

#### Phase 1: Research Baseline + Scaffold
* **Status:** `COMPLETE`
* **Deliverables:*
  * Initial research baseline established for LMS authoring protocols.
  * Governance & process documentation scaffolded.
  * Feature directory structure and template established.

#### Phase 2: v1 ProgressMe AsyncAPI + JSON Schema & Neutral Domain Model
* **Status:** `BUILD-READY` (FEAT-001 gate advanced)
* **Deliverables:*
  * v1 ProgressMe AsyncAPI 3.0 specification — 28+ operations, all captured outbound messages.
  * JSON Schema (draft 2020-12) for all distinct request payload shapes.
  * ProgressMe capability map (machine-readable, confirmed vs missing).
  * Contract status authority (`docs/core/PROGRESSME_STATUS.md`).
  * Neutral domain model with factory functions (Book, Course, Lesson, LessonSection, Exercise).
  * Envelope builder for the canonical ProgressMe WebSocket request envelope.
  * Unit test suite — envelope builder, domain model, vendor isolation (all passing).
  * Contract test suite — AsyncAPI, JSON Schema, capability map (all passing).
  * Negative test suite — schema validation failures (all passing).
  * Feature `FEAT-001: progressme-v1-contract` — gate at `build-ready`.
  * Total: 213 tests, 0 failures.
* **Remaining for implementation:*
  * Implement adapter methods (WebSocket client, send/receive, correlation).
  * Implement application use cases (importBook, exportBook, createLesson, createExercise).
  * Integration tests with mock WebSocket server.
  * All blocked on inbound captures for full response handling.

#### Phase 3: v2 Contract with Correlated Inbound Captures & Course-Upsert Discovery
* **Status:** `PLANNED` (Next Phase)
* **Deliverables:*
  * v2 AsyncAPI & JSON Schema contract update incorporating real-world network captures.
  * Correlated inbound response mapping and request-reply transaction tracking.
  * Course-upsert message discovery and canonical domain mapping.
  * Strict response typing, error payload schemas, and adapter resilience handlers.

---

## Active Feature Gate Status

| Feature / Component | Active Lifecycle Gate | Status / Next Step |
|---|---|---|
| Project Governance & Process Docs | `complete` | Scaffolded and verified. |
| FEAT-001: progressme-v1-contract | `build-ready` | All tests passing (213/213). Ready for adapter implementation. |
| ProgressMe Adapter Implementation | `scoped` | Stubs exist. Blocked on inbound captures for full implementation. |
| ProgressMe v2 Contract & Inbound Sync | `scoped` | Paused at `scoped` gate due to missing captures. |

---

## Active Blockers

1. **Missing Inbound Captures:*
   * **Description:* No inbound WebSocket response frames captured.
   * **Impact:* Cannot type response bodies or implement response handling in adapter.
   * **Action Required:* Capture live WebSocket frame pairs (request + response) during LMS authoring sessions.

2. **Missing WebSocket Path:*
   * **Description:* Exact WebSocket endpoint path unconfirmed.
   * **Impact:* Adapter cannot finalize transport connection logic.
   * **Action Required:* Inspect network trace for WSS connection establishment.

3. **Missing Course-Upsert Message:*
   * **Description:* No course-create operation captured.
   * **Impact:* From-zero book importer cannot create courses.
   * **Action Required:* Capture a course-save operation in staging.

---

## Immediate Next Steps

1. Implement adapter envelope → WebSocket send pipeline (outbound only, dry-run mode).
2. Implement application use cases with dry-run adapter.
3. Acquire captured network traces addressing the active blockers (WebSocket path, inbound messages, course-upsert payload).
4. Advance Phase 3 from `scoped` to `designed` once captures are secured.
