# Test Plan: <Feature Title>

## Unit tests
- Test individual functions, validation logic, data transformations, and domain models.
- Mock external dependencies and adapters.
- Key test scenarios:
  - [ ] Scenario 1
  - [ ] Scenario 2

## Contract tests
- Verify that request and response payloads comply with `CONTRACT.md` schemas.
- Validate HTTP endpoints and WebSocket message schemas.
- Verify adapter interface adherence to contract specifications.

## Integration tests
- Verify interaction between domain modules, database operations, and adapter layers.
- Test end-to-end flow from authoring request to adapter execution.
- Integration test scenarios:
  - [ ] Scenario 1
  - [ ] Scenario 2

## Negative tests
- **Validation**: Invalid input payloads, missing required fields, type mismatches, out-of-range values.
- **Auth**: Missing tokens, invalid tokens, expired credentials, insufficient permissions.
- **Missing resources**: Non-existent resource IDs, stale references, missing adapter configurations.
- **Adapter failures**: Upstream timeout, LMS rate limits, network disconnects.

## Fixtures needed
- Sample domain objects (courses, lessons, modules)
- Sample LMS adapter response payloads (e.g., `progressme` mock responses)
- Test auth tokens and identity context fixtures

## Coverage targets
- **Line Coverage**: ≥ 85%
- **Branch Coverage**: ≥ 80%
- **Contract Schema Coverage**: 100% of defined operations and error codes
