# Contributing

All substantial work follows the gated feature lifecycle.

1. Copy `features/_template/` to `features/<feature-slug>/`.
2. Assign the feature ID and requirement IDs.
3. Attach evidence and declare confidence.
4. Complete design and contract review.
5. Write the test plan and implementation plan.
6. Break the work into traceable tasks.
7. Implement behind the adapter and application boundaries.
8. Run all required verification.
9. Complete release notes and update project documentation.

Do not open implementation work for a feature whose `feature.yaml` gate is
earlier than `build-ready`.

Small fixes may use a lightweight task, but any change to external contracts,
domain boundaries, security behavior or persistence is a major change.

