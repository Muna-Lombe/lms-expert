# Primary sources

Research checked 2026-07-27. These are the sources used for the actionable API contracts and the most important negative/limited findings.

## Actionable authoring APIs

- ClassIn API index: https://docs.eeo.cn/api/en/
- ClassIn create course: https://docs.eeo.cn/api/en/classroom/addCourse.html
- ClassIn edit course: https://docs.eeo.cn/api/en/classroom/editCourse.html
- ClassIn end course: https://docs.eeo.cn/api/en/classroom/endCourse.html
- ClassIn upload file: https://docs.eeo.cn/api/en/cloud/uploadFile.html
- ClassIn rename file: https://docs.eeo.cn/api/en/cloud/renameFile.html
- ClassIn create/update/delete unit: https://docs.eeo.cn/api/en/LMS/createUnit.html and adjacent Unit pages
- ClassIn create non-classroom activity: https://docs.eeo.cn/api/en/LMS/createActivityNoClass.html
- Canvas Courses: https://developerdocs.instructure.com/services/canvas/resources/courses
- Canvas Modules: https://developerdocs.instructure.com/services/canvas/resources/modules
- Canvas Pages: https://developerdocs.instructure.com/services/canvas/resources/pages
- Canvas file uploads: https://developerdocs.instructure.com/services/canvas/basics/file.file_uploads
- Tutor LMS Pro REST: https://docs.themeum.com/tutor-lms/developer-documentation/rest-apis-for-tutor-lms-pro/
- WordPress Media REST: https://developer.wordpress.org/rest-api/reference/media/
- LifterLMS REST: https://developer.lifterlms.com/rest-api/
- LifterLMS OpenAPI repository: https://github.com/gocodebox/lifterlms-rest
- LearnDash REST v2: https://developers.learndash.com/learndash-rest-api-ldlms-v2/
- Moodle external services: https://moodledev.io/docs/5.0/apis/subsystems/external
- Moodle external function list: https://docs.moodle.org/dev/Web_service_API_functions
- SCORM Cloud API: https://cloud.scorm.com/docs/api/

## Public API exists, but native book authoring is limited or unverified

- ProgressMe Swagger UI: https://progressme.ru/school-api/swagger/index.html
- ProgressMe private WebSocket authoring surface: user-supplied first-party browser network captures, sanitized and normalized on 2026-07-28. This is observed evidence, not official public documentation.
- Thinkific Admin API: https://developers.thinkific.com/api/api-documentation/
- LearnWorlds API: https://www.learnworlds.dev/docs/api/
- TalentLMS API v2: https://help.talentlms.com/hc/en-us/articles/24874457011356-TalentLMS-API-V2
- 360Learning API: https://360learning.readme.io/docs/introduction
- Docebo API Browser model: https://developer.docebo.com/docs/api-general-information
- Google Classroom REST: https://developers.google.com/classroom/reference/rest

## Evidence rule

Product UI capabilities, browser network calls, Zapier actions, and marketing claims were not treated as public authoring APIs. A platform is marked actionable only where an official developer source or runtime OpenAPI/REST index supports the required write workflow.
