#!/usr/bin/env node
/**
 * Build / validate the research baseline.
 *
 * Run: npm run build:research-baseline
 *
 * Reads platform-catalog.json, the LMS API research markdown, the
 * ProgressMe WebSocket guide, and sources.md. Validates that the catalog
 * count matches actual platform entries.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
let errors = 0;

console.log('\n=== Research Baseline Build ===\n');

// --- platform-catalog.json ---
const catalogPath = join(root, 'platform-catalog.json');
if (!existsSync(catalogPath)) {
  console.error('✗ MISSING: platform-catalog.json');
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
console.log(`Catalog researched_at: ${catalog.researched_at}`);
console.log(`Catalog declared count: ${catalog.count}`);
console.log(`Catalog actual platforms: ${catalog.platforms.length}`);

if (catalog.count !== catalog.platforms.length) {
  console.error(`✗ MISMATCH: declared count (${catalog.count}) != actual platforms (${catalog.platforms.length})`);
  errors++;
} else {
  console.log('✓ Count matches actual platforms\n');
}

// --- LMS API Research ---
const researchPath = join(root, 'LMS_API_Research_2026-07-27.md');
if (existsSync(researchPath)) {
  const research = readFileSync(researchPath, 'utf-8');
  const lineCount = research.split('\n').length;
  console.log(`LMS API Research: ${lineCount} lines ✓`);
} else {
  console.error('✗ MISSING: LMS_API_Research_2026-07-27.md');
  errors++;
}

// --- ProgressMe WebSocket Guide ---
const wsGuidePath = join(root, 'ProgressMe_WebSocket_Guide.md');
if (existsSync(wsGuidePath)) {
  const guide = readFileSync(wsGuidePath, 'utf-8');
  const operationCount = (guide.match(/Controller\.\w+/g) || []).length;
  console.log(`ProgressMe WebSocket Guide: ${operationCount} operation references ✓`);
} else {
  console.error('✗ MISSING: ProgressMe_WebSocket_Guide.md');
  errors++;
}

// --- sources.md ---
const sourcesPath = join(root, 'sources.md');
if (existsSync(sourcesPath)) {
  const sources = readFileSync(sourcesPath, 'utf-8');
  const linkCount = (sources.match(/https?:\/\//g) || []).length;
  console.log(`sources.md: ${linkCount} source links ✓`);
} else {
  console.error('✗ MISSING: sources.md');
  errors++;
}

// --- Summary ---
console.log('\n=== Summary ===');
console.log(`  Errors: ${errors}`);
console.log(`  Result: ${errors === 0 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log('');

process.exit(errors > 0 ? 1 : 0);
