# Design Document: ProgressMe v1 WebSocket Contract

## Overview
This feature formalizes the existing research baseline — the ProgressMe private WebSocket RPC protocol captured from sanitized first-party browser traffic — into a versioned, machine-readable contract (AsyncAPI 3.0 + JSON Schema) and a vendor-neutral domain model. The contract is the foundation for all subsequent adapter implementation work.

## Context
The repository already contains:
- `LMS_API_Research_2026-07-27.md` — market report covering 40 platforms.
- `ProgressMe_WebSocket_Guide.md` — normalized capture with 28+ operations.
- `platform-catalog.json` — machine-readable platform status.
- `asyncapi/progressme.websocket.asyncapi.yaml` — baseline AsyncAPI spec.
- `schemas/progressme.websocket.schema.json` — baseline JSON Schema.
- `schemas/platforms/progressme.capability.json` — capability map.
- `docs/core/PROGRESSME_STATUS.md` — contract status authority.
- `src/domain/` — neutral domain model with factory functions.

This feature gates those artifacts: it reviews, validates, and locks them as version 0.1.0 of the ProgressMe contract.

## Goals
- Validate the existing AsyncAPI spec covers all captured operations.
- Validate the JSON Schema covers all captured payload shapes.
- Confirm response bodies are correctly untyped (uncaptured).
- Confirm the capability map accurately reflects confirmed vs missing operations.
- Confirm the neutral domain model isolates vendor terminology.

## Non-goals
- Implementing the WebSocket client (infrastructure layer).
- Implementing the adapter methods (adapter layer).
- Capturing inbound response frames (separate capture task).
- Building the course-upsert or delete operations (not yet captured).

## Design decisions
1. **AsyncAPI 3.0 over OpenAPI**: The protocol is WebSocket RPC, not HTTP REST. AsyncAPI 3.0 natively models bidirectional message channels with request/response correlation.
2. **Response payloads as additionalProperties: true**: Inbound frames are not captured. Per AGENTS.md, we do not invent schemas. The GenericResponse message is explicitly untyped with a description explaining why.
3. **JSON Schema draft 2020-12**: Latest stable draft. Uses $defs for reusable definitions, $ref for composition (e.g., ExerciseCommonFields + type-specific schemas).
4. **Neutral domain model in src/domain/**: Factory functions (createBook, createLesson, etc.) with camelCase fields. The adapter layer (src/adapters/progressme/) maps between camelCase neutral fields and PascalCase ProgressMe fields.
5. **Capability map as JSON**: Machine-readable so tooling can query "can we create courses?" without parsing prose.

## Domain impact
- **Domain Entities Affected**: Book, Course, Lesson, LessonSection, Exercise.
- **Data Model Changes**: Establishes the initial neutral domain model. No changes to existing entities — this is the first version.
- **Business Logic Changes**: None — contract-only feature, no business logic implemented.

## Adapter impact
- **Target Adapters**: `progressme`
- **Adapter API Changes**: None — the adapter stub exists but all methods throw. This feature defines what the adapter will implement against.
- **Protocol / Mapping Strategy**: The adapter translates neutral camelCase domain objects → PascalCase ProgressMe payloads → JSON.stringify → WebSocket envelope. The envelope builder (`src/adapters/progressme/envelope.js`) handles the canonical envelope shape.

## Security considerations
- Login credentials must come from environment variables (PROGRESSME_EMAIL, PROGRESSME_PASSWORD, PROGRESSME_AUTH_TOKEN), never hardcoded.
- The .gitignore excludes .env, *.har, raw-captures/, and evidence/private/.
- The env.example uses placeholder values only.
- Tokens, cookies, and session data are never stored in fixtures or schema examples.

## Open questions
- [ ] Is the WebSocket path `/websocket` (from env.example) correct, or is it a different path on progressme.ru?
- [ ] Does a default course get created with a book, or must we capture a separate course-upsert message?
- [ ] Are there other exercise types beyond 18 and 5 that need schemas?

## Alternatives considered
### Alternative 1: Wait for inbound captures before publishing any contract
- **Description**: Delay the entire contract until response frames are captured.
- **Pros**: Complete request/response contract.
- **Cons**: Blocks all adapter development. The outbound-only contract is already useful for building and testing request construction.
- **Reason for rejection**: Outbound contracts enable adapter development and fixture-based testing now. Response typing is a separate, traceable gap.

### Alternative 2: Use OpenAPI 3.x with WebSocket extensions
- **Description**: Model the WebSocket protocol in OpenAPI using webhook callbacks.
- **Pros**: Single toolchain if other adapters use REST.
- **Cons**: OpenAPI was not designed for bidirectional messaging. Correlation by RequestId is awkward to express.
- **Reason for rejection**: AsyncAPI is the correct tool for WebSocket protocols.
