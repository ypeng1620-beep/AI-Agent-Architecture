---
name: hermes-gateway-troubleshooting
description: Hermes Gateway 故障排查技巧——systemd 日志查看、Lark 连接状态判断
version: 1.0.0
author: Hermes Agent
tags: [hermes, gateway, troubleshooting, systemd, lark]
---

# Hermes Gateway 故障排查

## 查看日志

systemd 方式（最可靠）：
```bash
sudo journalctl -u hermes-gateway --since="1 hour ago" --no-pager | grep -E "ERROR|Lark|connected|disconnected" | tail -30
```

注意：`~/.hermes/logs/gateway.log` 只有 nohup 方式运行才有内容，systemd 服务不写这个文件。

## Lark/飞书连接状态判断

- `connected to wss://msg-frontier.feishu.cn` = 正常
- `disconnected` + `trying to reconnect` = 自动重连中，正常
- `connect failed, err: timed out` = 网络问题，hermes 会自动重试
- `no close frame received` = 偶发断开，gateway 自动重连
- `keepalive ping timeout` = 偶发，gateway 自动重连

## 关键教训：飞书 WebSocket 连通 ≠ 出站 HTTPS 正常

Gateway 进程与飞书保持 WebSocket 长连接时，**入站消息能收到**，但如果 WSL 到 `open.feishu.cn` 的 HTTPS 出站请求超时（常见于 VPN 环境），**回复发不出去**。

表现：飞书端看到消息发出，但 Hermes 无回复。日志里会看到：
```
[Lark] send attempt N/3 failed ... ConnectTimeout ... open.feishu.cn
```

解决：配置 VPN split tunneling，将 `*.feishu.cn` 绕过 VPN 直连。

飞书真实 IP 段（2026-04 实测）：
```
117.135.224.0/24  — open.feishu.cn / msg-frontier.feishu.cn / applink.feishu.cn / lark-push.feishu.cn
```

完整方案：在 VPN 客户端开启 split tunneling，添加 `*.feishu.cn` 到绕过列表。
Windows hosts 文件只能解决 DNS，需 VPN split tunneling 才能解决路由。

## 进程信息

```bash
ps aux | grep hermes
```

通常两个进程：
- `hermes-mcp`：主交互 Agent
- `hermes-gateway`：systemd 消息网关服务
