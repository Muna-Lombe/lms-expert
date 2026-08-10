# Neutral Domain Model

## Overview
The domain model provides a vendor-agnostic, canonical representation of educational content entities. All core application logic, authoring pipelines, and transformation algorithms operate exclusively on this neutral model.

Adapters are responsible for mapping vendor-specific shapes (such as ProgressMe/Edvibe WebSocket frames) to and from these canonical domain entities.

## Entity Hierarchy & Relationships

```
Book (1)
 └── Course (0..*)
      └── Lesson (0..*)
           └── LessonSection (0..*)
                └── Exercise (0..*)
```

- **Book**: Represents a top-level textbook, publication, or educational unit bundle.
- **Course**: A structured track or module within a Book.
- **Lesson**: An individual instructional unit containing content and exercise sections.
- **LessonSection**: A container or structural segment within a Lesson.
- **Exercise**: An interactive activity, question, or assessment item inside a LessonSection.

## Entity Definitions

### 1. Book
Represents a top-level authoring container.
- `id` (`string`): Unique canonical identifier.
- `name` (`string`): Title of the book.
- `description` (`string` | `null`): Summary or description.
- `language` (`string`): ISO language code (e.g., `"en"`, `"ru"`).
- `tags` (`string[]`): Metadata categorization tags.

### 2. Course
A subdivision or module within a Book.
- `id` (`string`): Unique canonical identifier.
- `bookId` (`string`): Identifier of the parent Book.
- `name` (`string`): Course module title.

### 3. Lesson
An instructional topic or lesson within a Course.
- `id` (`string`): Unique canonical identifier.
- `courseId` (`string`): Identifier of the parent Course.
- `name` (`string`): Lesson title.
- `number` (`integer`): Sequence or lesson position number.
- `text` (`string` | `null`): Main text body or notes for the lesson.
- `tags` (`string[]`): Topic/skill tags associated with the lesson.

### 4. LessonSection
A structural section or block within a Lesson.
- `id` (`string`): Unique canonical identifier.
- `lessonId` (`string`): Identifier of the parent Lesson.

### 5. Exercise
An interactive exercise, task, or question within a LessonSection.
- `id` (`string`): Unique canonical identifier.
- `lessonSectionId` (`string`): Identifier of the parent LessonSection.
- `type` (`string` | `integer`): Canonical exercise type classification (mapped to vendor type codes by adapters).
- `name` (`string`): Exercise title or prompt header.
- `content` (`object`): Structured content payload (questions, answers, options, media references).

## Canonical Mapping Policy
Adapters translate vendor protocols (e.g., ProgressMe `BookUpsert` payloads or `SaveExercise` RPCs) into these neutral domain models upon receipt, and convert neutral entities into vendor-specific frames during outbound requests. No vendor-specific terms or structures leak into this domain specification.
