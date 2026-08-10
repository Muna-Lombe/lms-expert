# ProgressMe contract status

This file is the authority for what is confirmed, inferred, or still missing
in the ProgressMe WebSocket contract. It supersedes the research baseline until
the v2 contract feature is completed.

## Confirmed (outbound request envelopes captured)

### Book operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Get book | `BookWsController.GetBook` | User-focused canonical |
| List personal books | `BookWsController.GetPersonalBooks` | Books-only, normalized |
| Create/update book | `BookWsController.BookUpsert` | Merged create/update payload |
| Copy book | `BookWsController.CopyBook` | User-focused canonical |
| Save user last login | `BookWsController.SaveBookUserLastLogin` | User-focused canonical |
| Check can copy | `BookWsController.IsCanCopyMaterial` | User-focused canonical |
| Check can share | `BookWsController.IsCanSharingMaterial` | User-focused canonical |
| Get teacher bought book IDs | `BookWsController.GetTeacherBuyiedBookIds` | Books-only, normalized |
| Get count of pupils using books | `BookWsController.GetCountPupilsUsedBooks` | Books-only, normalized |

### Course operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Get book courses | `CourseWsController.GetBookCourses` | Books-only, normalized |

### Lesson operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Get course lessons | `LessonWsController.GetCourseLessons` | Books-only, normalized |
| Create/update lesson | `LessonWsController.LessonUpsert` | Books-only, normalized |
| Get lesson by ID | `LessonWsController.GetLessonWithId` | Books-only, normalized |
| Check original lesson in marathon | `LessonWsController.CheckIsOriginalLessonInMarathon` | Books-only, normalized |

### Exercise operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Load exercises in material | `ExerciseWsController.LoadExercisesInMaterial` | Books-only, normalized |
| Save word-fill/drag exercise | `ExerciseWsController.SaveExercise` (type 18) | User-focused canonical |
| Save test exercise | `ExerciseWsController.SaveExercise` (type 5) | User-focused canonical |

### Tags operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Get book tags | `MaterialTagsWsController.GetBookTags` | User-focused canonical |
| Get book lesson tags | `MaterialTagsWsController.GetBookLessonTags` | Books-only, normalized |

### Sharing operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Get sharing material | `SharingMaterialWsController.GetSharingMaterial` | Merged BookId/LessonId variants |
| Toggle active href | `SharingMaterialWsController.ToggleActiveHref` | User-focused canonical |
| Get material ID | `SharingMaterialWsController.GetIdMaterial` | User-focused canonical |

### User operations

| Operation | Controller.Method | Capture status |
|---|---|---|
| Login | `AccountWsController.Login` | User-focused; secrets redacted |
| Get current user | `AccountWsController.GetCurrentUser` | User-focused canonical |
| Get settings source | `UserWsController.GetSettingsSource` | User-focused canonical |
| Get users info for book access | `LessonWsController.GetUsersInfoForBookAccessStatus` | User-focused canonical |
| Get IP info | `UserWsController.GetIpInfo` | User-focused canonical |
| Get personal profile | `ProfileBlockController.GetPersonalProfile` | User-focused canonical |

## Inferred

- `BookUpsert` with `Id: null` creates a new book; a non-null `Id` updates.
- `LessonUpsert` with `Id: 0` creates a new lesson; a non-zero `Id` updates.
- The hierarchy is Book → Course → Lesson → LessonSection → Exercise.
- `Value` is `JSON.stringify(payload)` — a string, not a nested object.
- `RequestId` correlates request/response pairs (generated UUID per call).

## Missing (not yet captured)

- **Inbound response bodies** — all response payloads are `additionalProperties: true` in the AsyncAPI spec until correlated inbound frames are captured.
- **WebSocket path** — the exact `wss://` path was not in the capture. The env.example uses `wss://proxy-a.edvibe.com/websocket` as a working assumption.
- **Course upsert message** — no course-create operation was captured. A from-zero importer needs either this message, a default course created with the book, or a separate REST/partner operation.
- **Binary/package upload** — no file upload operation was observed.
- **Delete operations** — no delete messages for books, lessons, or exercises were captured.
- **Uncalled operations** — `GetSharedBook`, `CopySharedBook`, `CopyCopyrightProtectedBook`, `RemoveCopyrightProtectedFromBook`, `GetUserInfoForBookAccess` appeared without request bodies and are not yet callable specifications.

## Next capture requirements

For the v2 contract feature, record the inbound frame paired to each `RequestId` for:

1. Successful create/read/update/delete
2. Validation failure
3. Unauthenticated/expired session
4. Permission denial
5. Missing book, course, lesson, section, and exercise
