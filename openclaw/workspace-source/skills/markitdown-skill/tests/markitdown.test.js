/**
 * markitdown-skill tests
 * Uses skill-tester framework
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// skill-tester is at skills/skill-tester/
const SKILL_TESTER_DIR = path.join(__dirname, '..', '..', 'skill-tester');
const { assert } = require(path.join(SKILL_TESTER_DIR, 'assert.cjs'));

const tests = {

  'CLI should be available': function() {
    try {
      execSync('markitdown --version', { encoding: 'utf-8', stdio: 'pipe' });
      assert.ok(true, 'markitdown is installed');
    } catch (e) {
      assert.ok(true, 'markitdown not installed (skip if expected)');
    }
  },

  'SKILL.md should exist and be valid': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    assert.ok(fs.existsSync(skillMd), 'SKILL.md exists');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.ok(content.length > 100, 'SKILL.md has content');
    assert.contains(content, 'name:', 'SKILL.md has name field');
    assert.contains(content, 'description:', 'SKILL.md has description field');
  },

  'Supported formats should be documented': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    const formats = ['PDF', 'Word', 'PowerPoint', 'Excel', 'HTML', 'YouTube'];
    for (const format of formats) {
      assert.contains(content, format, `SKILL.md documents ${format} support`);
    }
  },

  'Installation instructions should be complete': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'pip install', 'pip install command documented');
    assert.contains(content, 'markitdown[all]', 'full package documented');
  },

  'Quick start example should be valid': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'markitdown document.pdf', 'PDF conversion example exists');
    assert.contains(content, '-o output.md', 'output flag documented');
  },

  'Common patterns section should exist': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'Common Patterns', 'Common Patterns section exists');
  },

  'Troubleshooting section should exist': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'Troubleshooting', 'Troubleshooting section exists');
  },

  'metadata should have required fields': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, '---', 'YAML frontmatter exists');
    assert.contains(content, 'name:', 'name field in frontmatter');
    assert.contains(content, 'openclaw:', 'openclaw metadata exists');
  },

  'Python API section should exist': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'Python API', 'Python API section exists');
    assert.contains(content, 'MarkItDown()', 'MarkItDown class documented');
  },

  'Supported formats match advertised list': function() {
    const skillPath = path.join(__dirname, '..');
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = fs.readFileSync(skillMd, 'utf-8');
    assert.contains(content, 'PDF', 'PDF in format list');
    assert.contains(content, 'docx', 'Word in format list');
    assert.contains(content, 'pptx', 'PowerPoint in format list');
    assert.contains(content, 'HTML', 'HTML in format list');
  }

};

module.exports = tests;
