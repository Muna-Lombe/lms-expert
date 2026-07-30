# Architecture Overview

## Architectural Style: Hexagonal / Clean Architecture

The LMS integration platform follows a Hexagonal (Ports & Adapters) / Clean Architecture pattern. This design isolates the core domain and business logic from external systems, vendor-specific protocols, and delivery mechanisms.

```
+-----------------------------------------------------------------------------------+
|                                 APPLICATION LAYER                                 |
|                                                                                   |
|    +-------------------------------------------------------------------------+    |
|    |                             USE CASES                                   |    |
|    |      (e.g., SyncBookUseCase, PublishLessonUseCase, ImportCourse)       |    |
|    +------------------------------------+------------------------------------+    |
|                                         |                                         |
|                                         v                                         |
|    +-------------------------------------------------------------------------+    |
|    |                           DOMAIN CORE MODEL                             |    |
|    |   Book  --->  Course  --->  Lesson  --->  LessonSection  ---> Exercise   |    |
|    |                       (Neutral Canonical Entities)                      |    |
|    +------------------------------------+------------------------------------+    |
|                                         ^                                         |
+-----------------------------------------|-----------------------------------------+
                                          | Ports / Interfaces
                                          v
+-----------------------------------------------------------------------------------+
|                                  ADAPTER LAYER                                    |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                            ProgressMe Adapter                               |  |
|  |  - Maps Domain Entities <---> ProgressMe RPC Envelopes / Payloads           |  |
|  |  - Handles WebSocket connection lifecycle & frame serialization              |  |
|  +--------------------------------------+--------------------------------------+  |
|                                         |                                         |
+-----------------------------------------|-----------------------------------------+
                                          | Transport
                                          v
+-----------------------------------------------------------------------------------+
|                               INFRASTRUCTURE LAYER                                |
|                                                                                   |
|  +---------------------------+                 +-------------------------------+  |
|  |     WebSocket Client      |                 |      Session Management       |  |
|  |   (ws / Reconnecting Ws)  |                 |  (Auth Token / Cookie Store)  |  |
|  +---------------------------+                 +-------------------------------+  |
+-----------------------------------------------------------------------------------+
```

## Layer Responsibilities

### 1. Domain Core Layer
- Defines neutral canonical entities: `Book`, `Course`, `Lesson`, `LessonSection`, and `Exercise`.
- Encapsulates domain invariants, entity validation rules, and core business logic.
- **Strict Neutrality**: The neutral domain NEVER leaks vendor terminology (e.g., ProgressMe-specific concepts like `PersonalBook`, `Material`, or vendor RPC type IDs) outside of adapter boundaries.

### 2. Application Layer
- Implements application-specific use cases (e.g., content synchronization, book exports, course publishing).
- Orchestrates domain objects and calls output ports (adapter interfaces).
- Independent of network protocols, databases, or runtime frameworks.

### 3. Adapter Layer
- Translates neutral domain models to/from vendor-specific contract structures.
- For ProgressMe/Edvibe: Maps canonical `Book`/`Course`/`Lesson`/`Exercise` instances into vendor-specific WebSocket message payloads (e.g., `BookUpsert`, `LessonUpsert`, `SaveExercise`).
- Enforces AsyncAPI and JSON Schema contracts at the boundary.

### 4. Infrastructure Layer
- Low-level network transport, WebSocket clients, session persistence, and environment configuration.
- Handles retries, heartbeats, frame serialization, and raw token handling.
