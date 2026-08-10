# Contract Policy & Precedence

## Specification Standards
- **WebSocket Protocols**: Documented using **AsyncAPI 3.0** (e.g., `progressme.websocket.asyncapi.yaml`).
- **HTTP APIs**: Documented using **OpenAPI 3.x**.
- **Shared Schemas**: Defined in reusable **JSON Schema** files.

## Core Rules

1. **Contracts Precede Implementation**:
   All message types, entity structures, and endpoint definitions must be fully specified in AsyncAPI, OpenAPI, or JSON Schema prior to writing adapter or application logic.

2. **Backward Compatibility & Evolution**:
   Backward-incompatible modifications to contracts require an Architecture Decision Record (ADR) and a semantic version bump.

3. **Strict Validation & No Invented Schemas**:
   Unknown or unconfirmed vendor fields must stay unmodeled/unknown until verified by evidence. Never invent or speculate on vendor schema fields without physical network captures.

4. **Response Payload Flexibility (`additionalProperties: true`)**:
   Because private APIs may include auxiliary metadata or unannounced response fields, inbound response schemas must specify `additionalProperties: true` until correlated inbound captures exist. Outbound request payloads must remain strictly specified.

## Source-of-Truth Precedence
When resolving contract discrepancies or design ambiguities, precedence is assigned in the following strict order (aligned with `AGENTS.md` guidelines):

1. **Raw Evidence & Network Captures**: Sanitized HAR files, WebSocket frame logs, and recorded protocol traces.
2. **Formal Contract Specifications**: AsyncAPI / OpenAPI specifications and JSON Schemas in `contracts/`.
3. **Domain Documentation**: Domain model and architecture definitions in `docs/core/`.
4. **Adapter Code Implementation**: Source code implementations inside `src/adapters/`.
