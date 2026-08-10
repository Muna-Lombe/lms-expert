# Tests

Test layers for the LMS authoring integration project:

| Layer | Purpose | Location |
|---|---|---|
| Unit | Domain model and application logic — pure functions, no I/O | `tests/unit/` |
| Contract | AsyncAPI and JSON Schema validation against fixtures | `tests/contract/` |
| Integration | Adapter + WebSocket client against sanitized fixtures | `tests/integration/` |
| End-to-end | Full import/export flows (dry-run mode by default) | `tests/e2e/` |

Tests are not yet implemented — they will be created per feature as gates pass.
Each test should reference the requirement IDs it verifies (see TRACEABILITY.md).
