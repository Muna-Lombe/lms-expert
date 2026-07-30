# Definition of Done (DoD)

## Overview

This document defines the mandatory Definition of Done (DoD) for all features, contracts, domain models, and adapter integrations in the contract-first LMS authoring integration project. A feature is considered complete and ready for release only when every condition below is satisfied and verified.

---

## Complete Definition of Done Criteria

A feature is considered **DONE** when all of the following requirements are met:

1. **Lifecycle Gates Complete:**
   * All 8 lifecycle gates (`drafted` → `scoped` → `designed` → `reviewed` → `build-ready` → `implementing` → `verifying` → `complete`) have been passed in order without skipping.

2. **Automated Test Execution & Quality:**
   * All unit tests, domain mapper tests, adapter suite tests, and contract schema validation tests pass with a 100% success rate.
   * Zero regressions introduced to existing integration endpoints or domain models.

3. **Contract Updated & Validated:**
   * AsyncAPI, OpenAPI, and JSON Schema specifications are fully updated to reflect implementation.
   * Contracts pass strict linting and schema validation against captured production network traffic or empirical fixture payloads.

4. **Documentation Updated:**
   * Feature specification files within `features/<feature-name>/` updated.
   * Architecture diagrams, schema references, and code-level type annotations/docstrings completed.

5. **Traceability Matrix Complete:**
   * Every requirement (`REQ-<FEATURE>-<NNN>`) is mapped to corresponding tasks, automated tests, and backing capture evidence in the feature's traceability matrix.
   * All requirement statuses marked as complete and verified.

6. **CHANGELOG Updated:**
   * `CHANGELOG.md` updated with entry summarizing added features, contract modifications, bug fixes, or deprecations.

7. **RELEASE.md Written:**
   * `RELEASE.md` authored detailing release highlights, breaking changes (if applicable), migration steps, schema version compatibility, and deployment guidelines.

---

## Reusable Definition of Done Checklist Format

Include this checklist in pull requests and feature completion records:

```markdown
## Feature Completion Checklist: [Feature Name / ID]

- [ ] **Gate Sequence:** Passed all gates: `drafted` → `scoped` → `designed` → `reviewed` → `build-ready` → `implementing` → `verifying` → `complete`.
- [ ] **Contract & Schema:** AsyncAPI / JSON Schema contracts updated, linted, and validated against empirical captures.
- [ ] **Automated Testing:** All unit, integration, and contract validation tests passing (100% pass rate).
- [ ] **Domain Model:** Neutral domain models and adapter transformations implemented and verified.
- [ ] **Traceability Matrix:** Traceability matrix fully populated with `REQ-<FEATURE>-<NNN>` IDs, tasks, test references, and backing evidence.
- [ ] **Documentation:** `docs/` and `features/<feature-name>/` documentation updated.
- [ ] **CHANGELOG:** `CHANGELOG.md` updated with release summary.
- [ ] **RELEASE.md:** `RELEASE.md` authored with deployment and compatibility instructions.
- [ ] **NOW.md Update:** Active status in `docs/plans/NOW.md` updated to reflect completion.
```
