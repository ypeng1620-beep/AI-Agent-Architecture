/**
 * Context Bank - 轻量级 Agent 上下文管理工具
 * 
 * A lightweight, file-based context storage for AI agents
 * 
 * Usage:
 *   import { createContextBank } from './index.js';
 *   const bank = await createContextBank();
 *   await bank.addMessage('user', 'Hello');
 *   const messages = await bank.getMessages();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 创建 Context Bank 实例
 */
export async function createContextBank(options = {}) {
  const storagePath = options.storagePath || './context-bank.json';
  const data = await loadData(storagePath);
  
  const bank = {
    _data: data,
    _storagePath: storagePath,
    
    // 创建新会话
    create(name = 'default') {
      const id = generateId();
      this._data.sessions[id] = {
        id,
        name,
        createdAt: new Date().toISOString(),
        messages: [],
        metadata: {}
      };
      this._data.activeSession = id;
      return id;
    },
    
    // 切换会话
    switch(sessionId) {
      if (this._data.sessions[sessionId]) {
        this._data.activeSession = sessionId;
        return true;
      }
      return false;
    },
    
    // 获取当前会话ID
    getActiveSession() {
      return this._data.activeSession;
    },
    
    // 添加消息
    addMessage(role, content) {
      const sessionId = this._data.activeSession;
      if (!sessionId || !this._data.sessions[sessionId]) {
        throw new Error('No active session. Call create() first.');
      }
      
      const session = this._data.sessions[sessionId];
      session.messages.push({
        role,  // 'user' | 'assistant' | 'system'
        content,
        timestamp: new Date().toISOString()
      });
      
      return session.messages.length;
    },
    
    // 获取消息
    getMessages(limit = 10) {
      const sessionId = this._data.activeSession;
      if (!sessionId || !this._data.sessions[sessionId]) {
        return [];
      }
      
      const session = this._data.sessions[sessionId];
      const messages = session.messages;
      return messages.slice(-limit);
    },
    
    // 获取完整上下文（适合发送给AI）
    getContext(limit = 20) {
      const messages = this.getMessages(limit);
      return messages.map(m => ({
        role: m.role,
        content: m.content
      }));
    },
    
    // 压缩上下文
    compress(targetRatio = 0.5) {
      const sessionId = this._data.activeSession;
      if (!sessionId || !this._data.sessions[sessionId]) {
        return 0;
      }
      
      const session = this._data.sessions[sessionId];
      const messages = session.messages;
      
      // 保留所有 system 消息 + 最近的 50% 消息
      const systemMessages = messages.filter(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');
      const keepCount = Math.floor(otherMessages.length * targetRatio);
      const keptMessages = otherMessages.slice(-keepCount);
      
      session.messages = [...systemMessages, ...keptMessages];
      
      return session.messages.length;
    },
    
    // 获取消息数量
    getMessageCount() {
      const sessionId = this._data.activeSession;
      if (!sessionId || !this._data.sessions[sessionId]) {
        return 0;
      }
      return this._data.sessions[sessionId].messages.length;
    },
    
    // 保存到文件
    async save(filepath = null) {
      const fp = filepath || this._storagePath;
      fs.writeFileSync(fp, JSON.stringify(this._data, null, 2));
      return true;
    },
    
    // 列出所有会话
    list() {
      return Object.values(this._data.sessions).map(s => ({
        id: s.id,
        name: s.name,
        createdAt: s.createdAt,
        messageCount: s.messages.length
      }));
    },
    
    // 获取会话详情
    getSession(sessionId) {
      return this._data.sessions[sessionId] || null;
    },
    
    // 删除会话
    delete(sessionId) {
      if (this._data.sessions[sessionId]) {
        delete this._data.sessions[sessionId];
        if (this._data.activeSession === sessionId) {
          const sessions = Object.keys(this._data.sessions);
          this._data.activeSession = sessions[0] || null;
        }
        return true;
      }
      return false;
    },
    
    // 获取统计
    stats() {
      const sessions = Object.values(this._data.sessions);
      let totalMessages = 0;
      sessions.forEach(s => totalMessages += s.messages.length);
      
      return {
        sessionCount: sessions.length,
        totalMessages,
        activeSession: this._data.activeSession
      };
    }
  };
  
  return bank;
}

// 加载数据
async function loadData(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      const data = JSON.parse(content);
      return data;
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  
  // 返回默认结构
  return {
    sessions: {},
    activeSession: null
  };
}

// 导出类（备用）
export class ContextBank {
  constructor(options = {}) {
    this._storagePath = options.storagePath || './context-bank.json';
    this._data = { sessions: {}, activeSession: null };
    this._loaded = false;
  }
  
  async init() {
    this._data = await loadData(this._storagePath);
    this._loaded = true;
    return this;
  }
}

// 兼容 CommonJS
export default { createContextBank, ContextBank };
