/**
 * 飞书渠道适配器
 *
 * 对接飞书开放平台（事件订阅 + 消息发送 API）。
 * 实现 IChannel 接口，复用 Gateway 的消息路由。
 *
 * 特性：
 * - 事件订阅模式（webhook push）
 * - 富文本卡片消息（支持审批按钮）
 * - 群聊支持
 * - 文件/图片上传
 * - 消息去重
 */

import { createServer, Server } from 'http'
import express, { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { ExternalChannel, type ExternalChannelConfig } from './externalChannel.js'
import { assertExternalAdapterConfigReady } from './externalAdapterConfigValidation.js'
import type { Session, ChannelMessage } from '../gateway/gateway.js'
import type { AdapterCapabilities } from '../protocol/adapterSchema.js'

// =============================================================================
// 飞书消息类型
// =============================================================================

export interface FeishuMessage {
  /** 消息 ID */
  message_id: string
  /** 发送者 ID */
  sender: {
    sender_id: {
      open_id: string
      user_id?: string
      union_id?: string
    }
    sender_type: 'user' | 'app'
  }
  /** 接收者（chat ID） */
  chat_id: string
  /** 消息类型 */
  message_type: 'text' | 'image' | 'file' | 'audio' | 'media' | 'sticker' | 'interactive'
  /** 内容 */
  content: string
  /** 创建时间 */
  create_time: string
  /** 更新时间 */
  update_time: string
}

/** 飞书事件 */
export interface FeishuEvent {
  schema: string
  header: {
    event_id: string
    event_type: string
    create_time: string
    token: string
    app_id: string
    tenant_key: string
  }
  event: {
    message?: FeishuMessage
    sender?: { sender_id: { open_id: string } }
    chat_id?: string
    operator?: { open_id: string }
    [key: string]: unknown
  }
}

/** 飞书配置 */
export interface FeishuAdapterConfig extends ExternalChannelConfig {
  adapterOptions: {
    /** 飞书 App ID */
    appId: string
    /** 飞书 App Secret */
    appSecret: string
    /** 事件订阅 Verification Token */
    verificationToken?: string
    /** 事件订阅 Encrypt Key */
    encryptKey?: string
    /** 服务器端口 */
    port?: number
    /** 事件订阅路径 */
    path?: string
  }
}

/** 飞书能力 */
export const FEISHU_CAPABILITIES: AdapterCapabilities = {
  richMessages: true,
  fileUpload: true,
  typingIndicator: true,
  groupChat: true,
  approvalButtons: true,
  maxMessageLength: 30000,
  supportsStreaming: false,
  supportedContentTypes: ['text', 'image', 'file', 'interactive_card', 'audio'],
}

// =============================================================================
// 飞书渠道
// =============================================================================

export class FeishuChannel extends ExternalChannel {
  private server?: Server
  private tenantAccessToken: string | null = null
  private tokenExpiry: number = 0
  private feishuConfig: FeishuAdapterConfig
  private feishuCapabilities: AdapterCapabilities
  private tokenRefreshTimer?: NodeJS.Timeout

  constructor(config: FeishuAdapterConfig) {
    super({
      ...config,
      type: config.type ?? 'feishu',
      capabilities: config.capabilities ?? FEISHU_CAPABILITIES,
    })
    this.feishuConfig = config
    this.feishuCapabilities = config.capabilities ?? FEISHU_CAPABILITIES
  }

  async start(): Promise<void> {
    if (this.config.requireProductionReady) {
      assertExternalAdapterConfigReady(this.feishuConfig, { strict: true })
    }

    const app = express()
    app.use(express.json())

    const path = this.feishuConfig.adapterOptions.path ?? '/feishu'

    // POST: 接收事件
    app.post(path, async (req: Request, res: Response) => {
      try {
        const body = req.body as FeishuEvent

        // URL 验证挑战
        if (body.header?.event_type === 'url_verification') {
          res.json({ challenge: (body.event as any)?.challenge })
          return
        }

        // 验证 token
        if (this.feishuConfig.adapterOptions.verificationToken) {
          if (body.header?.token !== this.feishuConfig.adapterOptions.verificationToken) {
            res.status(403).json({ error: 'Invalid token' })
            return
          }
        }

        // 处理消息事件
        if (body.header?.event_type === 'im.message.receive_v1' && body.event?.message) {
          const message = body.event.message as FeishuMessage

          // 解析文本内容
          let content = message.content
          if (message.message_type === 'text') {
            try {
              const parsed = JSON.parse(content)
              content = parsed.text ?? content
            } catch {
              // 已经是纯文本
            }
          }

          const openId = message.sender?.sender_id?.open_id ?? 'unknown'
          const metadata: Record<string, unknown> = {
            messageType: message.message_type,
            chatId: message.chat_id,
            messageId: message.message_id,
          }

          await this.handleInboundMessage(
            message.message_id,
            openId,
            content,
            metadata,
          )
        }

        // 飞书要求 3s 内响应 200
        res.json({ code: 0 })
      } catch (error) {
        console.error('[Feishu] Error handling event:', error)
        res.json({ code: 0 }) // 仍然返回 200
      }
    })

    // 获取 tenant access token
    await this.refreshToken()

    // 启动服务器
    const port = this.feishuConfig.adapterOptions.port ?? 8082
    this.server = createServer(app)

    await new Promise<void>((resolve, reject) => {
      this.server!.listen(port, () => {
        console.log(`[Feishu] Channel listening on port ${port}, path ${path}`)
        this.running = true
        resolve()
      })
      this.server!.on('error', reject)
    })

    // 定时刷新 token
    this.tokenRefreshTimer = setInterval(() => this.refreshToken(), 7000 * 1000)
  }

  async stop(): Promise<void> {
    this.running = false
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer)
      this.tokenRefreshTimer = undefined
    }
    if (this.server) {
      await new Promise<void>(resolve => this.server!.close(() => resolve()))
      this.server = undefined
    }
    this.sessions.clear()
  }

  /** 发送消息 */
  async send(message: ChannelMessage, session?: Session): Promise<void> {
    const openId = session?.metadata?.externalId as string | undefined
    const chatId = session?.metadata?.chatId as string | undefined

    if (!openId && !chatId) {
      throw new Error('Feishu send: no openId or chatId in session metadata')
    }

    await this.sendWithRetry(async () => {
      if (chatId) {
        await this.sendToChat(chatId, message.content)
      } else if (openId) {
        await this.sendToUser(openId, message.content)
      }
    })
  }

  /** 发送审批请求（卡片消息带按钮） */
  async sendApprovalRequest(
    openId: string,
    requestId: string,
    toolName: string,
    riskLevel: number,
  ): Promise<void> {
    const card = {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: '🔒 工具调用审批' },
        template: 'orange',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**工具**: ${toolName}\n**风险等级**: ${riskLevel}/10\n**请求 ID**: ${requestId}`,
          },
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '✅ 批准' },
              type: 'primary',
              value: { action: 'approve', requestId },
            },
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '❌ 拒绝' },
              type: 'danger',
              value: { action: 'reject', requestId },
            },
          ],
        },
      ],
    }

    await this.sendInteractiveCard(openId, card)
  }

  /** 显示输入中状态 */
  async showTyping(openId: string): Promise<void> {
    // 飞书支持输入中状态
    try {
      const token = await this.getAccessToken()
      const url = `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id`
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receive_id: openId,
          msg_type: 'typing',
          content: JSON.stringify({ text: 'typing...' }),
        }),
      })
    } catch {
      // 忽略输入中状态失败
    }
  }

  /** 获取统计 */
  getStats(): Record<string, unknown> {
    return {
      ...super.getStats(),
      type: 'feishu',
      appId: this.feishuConfig.adapterOptions.appId,
      tokenValid: Date.now() < this.tokenExpiry,
    }
  }

  getCapabilities(): AdapterCapabilities {
    return this.feishuCapabilities
  }

  // =============================================================================
  // 私有方法
  // =============================================================================

  private async refreshToken(): Promise<void> {
    try {
      const { appId, appSecret } = this.feishuConfig.adapterOptions
      const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
      })
      const data = await response.json() as { tenant_access_token?: string; expire?: number; code?: number; msg?: string }

      if (data.tenant_access_token) {
        this.tenantAccessToken = data.tenant_access_token
        this.tokenExpiry = Date.now() + (data.expire ?? 7200) * 1000
        console.log('[Feishu] Tenant access token refreshed')
      } else {
        console.warn('[Feishu] Failed to refresh token:', data.msg)
      }
    } catch (error) {
      console.error('[Feishu] Error refreshing token:', error)
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.tenantAccessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshToken()
    }
    if (!this.tenantAccessToken) {
      throw new Error('Feishu: no access token available')
    }
    return this.tenantAccessToken
  }

  private async sendToUser(openId: string, content: string): Promise<void> {
    const token = await this.getAccessToken()
    const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: openId,
        msg_type: 'text',
        content: JSON.stringify({ text: content }),
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(`Feishu send error: ${JSON.stringify(data)}`)
    }
  }

  private async sendToChat(chatId: string, content: string): Promise<void> {
    const token = await this.getAccessToken()
    const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({ text: content }),
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(`Feishu send error: ${JSON.stringify(data)}`)
    }
  }

  private async sendInteractiveCard(openId: string, card: Record<string, unknown>): Promise<void> {
    const token = await this.getAccessToken()
    const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: openId,
        msg_type: 'interactive',
        content: JSON.stringify(card),
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(`Feishu card send error: ${JSON.stringify(data)}`)
    }
  }
}
