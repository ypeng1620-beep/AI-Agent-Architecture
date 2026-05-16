/**
 * skill-tester health check
 * Based on claw-code's `claw doctor` philosophy
 * 
 * Run: node health.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_DIR = path.join(__dirname, '..');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const REPORTS_DIR = path.join(__dirname, 'reports');

const checks = [];

function check(name, fn) {
  try {
    const result = fn();
    checks.push({ name, passed: true, details: result });
  } catch (e) {
    checks.push({ name, passed: false, details: e.message });
  }
}

function section(name) {
  checks.push({ name, type: 'section' });
}

// Run checks
console.log('🏥 skill-tester health check');
console.log('');
console.log('='.repeat(50));

section('📁 Directories');
check('Skills directory exists', () => fs.existsSync(SKILL_DIR));
check('Fixtures directory exists', () => fs.existsSync(FIXTURES_DIR));
check('Reports directory exists', () => {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  return true;
});

section('📦 Core Modules');
check('assert.js loads', () => {
  require('./assert.cjs');
  return true;
});
check('test_runner.js loads', () => {
  require('./test_runner.cjs');
  return true;
});

section('🔧 Environment');
check('Node.js version', () => {
  const v = process.version;
  const major = parseInt(v.replace('v', '').split('.')[0]);
  if (major < 14) {
    throw new Error(`Node.js ${major} is too old (need 14+)`);
  }
  return `v${process.version}`;
});
check('Platform', () => process.platform);

section('📚 Skills Inventory');
check('Skills directory readable', () => {
  const entries = fs.readdirSync(SKILL_DIR, { withFileTypes: true });
  const skills = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
  return `${skills.length} skills found`;
});

section('🧪 Test Infrastructure');
check('Can list test files', () => {
  const entries = fs.readdirSync(SKILL_DIR, { withFileTypes: true });
  let totalTests = 0;
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const testsDir = path.join(SKILL_DIR, entry.name, 'tests');
      if (fs.existsSync(testsDir)) {
        const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js'));
        totalTests += testFiles.length;
      }
    }
  }
  
  return `${totalTests} test files found`;
});

// Print results
console.log('');

let allPassed = true;
for (const check of checks) {
  if (check.type === 'section') {
    console.log('');
    console.log(check.name);
    console.log('-'.repeat(50));
    continue;
  }
  
  const icon = check.passed ? '✅' : '❌';
  const name = check.name.padEnd(30);
  const details = typeof check.details === 'string' ? `| ${check.details}` : '';
  
  console.log(`   ${icon} ${name} ${details}`);
  
  if (!check.passed) {
    allPassed = false;
  }
}

console.log('');
console.log('='.repeat(50));

if (allPassed) {
  console.log('✅ All checks passed - skill-tester is healthy');
  process.exit(0);
} else {
  console.log('❌ Some checks failed - run individual checks above');
  process.exit(1);
}
