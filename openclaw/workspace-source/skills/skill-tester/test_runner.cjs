/**
 * skill-tester test runner
 * Based on claw-code's workspace test philosophy
 * Makes skill behavior deterministic, testable, repeatable
 */

const fs = require('fs');
const path = require('path');
const { AssertionError } = require('./assert.cjs');

const DEFAULT_SKILLS_DIR = path.join(__dirname, '..');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const REPORTS_DIR = path.join(__dirname, 'reports');

// Parse CLI arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.replace('--', '').split('=');
    acc[key] = value === undefined ? true : value;
  } else {
    acc._.push(arg);
  }
  return acc;
}, { _: [] });

const SKILL_FILTER = args.skill;
const COVERAGE = args.coverage;
const CI = args.ci;
const VERBOSE = args.verbose || CI;
const HEALTH_CHECK = args.health;

class TestRunner {
  constructor(options = {}) {
    this.skills = options.skills || [];
    this.verbose = options.verbose || false;
    this.coverage = options.coverage || false;
    this.ci = options.ci || false;
    
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: []
    };
    
    this.coverageData = {};
  }
  
  async findTests(skillName) {
    const skillPath = path.join(DEFAULT_SKILLS_DIR, skillName, 'tests');
    
    if (!fs.existsSync(skillPath)) {
      return [];
    }
    
    const testFiles = [];
    const entries = fs.readdirSync(skillPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.test.js') || entry.name.endsWith('.test.cjs'))) {
        testFiles.push(path.join(skillPath, entry.name));
      }
    }
    
    return testFiles;
  }
  
  async findAllSkills() {
    if (this.skills.length > 0) {
      return this.skills;
    }
    
    const entries = fs.readdirSync(DEFAULT_SKILLS_DIR, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(n => !n.startsWith('.'));
  }
  
  createContext(skillName) {
    return {
      skillName,
      fixture: (name) => {
        const fixturePath = path.join(FIXTURES_DIR, name);
        if (fs.existsSync(fixturePath)) {
          return fixturePath;
        }
        throw new Error(`Fixture not found: ${name}`);
      },
      fixtureContent: (name) => {
        const fixturePath = path.join(FIXTURES_DIR, name);
        if (fs.existsSync(fixturePath)) {
          return fs.readFileSync(fixturePath, 'utf-8');
        }
        throw new Error(`Fixture not found: ${name}`);
      },
      tmpDir: () => {
        const dir = path.join(__dirname, 'tmp', `${skillName}_${Date.now()}`);
        fs.mkdirSync(dir, { recursive: true });
        return dir;
      },
      runSkill: async (skill, params) => {
        // Actually try to run the skill via its SKILL.md
        // This uses OpenClaw's skill execution if available, otherwise falls back to CLI
        const skillPath = path.join(DEFAULT_SKILLS_DIR, skill);
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        
        if (!fs.existsSync(skillMdPath)) {
          return { output: '', exitCode: 1, error: `Skill not found: ${skill}` };
        }
        
        try {
          // Try to use openclaw CLI to run the skill
          const { execSync } = require('child_process');
          
          // Check if skill has a test script defined in package.json or _meta.json
          const metaPath = path.join(skillPath, '_meta.json');
          const packagePath = path.join(skillPath, 'package.json');
          
          let testCmd = null;
          
          if (fs.existsSync(metaPath)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
              if (meta.testCommand) testCmd = meta.testCommand;
            } catch (e) { /* ignore */ }
          }
          
          if (!testCmd && fs.existsSync(packagePath)) {
            try {
              const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
              if (pkg.scripts && pkg.scripts.test) testCmd = `npm test --prefix "${skillPath}"`;
            } catch (e) { /* ignore */ }
          }
          
          // Check for test files in tests/ subdirectory
          const testsDir = path.join(skillPath, 'tests');
          if (fs.existsSync(testsDir)) {
            const testFiles = fs.readdirSync(testsDir)
              .filter(f => f.endsWith('.test.js') || f.endsWith('.test.cjs'));
            if (testFiles.length > 0) {
              // Run tests using this test runner recursively
              const { TestRunner } = require('./test_runner.cjs');
              const subRunner = new TestRunner({ verbose: false, skills: [skill] });
              await subRunner.run();
              const passed = subRunner.results.passed;
              const failed = subRunner.results.failed;
              return {
                output: `${passed} passed, ${failed} failed`,
                exitCode: failed > 0 ? 1 : 0,
                results: subRunner.results
              };
            }
          }
          
          // If no explicit test command, try running the skill directly via markitdown/akshare patterns
          // For document conversion skills
          if (skill === 'markitdown' && params.file) {
            const result = execSync(`markitdown "${params.file}"`, {
              encoding: 'utf-8',
              timeout: 30000,
              cwd: skillPath
            });
            return { output: result, exitCode: 0 };
          }
          
          // For Python-based skills
          if (fs.existsSync(path.join(skillPath, 'tests', `${skill}.test.cjs`))) {
            const testFile = path.join(skillPath, 'tests', `${skill}.test.cjs`);
            const result = execSync(`node "${testFile}"`, {
              encoding: 'utf-8',
              timeout: 60000,
              cwd: skillPath
            });
            return { output: result, exitCode: 0 };
          }
          
          return { output: 'No test implementation found', exitCode: 0, skipped: true };
        } catch (err) {
          return { output: '', exitCode: 1, error: err.message };
        }
      },
      coverage: this.coverage ? {
        track: (file, line) => {
          if (!this.coverageData[file]) {
            this.coverageData[file] = { lines: new Set(), hits: new Set() };
          }
          this.coverageData[file].lines.add(line);
        },
        hit: (file, line) => {
          if (this.coverageData[file]) {
            this.coverageData[file].hits.add(line);
          }
        }
      } : null
    };
  }
  
  async runTest(testPath, context) {
    const testModule = require(testPath);
    const testName = path.basename(testPath, '.test.js');
    
    if (typeof testModule === 'function') {
      // Simple function-style test
      return this.runTestFn(testName, testModule, context);
    }
    
    if (testModule.test) {
      // Object-style test with metadata
      return this.runTestFn(testName, testModule.test, context);
    }
    
    // Assume it's an array of tests
    const results = [];
    for (const [name, fn] of Object.entries(testModule)) {
      if (typeof fn === 'function' && name !== 'setup' && name !== 'teardown') {
        results.push(await this.runTestFn(`${testName}: ${name}`, fn, context));
      }
    }
    return results;
  }
  
  async runTestFn(name, fn, context) {
    const startTime = Date.now();
    let result;
    
    try {
      // Run setup if exists
      if (context._setup) {
        await context._setup();
      }
      
      await fn(context);
      
      result = { name, passed: true, duration: Date.now() - startTime };
    } catch (error) {
      result = { 
        name, 
        passed: false, 
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime 
      };
    } finally {
      // Run teardown if exists
      if (context._teardown) {
        try {
          await context._teardown();
        } catch (e) {
          // Ignore teardown errors
        }
      }
    }
    
    return result;
  }
  
  async runSuite(skillName) {
    const testFiles = await this.findTests(skillName);
    
    if (testFiles.length === 0) {
      return { skillName, tests: [], skipped: true };
    }
    
    const context = this.createContext(skillName);
    const tests = [];
    
    for (const testFile of testFiles) {
      if (VERBOSE) {
        console.log(`   📄 ${path.basename(testFile)}`);
      }
      
      const results = await this.runTest(testFile, context);
      tests.push(...(Array.isArray(results) ? results : [results]));
    }
    
    return { skillName, tests, skipped: false };
  }
  
  async run() {
    const startTime = Date.now();
    
    console.log('🧪 skill-tester starting...');
    console.log('');
    
    const skills = await this.findAllSkills();
    const filtered = SKILL_FILTER ? skills.filter(s => s.includes(SKILL_FILTER)) : skills;
    
    if (filtered.length === 0) {
      console.log('⚠️  No skills found to test');
      return;
    }
    
    for (const skill of filtered) {
      if (VERBOSE) {
        console.log(`\n📦 Testing skill: ${skill}`);
      }
      
      const suite = await this.runSuite(skill);
      this.results.suites.push(suite);
      
      const passed = suite.tests.filter(t => t.passed).length;
      const failed = suite.tests.filter(t => !t.passed).length;
      
      this.results.total += suite.tests.length;
      this.results.passed += passed;
      this.results.failed += failed;
      
      if (VERBOSE || suite.skipped) {
        if (suite.skipped) {
          console.log(`   ⏭️  Skipped (no tests)`);
        } else {
          console.log(`   ${passed}/${suite.tests.length} passed`);
        }
      }
      
      // Print failures
      for (const test of suite.tests.filter(t => !t.passed)) {
        console.log(`   ❌ ${test.name}`);
        if (VERBOSE) {
          console.log(`      ${test.error}`);
        }
      }
    }
    
    this.results.duration = Date.now() - startTime;
  }
  
  async report() {
    console.log('');
    console.log('─'.repeat(50));
    console.log('📊 Test Results');
    console.log('─'.repeat(50));
    console.log(`   Total:   ${this.results.total}`);
    console.log(`   ✅ Passed:  ${this.results.passed}`);
    console.log(`   ❌ Failed:  ${this.results.failed}`);
    console.log(`   ⏱️  Duration: ${(this.results.duration / 1000).toFixed(1)}s`);
    
    if (this.coverage && Object.keys(this.coverageData).length > 0) {
      console.log('');
      console.log('📈 Coverage');
      console.log('─'.repeat(50));
      
      for (const [file, data] of Object.entries(this.coverageData)) {
        const total = data.lines.size;
        const hits = data.hits.size;
        const pct = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
        console.log(`   ${pct}% | ${hits}/${total} | ${path.basename(file)}`);
      }
    }
    
    if (this.ci) {
      // Exit with error code if tests failed
      process.exit(this.results.failed > 0 ? 1 : 0);
    }
    
    return this.results;
  }
}

async function healthCheck() {
  console.log('🏥 skill-tester health check');
  console.log('');
  
  const checks = [];
  
  // Check fixtures directory
  const fixturesOk = fs.existsSync(FIXTURES_DIR);
  checks.push({ name: 'Fixtures directory', ok: fixturesOk });
  
  // Check reports directory
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  checks.push({ name: 'Reports directory', ok: true });
  
  // Check node_modules or built-in modules
  let assertOk = false;
  try {
    require('./assert.cjs');
    assertOk = true;
  } catch (e) {
    assertOk = false;
  }
  checks.push({ name: 'Assert module', ok: assertOk });
  
  for (const check of checks) {
    console.log(`   ${check.ok ? '✅' : '❌'} ${check.name}`);
  }
  
  console.log('');
  if (checks.every(c => c.ok)) {
    console.log('✅ All checks passed');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed');
    process.exit(1);
  }
}

// Main entry point
async function main() {
  if (HEALTH_CHECK) {
    await healthCheck();
    return;
  }
  
  const runner = new TestRunner({
    verbose: VERBOSE,
    coverage: COVERAGE,
    ci: CI,
    skills: args._.length > 0 ? args._ : []
  });
  
  await runner.run();
  await runner.report();
}

main().catch(e => {
  console.error('❌ Test runner error:', e.message);
  process.exit(1);
});

module.exports = { TestRunner };
