import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CAP_PATH = join(process.cwd(), 'schemas/platforms/progressme.capability.json');
const STATUS_PATH = join(process.cwd(), 'docs/core/PROGRESSME_STATUS.md');

// The capability map is a JSON Schema document. The actual values are in `const` fields.
const capSchema = JSON.parse(readFileSync(CAP_PATH, 'utf-8'));
const cap = capSchema.properties; // Navigate to the data properties
const capAreas = cap.areas.properties;
const statusContent = readFileSync(STATUS_PATH, 'utf-8');

describe('Capability map file is valid', () => {
  it('file exists', () => assert.ok(existsSync(CAP_PATH)));
  it('has $schema', () => assert.ok(capSchema.$schema));
  it('has slug progressme', () => assert.equal(cap.slug.const, 'progressme'));
  it('has name ProgressMe', () => assert.equal(cap.name.const, 'ProgressMe'));
  it('protocol is websocket-rpc', () => assert.equal(cap.protocol.const, 'websocket-rpc'));
  it('status is observed-private-websocket-authoring', () =>
    assert.equal(cap.status.const, 'observed-private-websocket-authoring'));
  it('research_date is 2026-07-28', () => assert.equal(cap.research_date.const, '2026-07-28'));
});

const expectedAreas = ['book', 'course', 'lesson', 'exercise', 'sharing', 'tags', 'auth', 'response_bodies', 'binary_upload'];

describe('Capability map covers all domain areas', () => {
  for (const area of expectedAreas) {
    it(`has area: ${area}`, () => {
      assert.ok(capAreas[area], `Missing area: ${area}`);
    });
  }
});

describe('Book capability statuses', () => {
  const book = capAreas.book.properties;
  it('create is confirmed', () => assert.equal(book.create.const, 'confirmed'));
  it('read is confirmed', () => assert.equal(book.read.const, 'confirmed'));
  it('list is confirmed', () => assert.equal(book.list.const, 'confirmed'));
  it('copy is confirmed', () => assert.equal(book.copy.const, 'confirmed'));
  it('delete is missing', () => assert.equal(book.delete.const, 'missing'));
});

describe('Course capability statuses', () => {
  const course = capAreas.course.properties;
  it('read is confirmed', () => assert.equal(course.read.const, 'confirmed'));
  it('create is missing', () => assert.equal(course.create.const, 'missing'));
  it('delete is missing', () => assert.equal(course.delete.const, 'missing'));
});

describe('Lesson capability statuses', () => {
  const lesson = capAreas.lesson.properties;
  it('create is confirmed', () => assert.equal(lesson.create.const, 'confirmed'));
  it('read is confirmed', () => assert.equal(lesson.read.const, 'confirmed'));
  it('list is confirmed', () => assert.equal(lesson.list.const, 'confirmed'));
  it('delete is missing', () => assert.equal(lesson.delete.const, 'missing'));
});

describe('Exercise capability statuses', () => {
  const exercise = capAreas.exercise.properties;
  it('save_word_fill is confirmed', () => assert.equal(exercise.save_word_fill.const, 'confirmed'));
  it('save_test is confirmed', () => assert.equal(exercise.save_test.const, 'confirmed'));
  it('load is confirmed', () => assert.equal(exercise.load.const, 'confirmed'));
  it('delete is missing', () => assert.equal(exercise.delete.const, 'missing'));
});

describe('Missing capabilities correctly flagged', () => {
  it('response_bodies status is missing', () =>
    assert.equal(capAreas.response_bodies.properties.status.const, 'missing'));
  it('binary_upload status is missing', () =>
    assert.equal(capAreas.binary_upload.properties.status.const, 'missing'));
});

describe('Capability map aligns with PROGRESSME_STATUS.md', () => {
  it('status doc mentions missing response bodies', () =>
    assert.ok(statusContent.includes('response bodies') || statusContent.includes('Inbound response'),
      'PROGRESSME_STATUS.md should mention missing response bodies'));
  it('status doc mentions missing course upsert', () =>
    assert.ok(statusContent.includes('course upsert') || statusContent.includes('Course upsert') || statusContent.includes('course-upsert'),
      'PROGRESSME_STATUS.md should mention missing course-upsert'));
  it('status doc mentions missing binary upload', () =>
    assert.ok(statusContent.includes('binary') || statusContent.includes('upload'),
      'PROGRESSME_STATUS.md should mention missing binary upload'));
  it('status doc mentions missing WebSocket path', () =>
    assert.ok(statusContent.includes('WebSocket path') || statusContent.includes('websocket path'),
      'PROGRESSME_STATUS.md should mention missing WebSocket path'));
});
