#!/usr/bin/env node
/**
 * Project structure validator for the LMS authoring integration project.
 *
 * Run: npm run check
 * Run: npm run check:structure  (structure-only mode)
 *
 * Exits 0 on success, 1 on any failure.
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const structureOnly = process.argv.includes('--structure');

const requiredDirs = [
  'docs/core',
  'docs/process',
  'docs/plans',
  'features',
  'features/_template',
  'src',
  'tests',
  'asyncapi',
  'openapi',
  'schemas',
  'schemas/platforms',
  'evidence',
  'fixtures',
  'scripts',
  'research',
];

const requiredCoreDocs = [
  'docs/core/PROJECT.md',
  'docs/core/ARCHITECTURE.md',
  'docs/core/DOMAIN_MODEL.md',
  'docs/core/TECH_STACK.md',
  'docs/core/CONTRACTS.md',
  'docs/core/SECURITY.md',
  'docs/core/PROGRESSME_STATUS.md',
];

const requiredProcessDocs = [
  'docs/process/FEATURE_LIFECYCLE.md',
  'docs/process/TRACEABILITY.md',
  'docs/process/DEFINITION_OF_DONE.md',
];

const requiredTemplateArtifacts = [
  'features/_template/feature.yaml',
  'features/_template/REQUIREMENTS.md',
  'features/_template/DESIGN.md',
  'features/_template/CONTRACT.md',
  'features/_template/TEST_PLAN.md',
  'features/_template/IMPLEMENTATION_PLAN.md',
  'features/_template/TASKS.md',
  'features/_template/RELEASE.md',
];

const requiredRootFiles = [
  'README.md',
  'AGENTS.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'package.json',
  'platform-catalog.json',
];

let errors = 0;
let warnings = 0;

function check(path, label) {
  if (!existsSync(join(root, path))) {
    console.error(`  ✗ MISSING: ${label || path}`);
    errors++;
    return false;
  }
  console.log(`  ✓ ${label || path}`);
  return true;
}

console.log('\n=== LMS Authoring Integration — Project Check ===\n');

// Check directories
console.log('Directories:');
for (const dir of requiredDirs) {
  if (!existsSync(join(root, dir))) {
    console.error(`  ✗ MISSING DIR: ${dir}/`);
    errors++;
  } else {
    console.log(`  ✓ ${dir}/`);
  }
}

if (structureOnly) {
  console.log('\n(Structure-only mode — skipping file checks)\n');
  process.exit(errors > 0 ? 1 : 0);
}

// Check root files
console.log('\nRoot files:');
for (const f of requiredRootFiles) {
  check(f);
}

// Check core docs
console.log('\nCore docs:');
for (const f of requiredCoreDocs) {
  check(f);
}

// Check process docs
console.log('\nProcess docs:');
for (const f of requiredProcessDocs) {
  check(f);
}

// Check plan
console.log('\nPlans:');
check('docs/plans/NOW.md');

// Check template artifacts
console.log('\nFeature template:');
for (const f of requiredTemplateArtifacts) {
  check(f);
}

// Check AsyncAPI
console.log('\nAsyncAPI:');
check('asyncapi/progressme.websocket.asyncapi.yaml');

// Check schemas
console.log('\nSchemas:');
check('schemas/progressme.websocket.schema.json');
check('schemas/platforms/progressme.capability.json');

// Check scripts
console.log('\nScripts:');
check('scripts/check-project.mjs');
check('scripts/build.mjs');

// Check source
console.log('\nSource:');
check('src/domain/index.js');
check('src/adapters/progressme/index.js');
check('src/adapters/progressme/envelope.js');
check('src/application/index.js');
check('src/infrastructure/index.js');

// Check feature directories
console.log('\nFeatures:');
const featuresDir = join(root, 'features');
if (existsSync(featuresDir)) {
  const features = readdirSync(featuresDir).filter(
    d => d !== '_template' && statSync(join(featuresDir, d)).isDirectory()
  );
  if (features.length === 0) {
    console.log('  (no feature directories yet — only _template)');
  }
  for (const feat of features) {
    console.log(`  ${feat}/`);
    for (const artifact of requiredTemplateArtifacts) {
      const artifactPath = join(featuresDir, feat, artifact.replace('features/_template/', ''));
      if (!existsSync(artifactPath)) {
        console.error(`    ✗ MISSING: ${artifact.replace('features/_template/', '')}`);
        errors++;
      }
    }
    // Check gate status (warn only)
    const yamlPath = join(featuresDir, feat, 'feature.yaml');
    if (existsSync(yamlPath)) {
      const yaml = readFileSync(yamlPath, 'utf-8');
      const gateMatch = yaml.match(/^gate:\s*(\S+)/m);
      if (gateMatch && gateMatch[1] !== 'complete') {
        console.warn(`    ⚠ gate: ${gateMatch[1]} (not yet complete)`);
        warnings++;
      }
    }
  }
}

// Summary
console.log('\n=== Summary ===');
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);
console.log(`  Result:   ${errors === 0 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log('');

process.exit(errors > 0 ? 1 : 0);
