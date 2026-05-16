/**
 * Project Context Injector v1.0
 * 蒸馏自 Claude Code 项目理解机制
 * 
 * 功能：
 * 1. 识别项目类型（Node.js/Python/Go等）
 * 2. 提取项目元信息（依赖、脚本、入口）
 * 3. 理解项目结构（目录树、关键文件）
 * 4. 注入 context 到编码任务
 * 
 * 使用方式：
 * 在开始编码任务前，先调用 getProjectContext(cwd) 获取项目上下文
 */

const fs = require('fs');
const path = require('path');

// 项目签名文件
const PROJECT_SIGNATURES = {
  'package.json': { type: 'Node.js', parser: parseNodeProject },
  'requirements.txt': { type: 'Python', parser: parsePythonProject },
  'go.mod': { type: 'Go', parser: parseGoProject },
  'Cargo.toml': { type: 'Rust', parser: parseRustProject },
  'pom.xml': { type: 'Java/Maven', parser: parseMavenProject },
  'BUILD.bazel': { type: 'Bazel', parser: parseBazelProject },
  'CMakeLists.txt': { type: 'C++/CMake', parser: parseCMakeProject },
  'setup.py': { type: 'Python', parser: parsePythonSetup },
  'Pipfile': { type: 'Python/Pipenv', parser: parsePipfile },
  'pyproject.toml': { type: 'Python/Poetry', parser: parsePoetry },
  'go.sum': { type: 'Go', parser: parseGoProject },
  'package-lock.json': { type: 'Node.js', parser: parseNodeProject },
  'yarn.lock': { type: 'Node.js/Yarn', parser: parseNodeProject },
};

/**
 * 获取项目根目录
 */
function findProjectRoot(cwd) {
  let dir = cwd;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return cwd;
}

/**
 * 检测项目类型
 */
function detectProjectType(projectRoot) {
  for (const [file, config] of Object.entries(PROJECT_SIGNATURES)) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      return { type: config.type, config, root: projectRoot };
    }
  }
  return { type: 'Unknown', config: null, root: projectRoot };
}

/**
 * 扫描目录树（限制深度）
 */
function scanDirectoryTree(dir, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return null;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = {
    name: path.basename(dir),
    type: 'directory',
    children: []
  };
  
  for (const entry of entries) {
    // 跳过常见忽略目录
    if (['node_modules', '.git', '__pycache__', 'dist', 'build', 'target', '.venv', 'venv'].includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      const subTree = scanDirectoryTree(path.join(dir, entry.name), maxDepth, currentDepth + 1);
      if (subTree) {
        result.children.push(subTree);
      }
    } else {
      result.children.push({
        name: entry.name,
        type: 'file'
      });
    }
  }
  
  return result;
}

/**
 * 查找入口文件
 */
function findEntryPoints(projectRoot, projectType) {
  const entryPatterns = {
    'Node.js': ['index.js', 'src/index.js', 'app.js', 'server.js', 'main.js'],
    'Python': ['main.py', 'app.py', '__main__.py', 'src/main.py'],
    'Go': ['main.go'],
    'Rust': ['src/main.rs'],
    'Java/Maven': ['src/main/java/Main.java'],
  };
  
  const patterns = entryPatterns[projectType] || [];
  for (const pattern of patterns) {
    const fullPath = path.join(projectRoot, pattern);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * 解析 Node.js 项目
 */
function parseNodeProject(projectRoot) {
  const pkgFile = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgFile)) return {};
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    return {
      name: pkg.name,
      version: pkg.version,
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      main: pkg.main,
    };
  } catch {
    return {};
  }
}

/**
 * 解析 Python 项目
 */
function parsePythonProject(projectRoot) {
  const reqFile = path.join(projectRoot, 'requirements.txt');
  const deps = [];
  
  if (fs.existsSync(reqFile)) {
    const content = fs.readFileSync(reqFile, 'utf-8');
    deps.push(...content.split('\n').filter(l => l.trim() && !l.startsWith('#')));
  }
  
  return { dependencies: deps };
}

/**
 * 解析 Go 项目
 */
function parseGoProject(projectRoot) {
  const modFile = path.join(projectRoot, 'go.mod');
  if (!fs.existsSync(modFile)) return {};
  
  const content = fs.readFileSync(modFile, 'utf-8');
  const lines = content.split('\n');
  const module = lines[0]?.replace('module ', '').trim();
  
  return { module };
}

/**
 * 解析 Rust 项目
 */
function parseRustProject(projectRoot) {
  const cargoFile = path.join(projectRoot, 'Cargo.toml');
  if (!fs.existsSync(cargoFile)) return {};
  
  const content = fs.readFileSync(cargoFile, 'utf-8');
  const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
  const depsMatch = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
  
  return {
    name: nameMatch ? nameMatch[1] : null,
    dependencies: depsMatch ? depsMatch[1].split('\n').filter(l => l.trim()).length : 0,
  };
}

/**
 * 主函数：获取完整项目上下文
 */
function getProjectContext(cwd) {
  const projectRoot = findProjectRoot(cwd);
  const { type, root } = detectProjectType(projectRoot);
  const parser = PROJECT_SIGNATURES[Object.keys(PROJECT_SIGNATURES).find(f => 
    fs.existsSync(path.join(projectRoot, f))
  )]?.parser;
  
  const projectInfo = parser ? parser(projectRoot) : {};
  const entryPoint = findEntryPoints(projectRoot, type);
  const structure = scanDirectoryTree(projectRoot);
  
  return {
    projectRoot: root,
    projectType: type,
    ...projectInfo,
    entryPoint,
    structure,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 生成编码任务的上下文注入文本
 */
function injectContext(cwd) {
  const ctx = getProjectContext(cwd);
  
  let text = `# 项目上下文\n\n`;
  text += `- 项目路径: ${ctx.projectRoot}\n`;
  text += `- 项目类型: ${ctx.projectType}\n`;
  
  if (ctx.name) text += `- 项目名称: ${ctx.name}\n`;
  if (ctx.version) text += `- 版本: ${ctx.version}\n`;
  if (ctx.entryPoint) text += `- 入口文件: ${ctx.entryPoint}\n`;
  
  if (ctx.dependencies && ctx.dependencies.length > 0) {
    text += `\n## 主要依赖 (${ctx.dependencies.length}个)\n`;
    ctx.dependencies.slice(0, 10).forEach(dep => {
      text += `- ${dep}\n`;
    });
    if (ctx.dependencies.length > 10) {
      text += `- ...还有 ${ctx.dependencies.length - 10} 个\n`;
    }
  }
  
  if (ctx.scripts) {
    text += `\n## 可用脚本\n`;
    Object.entries(ctx.scripts).forEach(([name, cmd]) => {
      text += `- ${name}: ${cmd}\n`;
    });
  }
  
  text += `\n## 项目结构\n`;
  text += formatTree(ctx.structure, 0);
  
  return text;
}

function formatTree(node, depth) {
  if (!node || depth > 2) return '';
  let text = '';
  const indent = '  '.repeat(depth);
  
  if (depth === 0) {
    text += `${node.name}/\n`;
  } else {
    text += `${indent}├── ${node.name}/\n`;
  }
  
  if (node.children) {
    const items = node.children.slice(0, 8);
    items.forEach((child, i) => {
      const isLast = i === items.length - 1 && node.children.length <= 8;
      const prefix = depth === 0 ? '  ' : indent + (isLast ? '└── ' : '├── ');
      const childIndent = depth === 0 ? '    ' : indent + (isLast ? '    ' : '│   ');
      
      if (child.type === 'file') {
        text += `${childIndent}${prefix}${child.name}\n`;
      } else {
        text += `${childIndent}${prefix}${child.name}/\n`;
        text += formatTree(child, depth + 2);
      }
    });
    
    if (node.children.length > 8) {
      text += `${childIndent}└── ... 还有 ${node.children.length - 8} 项\n`;
    }
  }
  
  return text;
}

// CLI 接口
if (require.main === module) {
  const cwd = process.argv[2] || process.cwd();
  console.log(injectContext(cwd));
}

module.exports = { getProjectContext, injectContext };
