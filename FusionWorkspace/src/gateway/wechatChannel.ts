/**
 * 微信渠道适配器
 *
 * 对接微信公众号/企业微信/个人号（通过第三方框架如 wechaty）。
 * 实现 IChannel 接口，复用 Gateway 的消息路由。
 *
 * 特性：
 * - 消息去重（微信可能重复推送）
 * - 审批按钮支持（通过卡片消息）
 * - 富文本支持（图片、语音、文件）
 * - 群聊支持
 * - 用户标识映射（openId → userId）
 */

import { createServer, Server } from 'http'
import express, { Request, Response } from 'express'
import { createHash, randomUUID } from 'crypto'
import { ExternalChannel, type ExternalChannelConfig } from './externalChannel.js'
import { assertExternalAdapterConfigReady } from './externalAdapterConfigValidation.js'
import type { Session, ChannelMessage } from '../gateway/gateway.js'
import type { AdapterCapabilities } from '../protocol/adapterSchema.js'

// =============================================================================
// 微信消息类型
// =============================================================================

export interface WeChatMessage {
  /** 消息 ID */
  MsgId: string
  /** 发送者 openId */
  FromUserName: string
  /** 接收者（机器人）openId */
  ToUserName: string
  /** 消息类型 */
  MsgType: 'text' | 'image' | 'voice' | 'video' | 'shortvideo' | 'location' | 'link' | 'event'
  /** 文本内容 */
  Content?: string
  /** 图片 URL */
  PicUrl?: string
  /** 媒体 ID */
  MediaId?: string
  /** 语音格式 */
  Format?: string
  /** 地理位置 */
  Location_X?: string
  Location_Y?: string
  /** 事件类型 */
  Event?: 'subscribe' | 'unsubscribe' | 'CLICK' | 'VIEW' | 'SCAN'
  /** 事件 Key */
  EventKey?: string
  /** 创建时间 */
  CreateTime: number
}

/** 微信配置 */
export interface WeChatAdapterConfig extends ExternalChannelConfig {
  adapterOptions: {
    /** 公众号 AppID */
    appId: string
    /** 公众号 AppSecret */
    appSecret: string
    /** Token（验证用） */
    token: string
    /** EncodingAESKey */
    encodingAESKey?: string
    /** 是否为企业微信 */
    isWork?: boolean
    /** 企业微信 CorpId */
    corpId?: string
    /** 服务器端口 */
    port?: number
    /** Webhook 路径 */
    path?: string
  }
}

/** 微信能力 */
export const WECHAT_CAPABILITIES: AdapterCapabilities = {
  richMessages: true,
  fileUpload: true,
  typingIndicator: false,
  groupChat: true,
  approvalButtons: true,
  maxMessageLength: 2048,
  supportsStreaming: false,
  supportedContentTypes: ['text', 'image', 'voice', 'link', 'location'],
}

// =============================================================================
// 微信渠道
// =============================================================================

export class WeChatChannel extends ExternalChannel {
  private server?: Server
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private wcConfig: WeChatAdapterConfig
  private wcCapabilities: AdapterCapabilities
  private tokenRefreshTimer?: NodeJS.Timeout

  constructor(config: WeChatAdapterConfig) {
    super({
      ...config,
      type: config.type ?? 'wechat',
      capabilities: config.capabilities ?? WECHAT_CAPABILITIES,
    })
    this.wcConfig = config
    this.wcCapabilities = config.capabilities ?? WECHAT_CAPABILITIES
  }

  async start(): Promise<void> {
    if (this.config.requireProductionReady) {
      assertExternalAdapterConfigReady(this.wcConfig, { strict: true })
    }

    const app = express()
    app.use(express.text({ type: 'text/xml' }))
    app.use(express.json())

    const path = this.wcConfig.adapterOptions.path ?? '/wechat'

    // GET: 微信服务器验证
    app.get(path, (req: Request, res: Response) => {
      const signature = req.query.signature as string
      const timestamp = req.query.timestamp as string
      const nonce = req.query.nonce as string
      const echostr = req.query.echostr as string

      if (this.verifySignature(this.wcConfig.adapterOptions.token, timestamp, nonce, signature)) {
        res.send(echostr)
        console.log('[WeChat] Server verification passed')
      } else {
        res.status(403).send('Invalid signature')
      }
    })

    // POST: 接收消息
    app.post(path, async (req: Request, res: Response) => {
      try {
        // 微信推送的是 XML，这里简化处理
        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
        const message = this.parseWeChatMessage(body)

        if (!message) {
          res.send('success')
          return
        }

        // 处理事件
        if (message.MsgType === 'event') {
          await this.handleEvent(message)
          res.send('success')
          return
        }

        // 处理消息
        const content = message.Content ?? message.PicUrl ?? `[${message.MsgType} message]`
        const metadata: Record<string, unknown> = {
          msgType: message.MsgType,
          mediaId: message.MediaId,
          fromUserName: message.FromUserName,
        }

        await this.handleInboundMessage(
          message.MsgId || randomUUID(),
          message.FromUserName,
          content,
          metadata,
        )

        // 微信要求 5s 内响应
        res.send('success')
      } catch (error) {
        console.error('[WeChat] Error handling message:', error)
        res.send('success') // 仍然返回 success 避免微信重试
      }
    })

    // 获取 access token
    await this.refreshAccessToken()

    // 启动服务器
    const port = this.wcConfig.adapterOptions.port ?? 8081
    this.server = createServer(app)

    await new Promise<void>((resolve, reject) => {
      this.server!.listen(port, () => {
        console.log(`[WeChat] Channel listening on port ${port}, path ${path}`)
        this.running = true
        resolve()
      })
      this.server!.on('error', reject)
    })

    // 定时刷新 token
    this.tokenRefreshTimer = setInterval(() => this.refreshAccessToken(), 7000 * 1000)
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

  /** 发送消息给用户 */
  async send(message: ChannelMessage, session?: Session): Promise<void> {
    const openId = session?.metadata?.externalId as string | undefined
    if (!openId) {
      throw new Error('WeChat send: no openId in session metadata')
    }

    await this.sendWithRetry(async () => {
      await this.sendCustomerMessage(openId, message.content)
    })
  }

  /** 发送审批请求（卡片消息） */
  async sendApprovalRequest(
    openId: string,
    requestId: string,
    toolName: string,
    riskLevel: number,
  ): Promise<void> {
    // 微信卡片消息格式
    const cardContent = [
      `🔒 需要审批`,
      ``,
      `工具: ${toolName}`,
      `风险等级: ${riskLevel}/10`,
      `请求ID: ${requestId}`,
      ``,
      `回复以下任一指令:`,
      `approve ${requestId} — 批准`,
      `reject ${requestId} — 拒绝`,
    ].join('\n')

    await this.sendCustomerMessage(openId, cardContent)
  }

  /** 获取统计 */
  getStats(): Record<string, unknown> {
    return {
      ...super.getStats(),
      type: 'wechat',
      appId: this.wcConfig.adapterOptions.appId,
      tokenValid: Date.now() < this.tokenExpiry,
    }
  }

  getCapabilities(): AdapterCapabilities {
    return this.wcCapabilities
  }

  // =============================================================================
  // 私有方法
  // =============================================================================

  private verifySignature(token: string, timestamp: string, nonce: string, signature: string): boolean {
    const arr = [token, timestamp, nonce].sort()
    const str = arr.join('')
    const hash = createHash('sha1').update(str).digest('hex')
    return hash === signature
  }

  private parseWeChatMessage(xmlBody: string): WeChatMessage | null {
    // 简化 XML 解析（生产环境应使用 xml2js 等库）
    const extract = (tag: string): string | undefined => {
      const match = xmlBody.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'))
      return match?.[1]?.trim()
    }

    const msgType = extract('MsgType')
    if (!msgType) return null

    return {
      MsgId: extract('MsgId') ?? randomUUID(),
      FromUserName: extract('FromUserName') ?? '',
      ToUserName: extract('ToUserName') ?? '',
      MsgType: msgType as WeChatMessage['MsgType'],
      Content: extract('Content'),
      PicUrl: extract('PicUrl'),
      MediaId: extract('MediaId'),
      Format: extract('Format'),
      Location_X: extract('Location_X'),
      Location_Y: extract('Location_Y'),
      Event: extract('Event') as WeChatMessage['Event'],
      EventKey: extract('EventKey'),
      CreateTime: parseInt(extract('CreateTime') ?? '0', 10),
    }
  }

  private async handleEvent(message: WeChatMessage): Promise<void> {
    const session = this.getOrCreateSession(message.FromUserName, {
      msgType: 'event',
      event: message.Event,
    })

    if (message.Event === 'subscribe') {
      // 关注事件：发送欢迎消息
      await this.sendCustomerMessage(message.FromUserName, '欢迎关注！我是 AI 助手，有什么可以帮您的？')
    } else if (message.Event === 'unsubscribe') {
      // 取消关注：清理会话
      this.removeSession(message.FromUserName, 'unsubscribed')
    } else if (message.Event === 'CLICK') {
      // 菜单点击：EventKey 可能包含审批指令
      await this.handleInboundMessage(
        randomUUID(),
        message.FromUserName,
        message.EventKey ?? '',
        { eventType: 'menu_click' },
      )
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const { appId, appSecret } = this.wcConfig.adapterOptions
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
      const response = await fetch(url)
      const data = await response.json() as { access_token?: string; expires_in?: number; errcode?: number; errmsg?: string }

      if (data.access_token) {
        this.accessToken = data.access_token
        this.tokenExpiry = Date.now() + (data.expires_in ?? 7200) * 1000
        console.log('[WeChat] Access token refreshed')
      } else {
        console.warn('[WeChat] Failed to refresh access token:', data.errmsg)
      }
    } catch (error) {
      console.error('[WeChat] Error refreshing access token:', error)
    }
  }

  private async sendCustomerMessage(openId: string, content: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('WeChat: no access token available')
    }

    const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${this.accessToken}`
    const body = {
      touser: openId,
      msgtype: 'text',
      text: { content },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json() as { errcode?: number; errmsg?: string }
    if (data.errcode && data.errcode !== 0) {
      throw new Error(`WeChat send error: ${data.errmsg}`)
    }
  }
}
