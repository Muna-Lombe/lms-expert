# Feature Lifecycle Process

## Overview

This document defines the mandatory, gated feature lifecycle for the contract-first LMS authoring integration project. Every feature or integration capability follows a strict sequence of quality gates to ensure architectural integrity, contract compliance, full traceability, and maintainability.

---

## Lifecycle Gate Sequence

Features progress strictly through the following sequential gates:

```
[ drafted ] ──> [ scoped ] ──> [ designed ] ──> [ reviewed ] ──> [ build-ready ] ──> [ implementing ] ──> [ verifying ] ──> [ complete ]
```

---

## Gate Definitions & Entry Criteria

### 1. `drafted`
* **Description:** Initial capture of feature concept, integration need, or business outcome.
* **Entry Criteria:**
  * High-level feature intent and business objective documented.
  * Unique feature identifier/slug established (e.g., `course-sync`, `progressme-adapter`).

### 2. `scoped`
* **Description:** Scope definition, domain boundary mapping, and requirement listing.
* **Entry Criteria:**
  * A feature directory must exist at `features/<feature-name>/`, initialized by copying `features/_template/`.
  * Requirements defined with stable IDs (`REQ-<FEATURE>-<NNN>`).
  * In-scope and out-of-scope boundaries clearly documented.
  * Feature change classification evaluated (Major vs. Lightweight fix).

### 3. `designed`
* **Description:** Technical specification, contract definitions (AsyncAPI/JSON Schema), neutral domain models, and adapter blueprints.
* **Entry Criteria:**
  * Technical design document created in `features/<feature-name>/spec.md`.
  * Proposed AsyncAPI / JSON Schema schemas written or updated.
  * Domain model mapping and transformation logic documented.
  * Initial traceability matrix created mapping requirements to design components.

### 4. `reviewed`
* **Description:** Formal peer, architectural, and contract verification review.
* **Entry Criteria:**
  * Design review conducted by maintainers/architects.
  * Review feedback incorporated and signed off.
  * Schema validation and contract compatibility checks pass without breaking changes or undocumented deprecations.

### 5. `build-ready`
* **Description:** Specification and contract freeze; readiness for code execution.
* **Entry Criteria:**
  * Design review must pass before entering `build-ready`.
  * All tasks broken down and mapped to requirement IDs (`REQ-<FEATURE>-<NNN>`).
  * Test plan established with explicit test cases mapped to requirements.
  * **Strict Policy:** No implementation or contract code changes may start before reaching `build-ready`.

### 6. `implementing`
* **Description:** Code implementation of domain models, adapters, schema validators, and test suites.
* **Entry Criteria:**
  * Gate `build-ready` fully achieved and recorded in `docs/plans/NOW.md`.
  * Feature implementation branch created.

### 7. `verifying`
* **Description:** Verification against contract specifications, automated testing, and evidence collection.
* **Entry Criteria:**
  * Code implementation complete.
  * Unit, integration, and contract validation tests executed.
  * Capture evidence gathered backing all outbound and inbound schema validations.

### 8. `complete`
* **Description:** Final sign-off, documentation freeze, and release preparation.
* **Entry Criteria:**
  * All automated tests pass (100% green).
  * Contract schema updated and validated against captures/fixtures.
  * Documentation updated across `docs/` and feature directory.
  * Traceability matrix fully populated with requirement-to-evidence references.
  * `CHANGELOG.md` updated with release entries.
  * `RELEASE.md` written detailing deployment notes, breaking changes, and migration steps.

---

## Feature Scope & Classification Rules

To prevent process overhead on minor updates while enforcing rigor on domain changes:

* **Major Changes (Full Gate Lifecycle Mandatory):**
  Any change touching:
  * API contracts (AsyncAPI, JSON Schema, OpenAPI)
  * Neutral domain models or core entities
  * Security boundaries, authentication, or authorization logic
  * Data persistence schemas, migrations, or adapter protocols
  Must pass all 8 gates sequentially. Skipping gates or implementing code prior to `build-ready` is prohibited.

* **Lightweight Fixes:**
  Isolated non-functional updates (e.g., comment fixes, internal non-breaking refactors, test utility additions) may use lightweight task tracking, but must still satisfy automated test verification and definition of done criteria.
