/**
 * skill-tester skill tests
 * Uses skill-tester framework
 */

const path = require('path');
const fs = require('fs');

const SKILL_TESTER_DIR = path.join(__dirname, '..', '..', 'skill-tester');
const { assert } = require(path.join(SKILL_TESTER_DIR, 'assert.cjs'));

const tests = {

  'SKILL.md should exist and be valid': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    assert.ok(fs.existsSync(skillMd), 'SKILL.md exists');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.ok(content.length > 100, 'SKILL.md has content');
    assert.contains(content, 'name:', 'SKILL.md has name field');
    assert.contains(content, 'description:', 'SKILL.md has description field');
  },

  'metadata should have required fields': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, '---', 'YAML frontmatter exists');
    assert.contains(content, 'name:', 'name field in frontmatter');
    assert.contains(content, 'openclaw:', 'openclaw metadata exists');
  },

  'test_runner.cjs should be executable': function() {
    const skillPath = path.join(__dirname, '..');
    const runnerPath = path.join(skillPath, 'test_runner.cjs');
    assert.ok(fs.existsSync(runnerPath), 'test_runner.cjs exists');
    const content = fs.readFileSync(runnerPath, 'utf-8');
    assert.contains(content, 'TestRunner', 'test_runner.cjs has TestRunner class');
    assert.contains(content, 'args.skill', '--skill parameter parsed in code');
  },

  'assert.cjs should provide assertion functions': function() {
    const skillPath = path.join(__dirname, '..');
    const assertPath = path.join(skillPath, 'assert.cjs');
    assert.ok(fs.existsSync(assertPath), 'assert.cjs exists');
    const content = fs.readFileSync(assertPath, 'utf-8');
    assert.contains(content, 'assert.equals', 'assert.cjs has equals function');
    assert.contains(content, 'assert.ok', 'assert.cjs has ok function');
    assert.contains(content, 'assert.contains', 'assert.cjs has contains function');
  },

  'health.cjs should be present': function() {
    const skillPath = path.join(__dirname, '..');
    const healthPath = path.join(skillPath, 'health.cjs');
    assert.ok(fs.existsSync(healthPath), 'health.cjs exists');
    const content = fs.readFileSync(healthPath, 'utf-8');
    assert.contains(content, 'health check', 'health.cjs has health check function');
  },

  'Quick start instructions should be documented': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'node test_runner.cjs', 'test_runner.cjs usage documented');
    assert.contains(content, '--skill=', '--skill parameter documented');
    assert.contains(content, '--verbose', '--verbose option documented');
  },

  'Test file format should be documented': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, '.test.cjs', 'test file extension documented');
    assert.contains(content, 'module.exports', 'module.exports pattern documented');
  },

  'Assertions reference should be complete': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    const assertions = ['equals', 'deepEquals', 'ok', 'contains', 'matches', 'rejects'];
    for (const assertion of assertions) {
      assert.contains(content, `assert.${assertion}`, `assert.${assertion} documented`);
    }
  },

  'Test runner can accept .test.cjs files': function() {
    const skillPath = path.join(__dirname, '..');
    const runnerPath = path.join(skillPath, 'test_runner.cjs');
    const content = fs.readFileSync(runnerPath, 'utf-8');
    assert.contains(content, '.test.cjs', 'test_runner supports .test.cjs extension');
  }

};

module.exports = tests;
