# Contract Specification: <Feature Title>

## Metadata
- **Version**: 1.0.0
- **Feature ID**: FEAT-NNN
- **Protocol**: HTTP | WebSocket

## Protocol Overview
Describe the network protocol used for this feature (HTTP REST, GraphQL, WebSocket messaging, or hybrid). Include connection details, headers, or frame structures where relevant.

## Operations

### Operation: <Operation Name>
- **Protocol Method**: `GET` | `POST` | `PUT` | `DELETE` | `WS Message Type`
- **Endpoint / Channel**: `/api/v1/...` or `ws://...`

#### Request Shape
```json
{
  "field": "string"
}
```

#### Response Shape
```json
{
  "status": "success",
  "data": {}
}
```

#### Error Cases
| Error Code | HTTP Status | Description | Action / Recovery |
| --- | --- | --- | --- |
| `INVALID_PAYLOAD` | 400 | Request payload fails schema validation | Client must fix request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token | Re-authenticate and retry |
| `ADAPTER_ERROR` | 502 | Upstream LMS adapter failed to execute operation | Retry with exponential backoff |

## Schema references
List schema files or definitions referenced by this contract (e.g., OpenAPI definitions, JSON Schema, Protobuf).

- `schemas/<entity>.json` - Schema for domain entity
- `schemas/events/<event>.json` - Schema for event payload

## Breaking changes
None (new feature specification).

## Version
1.0.0
