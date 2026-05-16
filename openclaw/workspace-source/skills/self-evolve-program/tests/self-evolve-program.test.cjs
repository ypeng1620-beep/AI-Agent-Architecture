/**
 * self-evolve-program skill tests
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

  'run.cjs should be executable': function() {
    const skillPath = path.join(__dirname, '..');
    const runPath = path.join(skillPath, 'run.cjs');
    assert.ok(fs.existsSync(runPath), 'run.cjs exists');
    const content = fs.readFileSync(runPath, 'utf-8');
    assert.contains(content, 'self-evolve-program', 'run.cjs references self-evolve');
    assert.contains(content, 'skill_program.md', 'references skill_program.md');
    assert.contains(content, 'skill_target', 'references skill_target');
  },

  'evaluator.cjs should exist': function() {
    const skillPath = path.join(__dirname, '..');
    const evalPath = path.join(skillPath, 'evaluator.cjs');
    assert.ok(fs.existsSync(evalPath), 'evaluator.cjs exists');
    const content = fs.readFileSync(evalPath, 'utf-8');
    assert.contains(content, 'evaluate', 'evaluator has evaluate function');
  },

  'skill_program.md template should be valid': function() {
    const skillPath = path.join(__dirname, '..');
    const programPath = path.join(skillPath, 'skill_program.md');
    assert.ok(fs.existsSync(programPath), 'skill_program.md exists');
    const content = fs.readFileSync(programPath, 'utf-8');
    assert.ok(content.length > 50, 'skill_program.md has content');
    assert.contains(content, 'Objective', 'has Objective section');
    assert.contains(content, 'Success Metric', 'has Success Metric section');
  },

  'Quick start instructions should be documented': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'node run.cjs', 'run.cjs usage documented');
    assert.contains(content, '--target=', '--target parameter documented');
    assert.contains(content, '--budget=', '--budget parameter documented');
  },

  'Output directory structure should be documented': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'output', 'output directory referenced');
    assert.contains(content, 'best_', 'best file naming convention documented');
    assert.contains(content, 'evolution_log', 'evolution log documented');
  }

};

module.exports = tests;
