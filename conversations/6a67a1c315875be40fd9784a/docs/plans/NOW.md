# Current Execution Plan (NOW.md)

## Overview

This document serves as the live operational plan and current execution state for the contract-first LMS authoring integration project.

---

## Roadmap & Phase Status

```
[ Phase 1: Baseline & Scaffold ]  ──>  [ Phase 2: v1 Contract & Domain ]  ──>  [ Phase 3: v2 Contract & Inbound Captures ]
           ( COMPLETE )                       ( IMPLEMENTING )                   ( PLANNED / NEXT )
```

### Phase Details

#### Phase 1: Research Baseline + Scaffold
* **Status:** `COMPLETE`

#### Phase 2: v1 ProgressMe AsyncAPI + JSON Schema & Neutral Domain Model
* **Status:** `IMPLEMENTING` (adapter + use cases built, dry-run mode)
* **Deliverables:*
  * v1 ProgressMe AsyncAPI 3.0 specification — 28+ operations.
  * JSON Schema (draft 2020-12) for all distinct request payload shapes.
  * ProgressMe capability map (machine-readable).
  * Contract status authority (`docs/core/PROGRESSME_STATUS.md`).
  * Neutral domain model with factory functions.
  * Envelope builder for the canonical ProgressMe WebSocket request envelope.
  * WebSocketClient (infrastructure) — dry-run + real mode.
  * ProgressMeAdapter — full domain ↔ ProgressMe mapping.
  * Application use cases — importBook, exportBook, createLesson, createExercise.
  * 252 tests, 0 failures (unit + contract + negative).
  * Feature `FEAT-001: progressme-v1-contract` — gate at `build-ready`.
* **Remaining for integration-ready:*
  * Integration tests with mock WebSocket server.
  * Real-mode connection test (needs `ws` package + valid credentials).
  * Inbound response body typing (needs captures).

#### Phase 3: v2 Contract with Correlated Inbound Captures & Course-Upsert Discovery
* **Status:** `PLANNED` (Next Phase)

---

## Active Feature Gate Status

| Feature / Component | Active Lifecycle Gate | Status / Next Step |
|---|---|---|
| Project Governance & Process Docs | `complete` | Scaffolded and verified. |
| FEAT-001: progressme-v1-contract | `build-ready` | All 252 tests passing. Ready for integration tests + captures. |
| Infrastructure: WebSocketClient | `implemented` | Dry-run mode complete. Real mode needs `ws` package. |
| Adapter: ProgressMeAdapter | `implemented` | All operations mapped. Response mappers are best-effort (untyped bodies). |
| Application: Use Cases | `implemented` | importBook, exportBook, createLesson, createExercise all working in dry-run. |
| ProgressMe v2 Contract & Inbound Sync | `scoped` | Paused — needs captures. |

---

## Active Blockers

1. **Missing Inbound Captures:** Cannot type response bodies or validate response mappers.
2. **Missing WebSocket Path:** Real-mode connection cannot be tested.
3. **Missing Course-Upsert Message:** from-zero book importer cannot create courses.
4. **`ws` package not installed:** Real-mode WebSocket connection requires `npm install ws`.

---

## Immediate Next Steps

1. Write integration tests using a mock WebSocket server (no real connection needed).
2. Install `ws` package for real-mode testing.
3. Acquire captured network traces (WebSocket path, inbound messages, course-upsert payload).
4. Advance FEAT-001 to `integration-tested` once integration tests pass.
