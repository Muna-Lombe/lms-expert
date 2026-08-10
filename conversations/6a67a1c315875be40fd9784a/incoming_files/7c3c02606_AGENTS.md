# Project rules for humans and coding agents

These rules apply to the entire repository. A nested `AGENTS.md` may add stricter
rules for its subtree but may not weaken these rules.

## Mandatory reading before major work

Read these files, in order, before designing or implementing any major feature:

1. `README.md`
2. `docs/core/PROJECT.md`
3. `docs/core/ARCHITECTURE.md`
4. `docs/core/DOMAIN_MODEL.md`
5. `docs/core/TECH_STACK.md`
6. `docs/core/CONTRACTS.md`
7. `docs/core/SECURITY.md`
8. `docs/process/FEATURE_LIFECYCLE.md`
9. `docs/process/TRACEABILITY.md`
10. `docs/process/DEFINITION_OF_DONE.md`
11. `docs/plans/NOW.md`
12. The feature directory under `features/<feature-slug>/`
13. Any ADRs, schemas and specifications referenced by that feature

For small, isolated fixes, read at minimum this file, `docs/plans/NOW.md`, the
affected contract or module documentation, and the relevant tests.

## Non-negotiable rules

- Major features must have a feature directory copied from
  `features/_template/`.
- Every feature requirement must have a stable requirement ID.
- Every external API claim must identify its evidence and confidence.
- Captured private APIs must never be described as official public contracts.
- Secrets, cookies, tokens, passwords, personal data and raw HAR files must not
  enter committed fixtures, logs, examples or documentation.
- The neutral domain model must not expose vendor terminology outside an
  adapter boundary.
- Contract changes precede implementation changes.
- Unknown fields remain unknown; do not invent a schema to make validation pass.
- Backward-incompatible contract changes require an ADR and a version change.
- Generated files must identify their source and must not be edited manually.
- A feature is not integrated until its tests, documentation, traceability and
  release notes are complete.

## Source-of-truth order

When sources disagree, use this precedence:

1. Correlated, sanitized request/response capture for the same deployed version
2. Official runtime OpenAPI/Swagger/AsyncAPI from the target account
3. Official vendor documentation
4. First-party frontend call-site structure
5. First-party endpoint registry
6. Inference from names or analogous operations

Record disagreements instead of silently choosing one.

## Required feature artifacts

A major feature may enter implementation only when it contains:

- `feature.yaml`
- `REQUIREMENTS.md`
- `DESIGN.md`
- `CONTRACT.md`
- `TEST_PLAN.md`
- `IMPLEMENTATION_PLAN.md`
- `TASKS.md`

It may be considered complete only after `RELEASE.md` is also finished.

## Change discipline

- Preserve unrelated work.
- Prefer small, reviewable changes.
- Validate schemas and specifications after editing them.
- Add or update fixtures for every observed protocol behavior.
- Include negative tests for validation, authorization and missing resources
  when the evidence exists.
- Update `docs/plans/NOW.md` when priorities or active gates change.
- Update `CHANGELOG.md` for user-visible or contract-visible changes.
