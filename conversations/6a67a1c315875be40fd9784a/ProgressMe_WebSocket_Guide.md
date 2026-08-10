# ProgressMe private WebSocket authoring guide

Research/capture normalization date: 2026-07-28

## Status

ProgressMe has two distinct integration surfaces:

1. An official School API with a public Swagger UI.
2. A private browser WebSocket RPC protocol used by the ProgressMe web application.

The second surface is what the supplied captures document. It can create and update books, lessons and exercises, but it is not a published or supported public API. Treat it as version-sensitive, test only with an authorized account, and confirm ProgressMe's terms before production automation.

## Sanitized connection model

```text
wss://progressme.ru/{captured-websocket-path}
  ?Page=TeacherProfile
  &isSharing=True
  &token={short-lived-session-token}

Cookie: {session-cookie}
```

The precise WebSocket path was not included in the capture. Tokens, cookies, passwords and authentication tokens must never be stored in source code or fixture files.

## Canonical request envelope

The user-focused capture is the canonical shape:

```json
{
  "Controller": "BookWsController",
  "Method": "GetBook",
  "ProjectName": "Books",
  "RequestId": "GENERATE-A-NEW-UUID",
  "Value": "{\"BookId\":801168}"
}
```

Rules:

- Preserve PascalCase property names.
- Always include `ProjectName`.
- Generate a unique UUID in `RequestId` for each call.
- `Value` is `JSON.stringify(payload)`, not a nested JSON object.
- Use `Value: "\"\""` only where the observed payload is an encoded empty string.
- Correlate responses using `RequestId`.

## Merged operation inventory

Where both captures contained the same message, the newer user-focused envelope and payload were retained. Books-only messages were normalized to the same envelope.

| Area | Controller.Method | Project | Capture status |
|---|---|---|---|
| Book | `BookWsController.GetBook` | Books | User-focused canonical |
| Book | `BookWsController.GetPersonalBooks` | Books | Books-only, normalized |
| Book | `BookWsController.BookUpsert` | Books | Merged create/update payload |
| Book | `BookWsController.CopyBook` | Books | User-focused canonical |
| Book | `BookWsController.SaveBookUserLastLogin` | Books | User-focused canonical |
| Book | `BookWsController.IsCanCopyMaterial` | Books | User-focused canonical |
| Book | `BookWsController.IsCanSharingMaterial` | Books | User-focused canonical |
| Book | `BookWsController.GetTeacherBuyiedBookIds` | Books | Books-only, normalized; server spelling preserved |
| Book | `BookWsController.GetCountPupilsUsedBooks` | Books | Books-only, normalized |
| Course | `CourseWsController.GetBookCourses` | Books | Books-only, normalized |
| Lesson | `LessonWsController.GetCourseLessons` | Books | Books-only, normalized |
| Lesson | `LessonWsController.LessonUpsert` | Books | Books-only, normalized |
| Lesson | `LessonWsController.GetLessonWithId` | Books | Books-only, normalized |
| Lesson | `LessonWsController.CheckIsOriginalLessonInMarathon` | Books | Books-only, normalized |
| Exercise | `ExerciseWsController.LoadExercisesInMaterial` | Books | Books-only, normalized |
| Exercise | `ExerciseWsController.SaveExercise` type 18 | Books | Word-fill/drag exercise |
| Exercise | `ExerciseWsController.SaveExercise` type 5 | Books | Test exercise |
| Tags | `MaterialTagsWsController.GetBookTags` | Books | User-focused canonical |
| Tags | `MaterialTagsWsController.GetBookLessonTags` | Books | Books-only, normalized |
| Sharing | `SharingMaterialWsController.GetSharingMaterial` | Books | Merged BookId/LessonId variants |
| Sharing | `SharingMaterialWsController.ToggleActiveHref` | Books | User-focused canonical |
| Sharing | `SharingMaterialWsController.GetIdMaterial` | Books | User-focused canonical |
| User | `AccountWsController.Login` | Users | User-focused; secrets redacted |
| User | `AccountWsController.GetCurrentUser` | Users | User-focused canonical |
| User | `UserWsController.GetSettingsSource` | Users | User-focused canonical |
| User | `LessonWsController.GetUsersInfoForBookAccessStatus` | MainWs | User-focused canonical |
| User | `UserWsController.GetIpInfo` | MainWs | User-focused canonical |
| User | `ProfileBlockController.GetPersonalProfile` | MainWs | User-focused canonical |

The following names appeared without request bodies and are not considered callable specifications yet: `GetSharedBook`, `CopySharedBook`, `CopyCopyrightProtectedBook`, `RemoveCopyrightProtectedFromBook`, and `GetUserInfoForBookAccess`.

## Book creation

`BookUpsert` is an upsert. The captures indicate `Id: null` creates and an existing `Id` updates.

```json
{
  "Controller": "BookWsController",
  "Method": "BookUpsert",
  "ProjectName": "Books",
  "RequestId": "0f0b9f19-80d2-48dd-9f75-9b20af8e6928",
  "Value": "{\"Id\":null,\"Name\":\"B1 English Progress Programme\",\"LanguageId\":1,\"Description\":\"Structured B1 programme\",\"IsEnableGroupingLessons\":true,\"IsEnableAccessBook\":false,\"Number\":-1,\"Tags\":{\"BookId\":0,\"TagAge\":[],\"TagLevel\":[],\"TagType\":[]},\"NoPhotoColor\":3,\"UserId\":null,\"UserRole\":null,\"SchoolId\":null,\"FolderId\":null}"
}
```

Update example:

```json
{
  "Controller": "BookWsController",
  "Method": "BookUpsert",
  "ProjectName": "Books",
  "RequestId": "bf8ec11f-1601-4d66-b052-18a92603eb5a",
  "Value": "{\"Id\":801168,\"Name\":\"B1 English Progress Programme v2\",\"IsEnableAccessBook\":true,\"IsProtectedCopyright\":false}"
}
```

## Lesson creation

The captured hierarchy is:

```text
Book → Course → Lesson → LessonSection → Exercise
```

Create a lesson using `Id: 0`:

```json
{
  "Controller": "LessonWsController",
  "Method": "LessonUpsert",
  "ProjectName": "Books",
  "RequestId": "f209f15a-8d06-4a2f-b34a-d7f71732df54",
  "Value": "{\"Id\":0,\"Name\":\"Unit 1\",\"CourseId\":10001,\"Text\":\"Introductions and goals\",\"Number\":1,\"Tags\":{\"LessonId\":0,\"TagAge\":[],\"TagLevel\":[],\"TagType\":[],\"TagSkills\":[],\"TagTime\":[],\"Vocabulary\":\"\",\"Grammar\":\"\",\"Functions\":\"\",\"Other\":\"\"},\"Data\":null,\"NoPhotoColor\":0}"
}
```

The captures do not include a course-create message, only `GetBookCourses`. A complete from-zero importer therefore still needs either:

- the missing course upsert message and response body;
- an existing default course created with the book; or
- a separate supported REST/partner operation.

## Exercise creation

Word-fill/drag exercise:

```json
{
  "Controller": "ExerciseWsController",
  "Method": "SaveExercise",
  "ProjectName": "Books",
  "RequestId": "5a17bf43-a4ac-4b60-b923-17f28a0ed944",
  "Value": "{\"Id\":0,\"Type\":18,\"PersonalMaterialId\":null,\"HomeworkLessonId\":null,\"Number\":0,\"IsShowExerciseNumber\":true,\"PasteWordByDrag\":{\"Text\":\"hello [friend<em class=\\\"hide-id-exercise-item\\\">##1707674657603##</em>] (someone).\"},\"Name\":\"Complete the sentence\",\"IsAutoCheck\":true,\"IsHidePupil\":false,\"LessonSectionId\":20001}"
}
```

Test exercise:

```json
{
  "Controller": "ExerciseWsController",
  "Method": "SaveExercise",
  "ProjectName": "Books",
  "RequestId": "c06d4395-a303-4943-ad28-73fac29afcda",
  "Value": "{\"Id\":0,\"Type\":5,\"PersonalMaterialId\":null,\"HomeworkLessonId\":null,\"Number\":2,\"IsShowExerciseNumber\":true,\"Test\":{\"IsEnabledTimer\":true,\"TimerDuration\":3,\"IsEnabledPoints\":false,\"Questions\":[{\"Id\":1707722834513,\"Points\":1,\"Question\":\"What is 1 + 1?\",\"Answers\":[\"2\",\"1\",\"3\"],\"QuestionAnswers\":[\"true\",\"\",\"\"]}]},\"Name\":\"Take the test\",\"IsAutoCheck\":true,\"IsHidePupil\":false,\"LessonSectionId\":20001}"
}
```

## Sharing and copying

Copy a book:

```json
{
  "Controller": "BookWsController",
  "Method": "CopyBook",
  "ProjectName": "Books",
  "RequestId": "b4351264-e9bd-4975-90b7-da377b68fa80",
  "Value": "{\"BookId\":801168,\"IsVisible\":true,\"IsProtectedCopyright\":true}"
}
```

Sharing configuration uses `SharingMaterialWsController.ToggleActiveHref`. The three booleans independently describe view, add, and protected-copy/add behavior. Do not label these combinations “cracking” or copyright removal in production code; use neutral permission names and act only on materials the account is authorized to modify.

## Authentication example

The login body is documented in the JSON Schema, but no real credentials are retained. Use environment variables or a secret manager:

```json
{
  "Controller": "AccountWsController",
  "Method": "Login",
  "ProjectName": "Users",
  "RequestId": "188f3a4b-0808-447b-beb5-a35165c993a5",
  "Value": "{\"Email\":\"${PROGRESSME_EMAIL}\",\"Password\":\"${PROGRESSME_PASSWORD}\",\"RememberMe\":true,\"UserRole\":4,\"AuthToken\":\"${PROGRESSME_AUTH_TOKEN}\",\"CurrentDomain\":\"progressme.ru\",\"AccountRole\":1}"
}
```

## CRUD response status

Request schemas are now detailed. Typed response bodies are **not** yet available because the supplied capture contains outbound messages only.

For the next capture, record the inbound frame paired to each `RequestId` for:

1. successful create/read/update/delete;
2. validation failure;
3. unauthenticated/expired session;
4. permission denial;
5. missing book, course, lesson, section, and exercise.

Until then, the AsyncAPI response payload remains `additionalProperties: true`; inventing a CRUD response envelope would make the specification unreliable.

## Included machine-readable files

- `asyncapi/progressme.websocket.asyncapi.yaml`
- `schemas/progressme.websocket.schema.json`
- `schemas/platforms/progressme.capability.json`

