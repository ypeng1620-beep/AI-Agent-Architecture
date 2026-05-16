/**
 * 渠道适配器抽象基类
 *
 * 所有外部渠道（微信、飞书、Telegram 等）都继承此类，
 * 实现具体的消息收发逻辑，同时复用 Gateway 的 IChannel 接口。
 */

import type { IChannel, ChannelType } from '../gateway/gateway.js'
import type { ChannelMessage, Session } from '../gateway/gateway.js'
import type { AdapterCapabilities } from '../protocol/adapterSchema.js'
import { DEFAULT_CAPABILITIES } from '../protocol/adapterSchema.js'
import { mkdir, rename, stat, writeFile } from 'fs/promises'
import { dirname } from 'path'
import {
  ExternalIngressGuard,
  type ExternalIngressDecisionReason,
  type ExternalIngressGuardConfig,
} from './externalIngressGuard.js'

// =============================================================================
// 适配器事件
// =============================================================================

export interface AdapterEvents {
  /** 收到用户消息 */
  onMessage?: (message: ChannelMessage, session: Session) => void | Promise<void>
  onIngressAudit?: (event: ExternalIngressAuditEvent) => void | Promise<void>
  /** 会话连接 */
  onConnect?: (session: Session) => void | Promise<void>
  /** 会话断开 */
  onDisconnect?: (session: Session, reason: string) => void | Promise<void>
  /** 错误 */
  onError?: (session: Session, error: Error) => void | Promise<void>
  /** 健康检查 */
  onHealthCheck?: () => Record<string, unknown> | Promise<Record<string, unknown>>
}

export interface ExternalIngressAuditEvent {
  eventType: 'external_ingress_rejected'
  provider: string
  channel: ChannelType
  reason: ExternalIngressDecisionReason
  messageId: string
  idempotencyKey: string
  externalUserId: string
  timestamp: number
}

// =============================================================================
// 外部渠道配置
// =============================================================================

export interface ExternalChannelConfig {
  /** 渠道类型 */
  type: ChannelType
  /** 能力声明 */
  capabilities?: AdapterCapabilities
  /** 事件回调 */
  events?: AdapterEvents
  /** 适配器私有配置 */
  adapterOptions?: Record<string, unknown>
  /** Standard inbound boundary guard. Real adapters should enable this before dispatch. */
  ingressGuard?: ExternalIngressGuard | (Omit<ExternalIngressGuardConfig, 'channel'> & { channel?: ChannelType })
  /** Optional JSONL path for rejected ingress audit persistence. */
  ingressAuditLogPath?: string
  /** Rotate the JSONL file once it reaches this size. */
  ingressAuditMaxBytes?: number
  /** Fail adapter start if external ingress safety controls are incomplete. */
  requireProductionReady?: boolean
  /** 消息去重窗口（毫秒，默认 5s） */
  dedupWindowMs?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 重试间隔（毫秒） */
  retryIntervalMs?: number
}

// =============================================================================
// 消息去重器
// =============================================================================

export class MessageDeduplicator {
  private seen: Map<string, number> = new Map()
  private windowMs: number

  constructor(windowMs: number = 5000) {
    this.windowMs = windowMs
  }

  /** 检查消息是否重复 */
  isDuplicate(messageId: string): boolean {
    const now = Date.now()
    const seenAt = this.seen.get(messageId)
    if (seenAt && now - seenAt < this.windowMs) {
      return true
    }
    this.seen.set(messageId, now)
    this.cleanup()
    return false
  }

  /** 清理过期记录 */
  private cleanup(): void {
    const now = Date.now()
    for (const [id, timestamp] of this.seen) {
      if (now - timestamp > this.windowMs) {
        this.seen.delete(id)
      }
    }
  }

  get size(): number {
    return this.seen.size
  }
}

// =============================================================================
// 外部渠道抽象基类
// =============================================================================

export abstract class ExternalChannel implements IChannel {
  protected config: Required<Omit<ExternalChannelConfig, 'ingressGuard' | 'ingressAuditLogPath' | 'ingressAuditMaxBytes' | 'requireProductionReady'>> & {
    ingressAuditLogPath?: string
    ingressAuditMaxBytes?: number
    requireProductionReady?: boolean
  }
  protected sessions: Map<string, Session> = new Map()
  protected deduplicator: MessageDeduplicator
  protected ingressGuard?: ExternalIngressGuard
  protected ingressRejections: Partial<Record<ExternalIngressDecisionReason, number>> = {}
  protected recentIngressAudits: ExternalIngressAuditEvent[] = []
  protected running: boolean = false

  constructor(config: ExternalChannelConfig) {
    this.config = {
      type: config.type,
      capabilities: config.capabilities ?? DEFAULT_CAPABILITIES,
      events: config.events ?? {},
      adapterOptions: config.adapterOptions ?? {},
      dedupWindowMs: config.dedupWindowMs ?? 5000,
      maxRetries: config.maxRetries ?? 3,
      retryIntervalMs: config.retryIntervalMs ?? 1000,
      ingressAuditLogPath: config.ingressAuditLogPath,
      ingressAuditMaxBytes: config.ingressAuditMaxBytes,
      requireProductionReady: config.requireProductionReady,
    }
    this.deduplicator = new MessageDeduplicator(this.config.dedupWindowMs)
    if (config.ingressGuard instanceof ExternalIngressGuard) {
      this.ingressGuard = config.ingressGuard
    } else if (config.ingressGuard) {
      this.ingressGuard = new ExternalIngressGuard({
        channel: config.ingressGuard.channel ?? config.type,
        dedupWindowMs: config.ingressGuard.dedupWindowMs ?? config.dedupWindowMs ?? 5000,
        requireSignature: config.ingressGuard.requireSignature,
        secret: config.ingressGuard.secret,
        rateLimit: config.ingressGuard.rateLimit,
      })
    }
  }

  abstract start(): Promise<void>
  abstract stop(): Promise<void>
  abstract send(message: ChannelMessage, session?: Session): Promise<void>

  async broadcast(message: Omit<ChannelMessage, 'id' | 'timestamp'>): Promise<void> {
    // 外部渠道通常不支持广播
    console.warn(`[ExternalChannel:${this.config.type}] Broadcast not supported`)
  }

  getType(): ChannelType {
    return this.config.type
  }

  getStats(): Record<string, unknown> {
    return {
      type: this.config.type,
      activeSessions: this.sessions.size,
      dedupCacheSize: this.deduplicator.size,
      ingressGuard: this.ingressGuard?.getStats(),
      ingressRejections: { ...this.ingressRejections },
      recentIngressAudits: [...this.recentIngressAudits],
      auditPersistence: {
        logPath: this.config.ingressAuditLogPath,
        maxBytes: this.config.ingressAuditMaxBytes,
      },
      running: this.running,
    }
  }

  getCapabilities(): AdapterCapabilities {
    return this.config.capabilities
  }

  /** 创建或获取会话 */
  protected getOrCreateSession(externalId: string, metadata: Record<string, unknown> = {}): Session {
    let session = this.sessions.get(externalId)
    if (!session) {
      session = {
        id: externalId,
        channel: this.config.type,
        connectedAt: Date.now(),
        lastActiveAt: Date.now(),
        metadata: {
          externalId,
          ...metadata,
        },
      }
      this.sessions.set(externalId, session)
      this.events.onConnect?.(session)
    } else {
      session.lastActiveAt = Date.now()
    }
    return session
  }

  /** 移除会话 */
  protected removeSession(externalId: string, reason: string = 'session_ended'): void {
    const session = this.sessions.get(externalId)
    if (session) {
      this.sessions.delete(externalId)
      this.events.onDisconnect?.(session, reason)
    }
  }

  /** 处理入站消息（带去重） */
  protected async handleInboundMessage(
    messageId: string,
    externalUserId: string,
    content: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const timestamp = Date.now()
    let idempotencyKey: string | undefined

    if (this.ingressGuard) {
      const signature = typeof metadata.signature === 'string' ? metadata.signature : undefined
      const decision = this.ingressGuard.inspect({
        channel: this.config.type,
        messageId,
        externalUserId,
        content,
        timestamp,
        signature,
        metadata,
      })

      if (!decision.allowed) {
        this.ingressRejections[decision.reason] = (this.ingressRejections[decision.reason] ?? 0) + 1
        await this.recordIngressRejectionAudit(
          decision.reason,
          decision.idempotencyKey,
          messageId,
          externalUserId,
          metadata,
          timestamp,
        )
        return
      }

      idempotencyKey = decision.idempotencyKey
    } else if (this.deduplicator.isDuplicate(messageId)) {
      return
    }

    const session = this.getOrCreateSession(externalUserId, metadata)

    const message: ChannelMessage = {
      id: messageId,
      role: 'user',
      content,
      timestamp,
      channel: this.config.type,
      sessionId: session.id,
      userId: externalUserId,
      conversationId: externalUserId,
      metadata: {
        ...metadata,
        ...(idempotencyKey ? { idempotencyKey } : {}),
      },
    }

    await this.events.onMessage?.(message, session)
  }

  /** 带重试的发送 */
  private async recordIngressRejectionAudit(
    reason: ExternalIngressDecisionReason,
    idempotencyKey: string,
    messageId: string,
    externalUserId: string,
    metadata: Record<string, unknown>,
    timestamp: number,
  ): Promise<void> {
    const provider = typeof metadata.provider === 'string' ? metadata.provider : String(this.config.type)
    const event: ExternalIngressAuditEvent = {
      eventType: 'external_ingress_rejected',
      provider,
      channel: this.config.type,
      reason,
      messageId,
      idempotencyKey,
      externalUserId,
      timestamp,
    }

    this.recentIngressAudits.unshift(event)
    this.recentIngressAudits = this.recentIngressAudits.slice(0, 50)
    await this.persistIngressAudit(event)
    await this.events.onIngressAudit?.(event)
  }

  private async persistIngressAudit(event: ExternalIngressAuditEvent): Promise<void> {
    const logPath = this.config.ingressAuditLogPath
    if (!logPath) {
      return
    }

    await mkdir(dirname(logPath), { recursive: true })
    await this.rotateIngressAuditIfNeeded(logPath)
    await writeFile(logPath, `${JSON.stringify(event)}\n`, { flag: 'a' })
  }

  private async rotateIngressAuditIfNeeded(logPath: string): Promise<void> {
    const maxBytes = this.config.ingressAuditMaxBytes
    if (!maxBytes || maxBytes <= 0) {
      return
    }

    try {
      const current = await stat(logPath)
      if (current.size < maxBytes) {
        return
      }
      await rename(logPath, `${logPath}.1`)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') {
        throw error
      }
    }
  }

  protected async sendWithRetry(
    sendFn: () => Promise<void>,
    retries: number = 0,
  ): Promise<void> {
    try {
      await sendFn()
    } catch (error) {
      if (retries < this.config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryIntervalMs * Math.pow(2, retries)))
        return this.sendWithRetry(sendFn, retries + 1)
      }
      throw error
    }
  }

  /** 获取事件回调 */
  protected get events(): AdapterEvents {
    return this.config.events
  }

  isRunning(): boolean {
    return this.running
  }
}
