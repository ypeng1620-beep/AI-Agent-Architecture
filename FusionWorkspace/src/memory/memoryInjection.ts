/**
 * Memory Injection — 记忆注入策略
 *
 * 确保每次 TAOR 循环启动和每轮推理时都稳定注入正确的上下文。
 *
 * 注入优先级：
 * 1. Profile（用户画像）— 最高优先级，始终注入
 * 2. Session（会话上下文）— 最近 N 轮摘要
 * 3. Knowledge（相关知识）— 按查询关键词检索
 * 4. Episodic（相似历史）— 按工具名检索
 *
 * 注入策略：
 * - 启动时注入：Profile + 最近 Session 摘要
 * - 每轮注入：Session 最新摘要 + 相关知识 + 相似历史
 * - 预算控制：注入内容不超过 token 预算的 20%
 */

import type { LayeredMemoryManager } from './layeredMemory.js'
import type { TrajectoryCompressor } from './trajectoryCompression.js'

// =============================================================================
// 类型定义
// =============================================================================

/** 注入配置 */
export interface MemoryInjectionConfig {
  /** 最大注入 token 数（估算，默认 2000） */
  maxInjectionTokens?: number
  /** Profile 注入 token 占比（默认 30%） */
  profileTokenRatio?: number
  /** Session 注入 token 占比（默认 30%） */
  sessionTokenRatio?: number
  /** Knowledge 注入 token 占比（默认 25%） */
  knowledgeTokenRatio?: number
  /** Episodic 注入 token 占比（默认 15%） */
  episodicTokenRatio?: number
  /** 最大 Session 轮次（默认 5） */
  maxSessionTurns?: number
  /** 最大 Knowledge 条目（默认 3） */
  maxKnowledgeItems?: number
  /** 最大 Episodic 条目（默认 2） */
  maxEpisodicItems?: number
}

/** 注入结果 */
export interface MemoryInjectionResult {
  /** 注入的系统提示文本 */
  injectedText: string
  /** 各层注入的 token 估算 */
  tokenEstimate: {
    profile: number
    session: number
    knowledge: number
    episodic: number
    total: number
  }
  /** 是否被 token 预算截断 */
  wasTruncated: boolean
  /** 截断的层 */
  truncatedLayers: string[]
}

// =============================================================================
// 记忆注入器
// =============================================================================

export class MemoryInjector {
  private memory: LayeredMemoryManager
  private compressor?: TrajectoryCompressor
  private config: Required<MemoryInjectionConfig>

  constructor(memory: LayeredMemoryManager, compressor?: TrajectoryCompressor, config: MemoryInjectionConfig = {}) {
    this.memory = memory
    this.compressor = compressor
    this.config = {
      maxInjectionTokens: config.maxInjectionTokens ?? 2000,
      profileTokenRatio: config.profileTokenRatio ?? 0.3,
      sessionTokenRatio: config.sessionTokenRatio ?? 0.3,
      knowledgeTokenRatio: config.knowledgeTokenRatio ?? 0.25,
      episodicTokenRatio: config.episodicTokenRatio ?? 0.15,
      maxSessionTurns: config.maxSessionTurns ?? 5,
      maxKnowledgeItems: config.maxKnowledgeItems ?? 3,
      maxEpisodicItems: config.maxEpisodicItems ?? 2,
    }
  }

  /**
   * 启动时注入
   * 注入 Profile + 最近 Session 摘要
   */
  injectOnStartup(options: {
    userId?: string
    sessionId?: string
  }): MemoryInjectionResult {
    const parts: string[] = []
    const tokens = { profile: 0, session: 0, knowledge: 0, episodic: 0, total: 0 }
    const truncatedLayers: string[] = []

    // 1. Profile（始终注入）
    const profileText = this.memory.profile.formatForPrompt(options.userId)
    if (profileText) {
      const profileTokens = this.estimateTokens(profileText)
      const budget = this.config.maxInjectionTokens * this.config.profileTokenRatio
      if (profileTokens <= budget) {
        parts.push(profileText)
        tokens.profile = profileTokens
      } else {
        // 截断 Profile
        const truncated = this.truncateText(profileText, budget)
        parts.push(truncated)
        tokens.profile = budget
        truncatedLayers.push('profile')
      }
    }

    // 2. Session 摘要
    const sessionText = this.memory.session.formatForPrompt(this.config.maxSessionTurns, options.sessionId)
    if (sessionText) {
      const sessionTokens = this.estimateTokens(sessionText)
      const budget = this.config.maxInjectionTokens * this.config.sessionTokenRatio
      if (sessionTokens <= budget) {
        parts.push(sessionText)
        tokens.session = sessionTokens
      } else {
        const truncated = this.truncateText(sessionText, budget)
        parts.push(truncated)
        tokens.session = budget
        truncatedLayers.push('session')
      }
    }

    tokens.total = tokens.profile + tokens.session + tokens.knowledge + tokens.episodic

    return {
      injectedText: parts.length > 0 ? `\n--- Memory Context (Startup) ---\n${parts.join('\n')}\n--- End Memory Context ---\n` : '',
      tokenEstimate: tokens,
      wasTruncated: truncatedLayers.length > 0,
      truncatedLayers,
    }
  }

  /**
   * 每轮推理时注入
   * 注入 Session 最新摘要 + 相关知识 + 相似历史
   */
  injectPerTurn(options: {
    userId?: string
    sessionId?: string
    queryKeywords?: string[]
    currentToolName?: string
  }): MemoryInjectionResult {
    const parts: string[] = []
    const tokens = { profile: 0, session: 0, knowledge: 0, episodic: 0, total: 0 }
    const truncatedLayers: string[] = []

    // 1. Session 最新摘要
    const sessionText = this.memory.session.formatForPrompt(this.config.maxSessionTurns, options.sessionId)
    if (sessionText) {
      const sessionTokens = this.estimateTokens(sessionText)
      const budget = this.config.maxInjectionTokens * this.config.sessionTokenRatio
      if (sessionTokens <= budget) {
        parts.push(sessionText)
        tokens.session = sessionTokens
      } else {
        parts.push(this.truncateText(sessionText, budget))
        tokens.session = budget
        truncatedLayers.push('session')
      }
    }

    // 2. 相关知识
    if (options.queryKeywords && options.queryKeywords.length > 0) {
      const knowledgeText = this.memory.knowledge.formatForPrompt(options.queryKeywords, this.config.maxKnowledgeItems)
      if (knowledgeText) {
        const knowledgeTokens = this.estimateTokens(knowledgeText)
        const budget = this.config.maxInjectionTokens * this.config.knowledgeTokenRatio
        if (knowledgeTokens <= budget) {
          parts.push(knowledgeText)
          tokens.knowledge = knowledgeTokens
        } else {
          parts.push(this.truncateText(knowledgeText, budget))
          tokens.knowledge = budget
          truncatedLayers.push('knowledge')
        }
      }
    }

    // 3. 相似历史事件
    const episodicText = this.memory.episodic.formatForPrompt(options.currentToolName, this.config.maxEpisodicItems)
    if (episodicText) {
      const episodicTokens = this.estimateTokens(episodicText)
      const budget = this.config.maxInjectionTokens * this.config.episodicTokenRatio
      if (episodicTokens <= budget) {
        parts.push(episodicText)
        tokens.episodic = episodicTokens
      } else {
        parts.push(this.truncateText(episodicText, budget))
        tokens.episodic = budget
        truncatedLayers.push('episodic')
      }
    }

    tokens.total = tokens.profile + tokens.session + tokens.knowledge + tokens.episodic

    return {
      injectedText: parts.length > 0 ? `\n--- Memory Context (Turn) ---\n${parts.join('\n')}\n--- End Memory Context ---\n` : '',
      tokenEstimate: tokens,
      wasTruncated: truncatedLayers.length > 0,
      truncatedLayers,
    }
  }

  /**
   * 完整注入（启动 + 每轮）
   * 用于 TAOR 循环初始化
   */
  injectFull(options: {
    userId?: string
    sessionId?: string
    queryKeywords?: string[]
    currentToolName?: string
  }): MemoryInjectionResult {
    // 启动注入
    const startup = this.injectOnStartup({
      userId: options.userId,
      sessionId: options.sessionId,
    })

    // 每轮注入
    const perTurn = this.injectPerTurn({
      userId: options.userId,
      sessionId: options.sessionId,
      queryKeywords: options.queryKeywords,
      currentToolName: options.currentToolName,
    })

    // 合并
    const combinedText = startup.injectedText + perTurn.injectedText
    const combinedTokens = {
      profile: startup.tokenEstimate.profile + perTurn.tokenEstimate.profile,
      session: startup.tokenEstimate.session + perTurn.tokenEstimate.session,
      knowledge: startup.tokenEstimate.knowledge + perTurn.tokenEstimate.knowledge,
      episodic: startup.tokenEstimate.episodic + perTurn.tokenEstimate.episodic,
      total: startup.tokenEstimate.total + perTurn.tokenEstimate.total,
    }

    const allTruncated = [...startup.truncatedLayers, ...perTurn.truncatedLayers]

    return {
      injectedText: combinedText,
      tokenEstimate: combinedTokens,
      wasTruncated: allTruncated.length > 0,
      truncatedLayers: allTruncated,
    }
  }

  // =============================================================================
  // 私有方法
  // =============================================================================

  private estimateTokens(text: string): number {
    // 粗略估算：中文 ~1.5 字符/token，英文 ~4 字符/token
    // 统一按 3 字符/token 估算
    return Math.ceil(text.length / 3)
  }

  private truncateText(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 3
    if (text.length <= maxChars) return text
    return text.slice(0, maxChars) + '\n...[truncated due to token budget]'
  }
}
