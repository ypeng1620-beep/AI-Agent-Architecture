/**
 * akshare-stock skill tests
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

  'Quick start example should be valid': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'akshare', 'akshare reference exists');
  },

  'Troubleshooting section should exist': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'Troubleshooting', 'Troubleshooting section exists');
  },

  'Package dependencies should be documented': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'pip install', 'pip install command documented');
    assert.contains(content, 'akshare', 'akshare dependency documented');
  }

};

module.exports = tests;
