# Contract Specification: ProgressMe v1 WebSocket Contract

## Metadata
- **Version**: 0.1.0
- **Feature ID**: FEAT-001
- **Protocol**: WebSocket RPC (bidirectional, request/response correlated by RequestId)

## Protocol Overview

ProgressMe uses a single bidirectional WebSocket channel for all operations. Every request uses the canonical envelope:

```json
{
  "Controller": "BookWsController",
  "Method": "BookUpsert",
  "ProjectName": "Books",
  "RequestId": "0f0b9f19-80d2-48dd-9f75-9b20af8e6928",
  "Value": "{\"Id\":null,\"Name\":\"B1 English Progress Programme\"}"
}
```

Rules:
- `Value` is `JSON.stringify(payload)` — always a string, never a nested object.
- `RequestId` is a fresh UUID per call, used to correlate responses.
- `ProjectName` is one of: `Books`, `Users`, `MainWs`.
- Use `Value: "\"\""` for empty payloads (encoded empty string).

Connection:
```
wss://{host}/{wsPath}?Page=TeacherProfile&isSharing=True&token={session-token}
```

The exact WebSocket path was not captured. The env.example uses `wss://proxy-a.edvibe.com/websocket`.

## Operations

### Book Operations (Controller: BookWsController, ProjectName: Books)

| Method | Description | Capture Status |
| --- | --- | --- |
| `GetBook` | Get a single book by ID | User-focused canonical |
| `GetPersonalBooks` | List the user's books | Books-only, normalized |
| `BookUpsert` | Create (Id:null) or update (Id:non-null) a book | Merged |
| `CopyBook` | Copy a book with visibility/copyright flags | User-focused canonical |
| `SaveBookUserLastLogin` | Record user's last login for a book | User-focused canonical |
| `IsCanCopyMaterial` | Check if material can be copied | User-focused canonical |
| `IsCanSharingMaterial` | Check if material can be shared | User-focused canonical |
| `GetTeacherBuyiedBookIds` | Get IDs of books the teacher bought | Books-only, normalized |
| `GetCountPupilsUsedBooks` | Count pupils using books | Books-only, normalized |

### Course Operations (Controller: CourseWsController, ProjectName: Books)

| Method | Description | Capture Status |
| --- | --- | --- |
| `GetBookCourses` | Get courses for a book | Books-only, normalized |

**Missing**: No course-upsert, update, or delete operation captured.

### Lesson Operations (Controller: LessonWsController, ProjectName: Books)

| Method | Description | Capture Status |
| --- | --- | --- |
| `GetCourseLessons` | List lessons in a course | Books-only, normalized |
| `LessonUpsert` | Create (Id:0) or update a lesson | Books-only, normalized |
| `GetLessonWithId` | Get a lesson by ID | Books-only, normalized |
| `CheckIsOriginalLessonInMarathon` | Check if lesson is original in marathon | Books-only, normalized |

**Missing**: No lesson delete operation captured.

### Exercise Operations (Controller: ExerciseWsController, ProjectName: Books)

| Method | Description | Capture Status |
| --- | --- | --- |
| `LoadExercisesInMaterial` | Load exercises for a material | Books-only, normalized |
| `SaveExercise` (type 18) | Save word-fill/drag exercise | User-focused canonical |
| `SaveExercise` (type 5) | Save test exercise | User-focused canonical |

**Missing**: No exercise delete operation captured. Other exercise types unknown.

### Tags Operations (Controller: MaterialTagsWsController, ProjectName: Books)

| Method | Description | Capture Status |
| --- | --- | --- |
| `GetBookTags` | Get tags for a book | User-focused canonical |
| `GetBookLessonTags` | Get tags for a book's lessons | Books-only, normalized |

### Sharing Operations (Controller: SharingMaterialWsController, ProjectName: Books)

| Method | Description | Capture Status |
| --- | --- | --- |
| `GetSharingMaterial` | Get sharing config for a material | Merged BookId/LessonId |
| `ToggleActiveHref` | Toggle sharing permissions | User-focused canonical |
| `GetIdMaterial` | Get material ID | User-focused canonical |

### User Operations

| Controller | Method | ProjectName | Capture Status |
| --- | --- | --- | --- |
| `AccountWsController` | `Login` | `Users` | User-focused; secrets redacted |
| `AccountWsController` | `GetCurrentUser` | `Users` | User-focused canonical |
| `UserWsController` | `GetSettingsSource` | `Users` | User-focused canonical |
| `LessonWsController` | `GetUsersInfoForBookAccessStatus` | `MainWs` | User-focused canonical |
| `UserWsController` | `GetIpInfo` | `MainWs` | User-focused canonical |
| `ProfileBlockController` | `GetPersonalProfile` | `MainWs` | User-focused canonical |

### Uncalled Operations (no request body captured)

`GetSharedBook`, `CopySharedBook`, `CopyCopyrightProtectedBook`, `RemoveCopyrightProtectedFromBook`, `GetUserInfoForBookAccess`

## Response Shape

**Not yet captured.** All inbound response bodies are `additionalProperties: true`. Responses are correlated by `RequestId`. Do not invent a response schema.

## Error Cases

**Not yet captured.** The following error scenarios need inbound frames:

| Scenario | Description |
| --- | --- |
| Validation failure | Invalid payload, missing required fields |
| Unauthenticated | Missing or expired session token |
| Permission denied | User lacks permission for the operation |
| Resource not found | Non-existent book, course, lesson, section, or exercise ID |

## Schema references

- `asyncapi/progressme.websocket.asyncapi.yaml` — AsyncAPI 3.0 specification
- `schemas/progressme.websocket.schema.json` — JSON Schema (draft 2020-12) for all payload types
- `schemas/platforms/progressme.capability.json` — Machine-readable capability map
- `docs/core/PROGRESSME_STATUS.md` — Contract status authority (confirmed/inferred/missing)

## Breaking changes
None — this is the first versioned contract (0.1.0).

## Version
0.1.0
