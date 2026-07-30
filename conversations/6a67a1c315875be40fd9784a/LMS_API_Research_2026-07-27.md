# Tutor-focused LMS authoring APIs

Research date: 2026-07-27; ProgressMe private WebSocket update: 2026-07-28  
Scope: 40 high-signal tutor, language-teaching, AI lesson-authoring, interactive-content, creator-course, institutional, and enterprise platforms. “All” means a broad market scan of relevant platforms—not every LMS product in existence.

## Executive answer

Only a small group currently has a public, documented path that can be treated as a programmable “book” pipeline:

1. **ClassIn** — strongest language-school match: course → unit → activity plus Cloud Drive upload.
2. **Canvas** — strongest institutional REST model: course → module → page/file.
3. **Tutor LMS Pro** — strong self-hosted WordPress option: course → topic → lesson plus Media API.
4. **LifterLMS** — strong self-hosted WordPress option with an OpenAPI-backed course → section → lesson API.
5. **LearnDash** — viable WordPress option; use the installed site's runtime/OpenAPI description because versions and add-ons alter schemas.
6. **Moodle** — course creation and file upload are public, but core web services do **not** provide a complete native Book/activity authoring workflow. Add a custom external function/plugin.

ProgressMe publishes an official Swagger UI. In addition, user-supplied first-party browser captures now verify a separate private WebSocket RPC surface for creating/updating books, lessons and exercises and for copying/sharing materials. This observed protocol is not a public, supported API; its exact WebSocket path and inbound response bodies still need capture. Off2Class, Diffit and Twee expose authoring through their products, but no public developer contract for creating/importing books was found.

## What “book” maps to

| Platform | Practical book model | Upload strategy |
|---|---|---|
| ProgressMe | Book → Course → Lesson → LessonSection → Exercise | Captured messages create the hierarchy; no binary/package upload or course-upsert message was supplied |
| ClassIn | Course → Unit → Resource/Recorded Lesson activity | Upload to Cloud Drive, then create/move/release LMS activities |
| Canvas | Course → Module → Page or File module item | Initialize Canvas upload, send binary to returned upload URL, attach returned File |
| Tutor LMS Pro | Course → Topic → Lesson | Upload through WordPress Media; pass media IDs in lesson attachments |
| LifterLMS | Course → Section → Lesson | Upload through WordPress Media; reference media in lesson content |
| LearnDash | Course → Lesson → Topic | Upload through WordPress Media; use returned media URL/ID |
| Moodle | Course → Section → activity/resource | Upload with `core_files_upload`; custom service required to create a Book |
| SCORM Cloud | Imported SCORM/xAPI/cmi5 package | Package ZIP import rather than native lesson CRUD |

## Exact write operations and CRUD body shapes

### ProgressMe private WebSocket RPC

The observed request envelope is:

```json
{
  "Controller": "BookWsController",
  "Method": "BookUpsert",
  "ProjectName": "Books",
  "RequestId": "GENERATE-A-NEW-UUID",
  "Value": "{\"Id\":null,\"Name\":\"B1 English Progress Programme\"}"
}
```

Verified outbound operations include book upsert/read/list/copy, course lookup, lesson upsert/read/list, exercise save/load, tags, sharing permissions, and book-access checks. The supplied frames did not include inbound responses, a course-upsert message, or a binary/package upload message. The package therefore uses AsyncAPI 3.0 plus JSON Schema and leaves response bodies explicitly untyped until correlated inbound frames are captured. See `ProgressMe_WebSocket_Guide.md`.

### ClassIn

- Create course: `POST https://api.eeo.cn/partner/api/course.api.php?action=addCourse` (form data).
- Update course: `POST ...?action=editCourse`.
- Delete/end course: `POST ...?action=endCourse`.
- Upload file: `POST https://api.eeo.cn/partner/api/cloud.api.php?action=uploadFile` (multipart, `Filedata`, maximum documented size 500 MB).
- Rename/delete file: `POST ...?action=renameFile` / `...action=deleteFile`.
- Unit CRUD: `POST /lms/unit/create`, `/lms/unit/update`, `/lms/unit/delete`.
- Non-classroom activity create: `POST /lms/activity/createActivityNoClass`; activity types include Assignment, Test, Recorded Lesson, Resources, Discussion, Answer Sheet and Recurring Assignment.

Legacy partner responses:

```json
{"data": 352861, "error_info": {"errno": 1, "error": "程序正常执行"}}
```

LMS responses:

```json
{"code": 1, "msg": "Execution successful", "data": {"unitId": 26020895, "name": "Unit name"}}
```

### Canvas

- Create/update/delete courses under `/api/v1/accounts/{account_id}/courses` and `/api/v1/courses/{course_id}`.
- Module CRUD under `/api/v1/courses/{course_id}/modules`.
- Page CRUD under `/api/v1/courses/{course_id}/pages`.
- File upload is a documented multi-step flow: initialize the upload, POST the binary to the returned `upload_url` with `upload_params`, then use the returned File in a module item.

Create/read/update responses are the resource object (Course, Module, Page or File). Collection reads are arrays and use link-header pagination. Delete response varies by resource; the supplied OpenAPI subset records only the structures supported by the linked official resource docs.

### Tutor LMS Pro

- Course CRUD: `/wp-json/tutor/v1/courses[/{course_id}]`.
- Topic CRUD: `/wp-json/tutor/v1/topics[/{topic_id}]`.
- Lesson CRUD: `/wp-json/tutor/v1/lessons[/{lesson_id}]`.
- Upload: `POST /wp-json/wp/v2/media`; use returned media IDs as `attachments` or `thumbnail_id`.

The vendor documents request fields but does not publish one fixed response example for every operation. Use `OPTIONS` on the installed route as the runtime authority. WordPress errors use:

```json
{"code": "rest_error_code", "message": "Human-readable message", "data": {"status": 400}}
```

### LifterLMS and LearnDash

Both use WordPress REST conventions. LifterLMS exposes courses, sections and lessons under `/wp-json/llms/v1`; LearnDash exposes courses, lessons and topics under `/wp-json/ldlms/v2`. Media upload is `/wp-json/wp/v2/media`. Successful writes return the created/updated resource. Errors use the WordPress error body above. Download the instance's schema/REST index before implementation because plugins, versions and custom fields change the exact object.

### Moodle

- Create/update/delete course functions: `core_course_create_courses`, `core_course_update_courses`, `core_course_delete_courses`.
- Upload file: `core_files_upload`.
- Typical web-service errors:

```json
{"exception": "moodle_exception", "errorcode": "invalidparameter", "message": "...", "debuginfo": "..."}
```

Core Moodle exposes no complete external function for creating a native `mod_book` instance and its chapters. A custom external service should accept the desired book structure, call Moodle's module APIs server-side, and return stable IDs.

## Platform matrix

Status vocabulary:

- `verified-content-write`: checked official authoring operations.
- `verified-runtime-openapi`: documented write API whose exact schema should be fetched from the installed instance.
- `partial/admin/partner`: API exists, but a complete native book pipeline was not verified.
- `no-public-authoring-api-found`: do not build against undocumented traffic.

| Platform | Segment | Evidence status | Course | Lesson/unit | Book/package upload | Official source |
|---|---|---:|---:|---:|---:|---|
| ProgressMe | Language tutoring LMS | observed-private-websocket-authoring | not-captured (book create observed) | observed-private | not-captured | [official](https://progressme.ru/school-api/swagger/index.html) |
| Off2Class | ELT curriculum and LMS | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.off2class.com/) |
| Diffit | AI differentiated resources | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://web.diffit.me/) |
| Twee | AI ELT lesson authoring | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://twee.com/) |
| Edvibe | Language tutoring LMS | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://edvibe.com/) |
| LearnCube | Online language school platform | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.learncube.com/) |
| ClassIn | Classroom and LMS | verified-content-write | yes | yes | yes | [official](https://docs.eeo.cn/api/en/) |
| Lessonspace | Virtual classroom | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.thelessonspace.com/) |
| TutorBird | Tutor business LMS | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.tutorbird.com/) |
| Koala Go | Online tutoring classroom | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.koala-go.com/) |
| YourAgora | ELT lesson platform | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.youragora.com/) |
| Curipod | AI interactive lessons | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://curipod.com/) |
| Brisk Teaching | AI teaching tools | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.briskteaching.com/) |
| MagicSchool | AI teaching tools | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.magicschool.ai/) |
| Eduaide.Ai | AI teaching tools | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.eduaide.ai/) |
| LessonPlans.ai | AI lesson planning | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.lessonplans.ai/) |
| Nearpod | Interactive lessons | partner-or-undocumented | unknown | unknown | unknown | [official](https://nearpod.com/) |
| Pear Deck Learning | Interactive lessons | partner-or-undocumented | unknown | unknown | unknown | [official](https://www.peardeck.com/) |
| BookWidgets | Interactive exercises | partner-or-undocumented | unknown | unknown | unknown | [official](https://www.bookwidgets.com/) |
| LessonUp | Interactive lessons | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.lessonup.com/) |
| Genially | Interactive content authoring | partner-or-undocumented | unknown | unknown | unknown | [official](https://genially.com/) |
| Canva for Education | Content authoring | partner-or-undocumented | unknown | unknown | unknown | [official](https://www.canva.com/education/) |
| Canvas LMS | Institutional LMS | verified-content-write | yes | yes | yes | [official](https://developerdocs.instructure.com/services/canvas) |
| Moodle | Open-source LMS | partial-content-write | yes | partial | partial | [official](https://moodledev.io/docs/5.0/apis/subsystems/external) |
| Google Classroom | Classroom LMS | partial-content-write | yes | partial | partial | [official](https://developers.google.com/classroom/reference/rest) |
| Thinkific | Course platform | admin-api-content-write-unverified | yes | unverified | unverified | [official](https://developers.thinkific.com/api/api-documentation/) |
| Teachable | Course platform | admin-api-content-write-limited | yes | limited | limited | [official](https://docs.teachable.com/) |
| Kajabi | Course and marketing platform | partner-or-undocumented | unknown | unknown | unknown | [official](https://developers.kajabi.com/) |
| LearnWorlds | Course platform | admin-api-content-write-limited | yes | limited | limited | [official](https://www.learnworlds.dev/docs/api/) |
| Podia | Creator course platform | no-public-authoring-api-found | no-public-contract | no-public-contract | no-public-contract | [official](https://www.podia.com/) |
| LearnDash | WordPress LMS | verified-runtime-openapi | yes | yes | yes | [official](https://developers.learndash.com/learndash-rest-api-ldlms-v2/) |
| Tutor LMS Pro | WordPress LMS | verified-content-write | yes | yes | yes | [official](https://docs.themeum.com/tutor-lms/developer-documentation/rest-apis-for-tutor-lms-pro/) |
| LifterLMS | WordPress LMS | verified-content-write | yes | yes | yes | [official](https://developer.lifterlms.com/rest-api/) |
| TalentLMS | Business LMS | admin-api-content-write-limited | yes | limited | limited | [official](https://help.talentlms.com/hc/en-us/articles/24874457011356-TalentLMS-API-V2) |
| 360Learning | Collaborative LMS | admin-api-content-write-limited | yes | limited | limited | [official](https://360learning.readme.io/docs/introduction) |
| Docebo | Enterprise LMS | tenant-api-browser | tenant-dependent | tenant-dependent | tenant-dependent | [official](https://developer.docebo.com/docs/api-general-information) |
| Absorb LMS | Enterprise LMS | partner-or-licensed-api | account-dependent | account-dependent | account-dependent | [official](https://docs.myabsorb.com/) |
| Open edX | Open-source LMS | plugin-or-internal-authoring-api | deployment-dependent | deployment-dependent | deployment-dependent | [official](https://docs.openedx.org/) |
| H5P | Interactive content format | format-and-integration-api | no | package | host-dependent | [official](https://h5p.org/documentation/for-developers) |
| SCORM Cloud | Standards content delivery | verified-package-import | no | package | yes | [official](https://cloud.scorm.com/docs/api/) |

## Recommended integration architecture

Use one internal neutral model:

```
Book { title, description, language, level, cover, units[] }
Unit { title, position, lessons[] }
Lesson { title, html, assets[], activities[], duration, publish_state }
Asset { filename, mime_type, bytes_or_url, checksum }
```

Then write target adapters. Upload assets first, store returned IDs, create the hierarchy, attach assets, publish last, and keep an idempotency map `internal_id → vendor_id`. This is safer than making one platform's terminology your canonical data model.

Recommended order for a real implementation:

1. ClassIn adapter for a hosted language-school workflow.
2. Tutor LMS Pro or LifterLMS adapter when owning the LMS and API surface matters.
3. Canvas adapter for institutional customers.
4. A ProgressMe adapter only after capturing the missing course/section creation and correlated response frames, then confirming the private protocol is permitted for the intended account.

## Files in this package

- `openapi/`: implementation-oriented OpenAPI 3.1 subsets for the six actionable/partial targets.
- `asyncapi/progressme.websocket.asyncapi.yaml`: observed ProgressMe WebSocket channel and correlation contract.
- `ProgressMe_WebSocket_Guide.md`: merged, sanitized message guide and capture gaps.
- `schemas/platforms/`: one capability JSON document per platform, including evidence status and integration decision.
- `schemas/progressme.websocket.schema.json`: normalized per-message request and decoded-`Value` schemas.
- `schemas/platform-capability.schema.json`: validator for those capability documents.
- `platform-catalog.json`: machine-readable inventory.
- `sources.md`: official primary sources and evidence notes.

## Important limitations

- APIs, plan entitlements, and schemas change. Re-download runtime Swagger/OpenAPI before production.
- The ProgressMe WebSocket protocol is private, version-sensitive and unsupported by the public Swagger; confirm permission before production automation.
- “No public API found” does not prove a private or partner API does not exist.
- The supplied OpenAPI files are deliberately scoped to authoring/upload workflows; they are not replacements for vendor full specifications.
- Authentication secrets, tenant URLs, rate limits and plan permissions must be supplied by each account.
