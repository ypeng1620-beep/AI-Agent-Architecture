/**
 * 模块化工具基类 - 所有工具的抽象父类
 * 
 * 设计思路：
 * 1. 所有工具有统一的生命周期：init() → run() → cleanup()
 * 2. 统一的错误处理和日志
 * 3. 统一的状态管理
 * 4. 子类只需实现核心逻辑
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 状态枚举
 */
const ModuleStatus = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  READY: 'ready',
  RUNNING: 'running',
  PAUSED: 'paused',
  ERROR: 'error',
  DISPOSED: 'disposed',
};

/**
 * 日志级别
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * 基类
 */
class BaseModule {
  constructor(name, options = {}) {
    this.name = name;
    this.status = ModuleStatus.IDLE;
    this.options = {
      logLevel: LogLevel.INFO,
      autoInit: true,
      stateFile: null,
      ...options,
    };
    
    this.state = {};
    this.errors = [];
    this.startTime = null;
    this.lastRun = null;
  }
  
  /**
   * 初始化
   */
  async init() {
    if (this.status !== ModuleStatus.IDLE) {
      this.warn(`Cannot init, status is ${this.status}`);
      return;
    }
    
    this.status = ModuleStatus.INITIALIZING;
    this.log(`Initializing...`);
    
    try {
      // 加载持久状态
      if (this.options.stateFile) {
        this.loadState();
      }
      
      // 调用子类初始化
      await this.onInit();
      
      this.status = ModuleStatus.READY;
      this.log(`Initialized successfully`);
    } catch (error) {
      this.status = ModuleStatus.ERROR;
      this.error(`Init failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 执行
   */
  async run(params = {}) {
    if (this.status !== ModuleStatus.READY && this.status !== ModuleStatus.PAUSED) {
      throw new Error(`Cannot run, status is ${this.status}`);
    }
    
    this.status = ModuleStatus.RUNNING;
    this.startTime = Date.now();
    this.log(`Running with params:`, params);
    
    try {
      const result = await this.onRun(params);
      
      this.lastRun = {
        at: Date.now(),
        duration: Date.now() - this.startTime,
        success: true,
        result,
      };
      
      this.status = ModuleStatus.READY;
      this.log(`Completed in ${this.lastRun.duration}ms`);
      
      return result;
    } catch (error) {
      this.status = ModuleStatus.ERROR;
      this.lastRun = {
        at: Date.now(),
        duration: Date.now() - this.startTime,
        success: false,
        error: error.message,
      };
      
      this.errors.push({
        at: Date.now(),
        message: error.message,
        stack: error.stack,
      });
      
      this.error(`Run failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 清理
   */
  async cleanup() {
    if (this.status === ModuleStatus.DISPOSED) {
      return;
    }
    
    this.log(`Cleaning up...`);
    
    try {
      await this.onCleanup();
      
      if (this.options.stateFile) {
        this.saveState();
      }
      
      this.status = ModuleStatus.DISPOSED;
      this.log(`Disposed`);
    } catch (error) {
      this.error(`Cleanup failed: ${error.message}`);
    }
  }
  
  /**
   * 暂停
   */
  pause() {
    if (this.status !== ModuleStatus.RUNNING && this.status !== ModuleStatus.READY) {
      return false;
    }
    this.status = ModuleStatus.PAUSED;
    this.log(`Paused`);
    return true;
  }
  
  /**
   * 恢复
   */
  resume() {
    if (this.status !== ModuleStatus.PAUSED) {
      return false;
    }
    this.status = ModuleStatus.READY;
    this.log(`Resumed`);
    return true;
  }
  
  /**
   * 获取状态摘要
   */
  getSummary() {
    return {
      name: this.name,
      status: this.status,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      lastRun: this.lastRun,
      errorCount: this.errors.length,
      recentErrors: this.errors.slice(-5),
    };
  }
  
  // ========== 子类可覆盖的方法 ==========
  
  /**
   * 初始化钩子
   */
  async onInit() {
    // 子类实现
  }
  
  /**
   * 执行钩子
   */
  async onRun(params) {
    throw new Error('Not implemented');
  }
  
  /**
   * 清理钩子
   */
  async onCleanup() {
    // 子类实现
  }
  
  // ========== 工具方法 ==========
  
  loadState() {
    try {
      if (fs.existsSync(this.options.stateFile)) {
        this.state = JSON.parse(fs.readFileSync(this.options.stateFile, 'utf8'));
        this.log(`State loaded: ${Object.keys(this.state).length} keys`);
      }
    } catch (e) {
      this.warn(`Failed to load state: ${e.message}`);
    }
  }
  
  saveState() {
    try {
      const dir = path.dirname(this.options.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.options.stateFile, JSON.stringify(this.state, null, 2));
    } catch (e) {
      this.error(`Failed to save state: ${e.message}`);
    }
  }
  
  log(...args) {
    if (this.options.logLevel <= LogLevel.INFO) {
      console.log(`[${this.name}]`, ...args);
    }
  }
  
  warn(...args) {
    if (this.options.logLevel <= LogLevel.WARN) {
      console.warn(`[${this.name}] WARN:`, ...args);
    }
  }
  
  error(...args) {
    if (this.options.logLevel <= LogLevel.ERROR) {
      console.error(`[${this.name}] ERROR:`, ...args);
    }
  }
  
  debug(...args) {
    if (this.options.logLevel <= LogLevel.DEBUG) {
      console.debug(`[${this.name}] DEBUG:`, ...args);
    }
  }
}

/**
 * 创建模块的工厂函数
 */
function createModule(name, handlers, options = {}) {
  class CustomModule extends BaseModule {
    async onInit() {
      if (handlers.init) await handlers.init.call(this);
    }
    async onRun(params) {
      if (handlers.run) return await handlers.run.call(this, params);
    }
    async onCleanup() {
      if (handlers.cleanup) await handlers.cleanup.call(this);
    }
  }
  
  return new CustomModule(name, options);
}

export {
  BaseModule,
  createModule,
  ModuleStatus,
  LogLevel,
};
