# Technology Stack & Technical Decisions

## Core Technologies

### 1. Runtime: Node.js 20+ (ES Modules)
- **Choice**: Node.js v20 LTS or higher, using native ES modules (`"type": "module"` in `package.json`).
- **Rationale**: Node.js 20 provides modern asynchronous runtime features, native Fetch API, and standard ES module support. ESM aligns with modern JavaScript standards and ecosystem packages.

### 2. Schema Validation: JSON Schema
- **Choice**: JSON Schema (Draft 2020-12 / Draft-07) for entity validation and runtime contract enforcement.
- **Rationale**: Declarative, standard format for validating neutral domain entities and vendor API payloads. Facilitates contract-first development and automated testing without tying validation to runtime code dependencies.

### 3. WebSocket Specification: AsyncAPI 3.0
- **Choice**: AsyncAPI 3.0 for modeling event-driven and WebSocket RPC protocols (e.g., ProgressMe private WebSocket protocol).
- **Rationale**: AsyncAPI 3.0 is the industry standard for documenting and validating event-driven architectures, channel definitions, and frame payload schemas.

### 4. HTTP API Specification: OpenAPI 3.x
- **Choice**: OpenAPI 3.x for defining any REST/HTTP API endpoints.
- **Rationale**: Standard specification format for HTTP interfaces, ensuring consistent contract definitions, mock generation, and client documentation.

### 5. Build System & Framework Strategy: Framework-Agnostic First
- **Choice**: No runtime application framework (e.g., NestJS, Express, Fastify) or heavy build step (e.g., Babel/Webpack) is chosen at this stage. Pure Node.js scripts with standard `npm` scripts are used for validation and execution.
- **Rationale**: Defining clean domain boundaries, pure adapter interfaces, and contract definitions first ensures the architecture remains modular and reusable. Framework decisions can be made later without refactoring core logic or adapter implementations.

## Development & Validation Scripts
- `npm run validate:contracts`: Validates AsyncAPI and OpenAPI specifications against JSON Schema standards.
- `npm run test`: Executes unit and contract integration tests.
