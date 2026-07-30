# LMS authoring integration project

This repository turns the existing LMS API research into a contract-first
integration platform. The first deep adapter is ProgressMe/Edvibe; the neutral
domain and adapter boundaries are intended to support additional LMS targets.

## Start here

Every major change begins with the mandatory reading order in
[AGENTS.md](AGENTS.md). The short version is:

1. [Project charter](docs/core/PROJECT.md)
2. [Architecture](docs/core/ARCHITECTURE.md)
3. [Domain model](docs/core/DOMAIN_MODEL.md)
4. [Contract policy](docs/core/CONTRACTS.md)
5. [Feature lifecycle](docs/process/FEATURE_LIFECYCLE.md)
6. [Current plan](docs/plans/NOW.md)

## Repository map

| Path | Purpose |
|---|---|
| `docs/core/` | Mandatory project truths and engineering constraints |
| `docs/process/` | Feature lifecycle, gates, traceability and completion rules |
| `docs/plans/` | Roadmap and current execution plan |
| `features/` | One traceable workspace per major feature |
| `src/` | Domain, application, integration and infrastructure code |
| `tests/` | Unit, contract, integration and end-to-end verification |
| `asyncapi/` | WebSocket contracts |
| `openapi/` | HTTP contracts |
| `schemas/` | Shared and platform-specific JSON Schemas |
| `evidence/` | Sanitized observations and provenance records |
| `fixtures/` | Sanitized request/response test fixtures |
| `scripts/` | Validation and generation tools |
| `research/` | Market and historical research artifacts |

The original market report remains at
[LMS_API_Research_2026-07-27.md](LMS_API_Research_2026-07-27.md).

## Development rule

No major feature moves directly from an idea into implementation. It must pass
the feature gates defined in
[docs/process/FEATURE_LIFECYCLE.md](docs/process/FEATURE_LIFECYCLE.md).

Run the repository checks with:

```bash
npm run check
```

## Contract status

The current ProgressMe AsyncAPI and JSON Schema started as a research baseline.
New correlated captures now exceed those files. Until the v2 contract feature
is completed, use [docs/core/PROGRESSME_STATUS.md](docs/core/PROGRESSME_STATUS.md)
as the authority for what is confirmed, inferred or still missing.

