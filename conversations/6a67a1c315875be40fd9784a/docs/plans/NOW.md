# Current Execution Plan (NOW.md)

## Overview

This document serves as the live operational plan and current execution state for the contract-first LMS authoring integration project.

---

## Roadmap & Phase Status

```
[ Phase 1: Baseline & Scaffold ]  ──>  [ Phase 2: v1 Contract & Domain ]  ──>  [ Phase 3: v2 Contract & Inbound Captures ]
           ( COMPLETE )                       ( IN PROGRESS / CURRENT )                       ( PLANNED / NEXT )
```

### Phase Details

#### Phase 1: Research Baseline + Scaffold
* **Status:** `COMPLETE`
* **Deliverables:**
  * Initial research baseline established for LMS authoring protocols.
  * Governance & process documentation scaffolded (`docs/process/FEATURE_LIFECYCLE.md`, `TRACEABILITY.md`, `DEFINITION_OF_DONE.md`).
  * Feature directory structure and template established.

#### Phase 2: v1 ProgressMe AsyncAPI + JSON Schema & Neutral Domain Model
* **Status:** `IN PROGRESS` (Current Active Focus)
* **Deliverables:**
  * v1 ProgressMe AsyncAPI specification and JSON Schema derived from research baseline.
  * Neutral LMS authoring domain model implementation (Courses, Modules, Lessons, Exercises/Steps).
  * Adapter skeleton and bidirectional transformation layer.
  * Unit and schema contract test suite for outbound messages.

#### Phase 3: v2 Contract with Correlated Inbound Captures & Course-Upsert Discovery
* **Status:** `PLANNED` (Next Phase)
* **Deliverables:**
  * v2 AsyncAPI & JSON Schema contract update incorporating real-world network captures.
  * Correlated inbound response mapping and request-reply transaction tracking.
  * Course-upsert message discovery and canonical domain mapping.
  * Strict response typing, error payload schemas, and adapter resilience handlers.

---

## Active Feature Gate Status

| Feature / Component | Active Lifecycle Gate | Status / Next Step |
|---|---|---|
| Project Governance & Process Docs | `complete` | Scaffolded and verified. |
| ProgressMe v1 AsyncAPI & Schemas | `implementing` | Contract defined; writing validator tests. |
| Neutral LMS Domain Model | `implementing` | Domain entities defined; mapping rules under unit test. |
| ProgressMe Adapter Skeleton | `implementing` | Skeleton created; awaiting inbound captures to finalize correlation. |
| ProgressMe v2 Contract & Inbound Sync | `scoped` | Paused at `scoped` gate due to missing captures. |

---

## Active Blockers

1. **Missing Inbound Captures:**
   * **Description:** Lack of real-world inbound network capture files for ProgressMe server responses.
   * **Impact:** Prevents completing inbound schema validation and AsyncAPI v2 request-response correlation.
   * **Action Required:** Capture live WebSocket frame captures during LMS authoring sessions.

2. **Missing WebSocket Path:**
   * **Description:** Exact WebSocket endpoint path, URL schema, and connection handshake parameters are unconfirmed in raw captures.
   * **Impact:** Adapter skeleton cannot finalize client transport connection logic.
   * **Action Required:** Inspect network trace for WSS connection establishment.

3. **Missing Course-Upsert Message:**
   * **Description:** Payload schema for `course-upsert` / batch authoring commands is missing from current research fixtures.
   * **Impact:** Course creation/update sync pipeline cannot be fully mapped to the neutral domain model.
   * **Action Required:** Obtain sample `course-upsert` JSON frame or trigger course save operation in staging environment.

---

## Immediate Next Steps

1. Complete Phase 2 unit tests for neutral domain entities and adapter translation skeleton.
2. Acquire captured network traces addressing the active blockers (WebSocket path, inbound messages, course-upsert payload).
3. Move Phase 2 from `implementing` through `verifying` to `complete`.
4. Advance Phase 3 from `scoped` to `designed` once captures are secured.
