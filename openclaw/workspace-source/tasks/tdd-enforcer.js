/**
 * TDD Enforcer v1.0
 * 蒸馏自 Claude Code TDD Iron Law
 * 
 * 功能：
 * 确保测试先行，强制 Red-Green-Refactor 流程
 * 
 * 使用方式：
 * const tdd = require('./tdd-enforcer');
 * tdd.enforce('test', taskDescription);  // 先写测试
 * tdd.enforce('code', taskDescription);  // 再写代码
 */

const fs = require('fs');
const path = require('path');

// TDD 规则说明
const TDD_RULES = `
# TDD 强制执行规则

## Iron Law
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

## Red-Green-Refactor 流程

### Phase 1: RED（先写测试）
- 只写失败测试，不要写实现代码
- 运行测试确认失败（expected failure）
- 测试名称要清晰描述预期行为

### Phase 2: GREEN（写最小代码）
- 写最小代码让测试通过
- 不要过度设计
- 通过测试即可，不要追求完美

### Phase 3: REFACTOR（重构）
- 在测试通过的前提下重构
- 保持测试始终通过
- 每次重构后运行测试

## 检查点

- [ ] 测试文件已创建？
- [ ] 测试在实现前失败？
- [ ] 实现代码让测试通过？
- [ ] 重构后测试仍然通过？
`;

// TDD 相关关键词
const TDD_KEYWORDS = [
  'test', 'spec', '测试', '单元测试', '功能', 'feature',
  'bugfix', 'fix', '修复', 'refactor', '重构', '新功能',
  'implement', '实现', 'add', '添加', 'create', '创建'
];

const CODE_KEYWORDS = [
  'code', '代码', '实现', 'function', 'class', 'def',
  'const', 'let', 'var', 'import', 'export', 'module'
];

/**
 * 检测是否为 TDD 任务
 */
function isTDDTask(taskDescription) {
  const desc = taskDescription.toLowerCase();
  return TDD_KEYWORDS.some(k => desc.includes(k));
}

/**
 * 检测当前是 RED 还是 GREEN 阶段
 */
function detectPhase(cwd, taskDescription) {
  // 检查是否存在测试文件
  const testPatterns = [
    '**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts',
    '**/test_*.py', '**/*_test.py', '**/tests/*.py',
    '**/*.test.jsx', '**/*.test.tsx', '**/*.spec.jsx', '**/*.spec.tsx'
  ];
  
  // 简单检查：看是否有测试文件存在
  const hasTestFiles = fs.existsSync(path.join(cwd, 'test')) ||
                       fs.existsSync(path.join(cwd, 'tests')) ||
                       fs.existsSync(path.join(cwd, '__tests__'));
  
  // 检查最近修改的文件
  let recentTestModified = false;
  let recentCodeModified = false;
  
  try {
    const gitDir = path.join(cwd, '.git');
    if (fs.existsSync(gitDir)) {
      // 简单的文件检查（实际应该用 git）
      const testDir = path.join(cwd, 'test');
      const srcDir = path.join(cwd, 'src');
      
      if (fs.existsSync(testDir)) {
        recentTestModified = fs.statSync(testDir).mtime > new Date(Date.now() - 60000);
      }
      if (fs.existsSync(srcDir)) {
        recentCodeModified = fs.statSync(srcDir).mtime > new Date(Date.now() - 60000);
      }
    }
  } catch {}
  
  // 判断阶段
  if (!hasTestFiles) {
    return 'RED'; // 还没有测试，应该先写测试
  }
  
  if (recentTestModified && !recentCodeModified) {
    return 'GREEN'; // 最近改了测试，还没改代码
  }
  
  return 'REFACTOR'; // 默认认为是重构阶段
}

/**
 * 获取 TDD 规则说明
 */
function getRules() {
  return TDD_RULES;
}

/**
 * 强制 TDD 检查
 * @param {string} phase - 'test' 或 'code'
 * @param {string} taskDescription - 任务描述
 * @returns {Object} {pass, message, instructions}
 */
function enforce(phase, taskDescription) {
  // 非 TDD 任务直接通过
  if (!isTDDTask(taskDescription)) {
    return {
      pass: true,
      message: 'Non-TDD task, proceed normally',
      phase: null
    };
  }
  
  // 检查是否是测试先写
  if (phase === 'test') {
    return {
      pass: true,
      message: 'RED phase: Write failing test first',
      phase: 'RED',
      instructions: `
1. Write the test file first
2. Write minimal test code that describes expected behavior
3. Run test and confirm it FAILS
4. Then proceed to write implementation code
      `
    };
  }
  
  if (phase === 'code') {
    const currentPhase = detectPhase('.', taskDescription);
    
    if (currentPhase === 'RED') {
      return {
        pass: false,
        message: 'Cannot write code before writing tests!',
        phase: 'RED',
        instructions: `
⚠️ VIOLATION: You must write tests BEFORE implementation code!

Current phase detected: RED
Required action: Write failing test first

Steps:
1. Create test file (e.g., test/feature.test.js)
2. Write test code with expected behavior
3. Run test and confirm it FAILS
4. Then write implementation code
        `
      };
    }
    
    return {
      pass: true,
      message: 'GREEN phase: Write minimal code to pass test',
      phase: 'GREEN',
      instructions: `
1. Write MINIMAL code to make the test pass
2. Do NOT optimize or refactor yet
3. Get tests green first
4. Only then proceed to REFACTOR phase
      `
    };
  }
  
  if (phase === 'refactor') {
    return {
      pass: true,
      message: 'REFACTOR phase: Improve code while keeping tests green',
      phase: 'REFACTOR',
      instructions: `
1. Run tests to confirm they pass
2. Refactor implementation
3. Run tests again to confirm still passing
4. Repeat until satisfied
      `
    };
  }
  
  return { pass: true, message: 'Unknown phase', phase: null };
}

/**
 * 生成测试文件模板
 */
function generateTestTemplate(options) {
  const { framework = 'jest', language = 'javascript', testName, subject } = options;
  
  if (framework === 'jest') {
    return `describe('${subject}', () => {
  it('should ${testName}', () => {
    // Arrange
    const input = something;
    
    // Act
    const result = ${subject}(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
`;
  }
  
  if (framework === 'pytest') {
    return `import pytest
from ${subject} import ${subject}

def test_${testName.replace(/\s+/g, '_')}():
    # Arrange
    input_data = something
    
    # Act
    result = ${subject}(input_data)
    
    # Assert
    assert result == expected
`;
  }
  
  return `// ${testName}
test('${testName}', () => {
  expect(true).toBe(false); // TODO: implement
});
`;
}

/**
 * 检查项目测试配置
 */
function checkTestConfig(cwd) {
  const configs = {
    'jest.config.js': 'Jest',
    'jest.config.ts': 'Jest',
    'vitest.config.js': 'Vitest',
    'vitest.config.ts': 'Vitest',
    'pytest.ini': 'Pytest',
    'setup.cfg': 'Pytest',
    'pyproject.toml': 'Pytest',
    'mocha.opts': 'Mocha',
    'karma.conf.js': 'Karma',
  };
  
  for (const [file, framework] of Object.entries(configs)) {
    if (fs.existsSync(path.join(cwd, file))) {
      return { framework, configFile: file };
    }
  }
  
  return { framework: null, configFile: null };
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const phase = args[0] || 'check';
  const task = args.slice(1).join(' ') || '';
  
  if (phase === 'check') {
    console.log('TDD Enforcer - 检查任务类型');
    console.log(`任务描述: ${task || '(未提供)'}`);
    console.log(`TDD任务: ${isTDDTask(task)}`);
  } else if (phase === 'rules') {
    console.log(getRules());
  } else {
    const result = enforce(phase, task);
    console.log(`\n${result.pass ? '✅' : '❌'} ${result.message}`);
    if (result.instructions) {
      console.log(result.instructions);
    }
  }
}

module.exports = {
  isTDDTask,
  detectPhase,
  enforce,
  getRules,
  generateTestTemplate,
  checkTestConfig
};
