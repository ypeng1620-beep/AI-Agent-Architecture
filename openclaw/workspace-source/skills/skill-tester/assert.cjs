/**
 * skill-tester assertion library
 * Based on claw-code's deterministic testing philosophy
 */

class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message || 'Assertion failed');
  }
}

assert.ok = function(value, message) {
  if (!value) {
    throw new AssertionError(message || 'Expected truthy value', true, value);
  }
};

assert.equals = function(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError(
      message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
      expected,
      actual
    );
  }
};

assert.deepEquals = function(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  
  if (actualStr !== expectedStr) {
    throw new AssertionError(
      message || `Expected ${expectedStr} but got ${actualStr}`,
      expected,
      actual
    );
  }
};

assert.contains = function(str, substr, message) {
  if (typeof str !== 'string' || !str.includes(substr)) {
    throw new AssertionError(
      message || `Expected string to contain "${substr}" but got "${str}"`,
      substr,
      str
    );
  }
};

assert.matches = function(str, regex, message) {
  if (typeof str !== 'string' || !regex.test(str)) {
    throw new AssertionError(
      message || `Expected string to match ${regex} but got "${str}"`,
      regex,
      str
    );
  }
};

assert.typeOf = function(value, type, message) {
  const actualType = typeof value;
  if (actualType !== type) {
    throw new AssertionError(
      message || `Expected type ${type} but got ${actualType}`,
      type,
      actualType
    );
  }
};

assert.isArray = function(value, message) {
  if (!Array.isArray(value)) {
    throw new AssertionError(
      message || `Expected array but got ${typeof value}`,
      'array',
      typeof value
    );
  }
};

assert.isObject = function(value, message) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AssertionError(
      message || `Expected object but got ${typeof value}`,
      'object',
      typeof value
    );
  }
};

assert.hasProperty = function(obj, prop, message) {
  if (!obj || typeof obj !== 'object') {
    throw new AssertionError(
      message || `Expected object but got ${typeof obj}`,
      `object with property ${prop}`,
      obj
    );
  }
  if (!(prop in obj)) {
    throw new AssertionError(
      message || `Expected object to have property "${prop}"`,
      `property ${prop}`,
      Object.keys(obj)
    );
  }
};

assert.equalsOneOf = function(value, allowed, message) {
  if (!allowed.includes(value)) {
    throw new AssertionError(
      message || `Expected value to be one of ${JSON.stringify(allowed)} but got ${JSON.stringify(value)}`,
      allowed,
      value
    );
  }
};

assert.rejects = async function(asyncFn, message) {
  let threw = false;
  let thrownError;
  
  try {
    await asyncFn();
  } catch (e) {
    thrownError = e;
    threw = true;
  }
  
  if (!threw) {
    throw new AssertionError(
      message || 'Expected function to reject but it resolved',
      'a rejection',
      'a resolution'
    );
  }
  
  return thrownError;
};

assert.eventually = async function(promise, checker, message) {
  const value = await promise;
  let result;
  try {
    result = checker(value);
  } catch (e) {
    throw new AssertionError(
      message || `Checker threw: ${e.message}`,
      'checker to return true without throwing',
      `checker threw: ${e.message}`
    );
  }
  
  if (!result) {
    throw new AssertionError(
      message || 'Eventually assertion failed',
      'checker to return true',
      `checker returned false for value: ${JSON.stringify(value).slice(0, 100)}`
    );
  }
};

assert.isNotNull = function(value, message) {
  if (value === null || value === undefined) {
    throw new AssertionError(
      message || `Expected non-null value but got ${value}`,
      'non-null value',
      value
    );
  }
};

assert.isEmpty = function(value, message) {
  const isEmpty = Array.isArray(value) || typeof value === 'string'
    ? value.length === 0
    : typeof value === 'object' && value !== null
    ? Object.keys(value).length === 0
    : false;
  if (!isEmpty) {
    throw new AssertionError(
      message || `Expected empty value but got ${JSON.stringify(value).slice(0, 50)}`,
      'empty',
      value
    );
  }
};

assert.isNotEmpty = function(value, message) {
  const isEmpty = Array.isArray(value) || typeof value === 'string'
    ? value.length === 0
    : typeof value === 'object' && value !== null
    ? Object.keys(value).length === 0
    : false;
  if (isEmpty) {
    throw new AssertionError(
      message || 'Expected non-empty value',
      'non-empty',
      value
    );
  }
};

assert.fail = function(message) {
  throw new AssertionError(message || 'Test failed');
};

assert.skip = function(message) {
  console.log(`   ⏭️  SKIP: ${message || 'No reason given'}`);
};

// Snapshot assertion (for regression testing)
assert.snapshot = function(actual, snapshotName, update = false) {
  const snapshotDir = require('path').join(__dirname, 'snapshots');
  const snapshotPath = require('path').join(snapshotDir, `${snapshotName}.snap`);
  
  if (update || !require('fs').existsSync(snapshotPath)) {
    // Create or update snapshot
    if (!require('fs').existsSync(snapshotDir)) {
      require('fs').mkdirSync(snapshotDir, { recursive: true });
    }
    require('fs').writeFileSync(snapshotPath, JSON.stringify(actual, null, 2));
    return { updated: true };
  }
  
  // Check against existing snapshot
  const saved = JSON.parse(require('fs').readFileSync(snapshotPath, 'utf-8'));
  const actualStr = JSON.stringify(actual);
  const savedStr = JSON.stringify(saved);
  
  if (actualStr !== savedStr) {
    throw new AssertionError(
      `Snapshot mismatch for "${snapshotName}"`,
      saved,
      actual
    );
  }
  
  return { updated: false, matched: true };
};

module.exports = {
  AssertionError,
  assert
};
