---
name: wsl-vpn-split-tunneling
description: WSL2 环境下配置 VPN Split Tunneling，解决飞书等国内服务间歇性超时问题。
triggers:
  - "vpn 飞书 超时"
  - "wsl 网络 间歇性"
  - "github feishu 同时访问"
  - "wsl2 vpn split tunnel"
---

# WSL2 VPN Split Tunneling 配置

## 场景
WSL2 环境下开启 VPN 后，特定域名（飞书等）间歇性超时，但 GitHub 等正常。需要同时保证：
- 国外服务（GitHub）走 VPN 隧道
- 国内服务（飞书）走直连

## 诊断步骤

### 1. 检查 WSL DNS 解析
WSL 里可能没有 nslookup/host，用 Python 代替：
```python
import socket
domains = ["open.feishu.cn", "msg-frontier.feishu.cn", "applink.feishu.cn"]
for domain in domains:
    try:
        ip = socket.gethostbyname(domain)
        print(f"{domain} -> {ip}")
    except Exception as e:
        print(f"{domain} -> ERROR: {e}")
```

### 2. 测试各目标连通性
```bash
for host in "api.minimaxi.com" "open.feishu.cn" "github.com" "api.github.com"; do
  result=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" "https://$host")
  echo "$host: $result"
done
```

### 3. 检查 WSL 路由
```bash
ip route show
# default via 172.29.96.1 dev eth0 -> WSL 虚拟网关，所有流量经过 Windows NAT
```

## 核心解决：VPN Split Tunneling

在 VPN 客户端里开启 **Split Tunneling（分流隧道）**，把需要直连的域名加到绕过列表。

### 飞书域名/IP（2026-04 实测）
```
open.feishu.cn        -> 117.135.224.222
msg-frontier.feishu.cn -> 117.135.224.221
applink.feishu.cn     -> 117.135.224.220
lark-push.feishu.cn   -> 117.135.224.211
```

配置 VPN split tunneling 时添加：`.feishu.cn` 到绕过列表

### 不推荐的方式
- **Windows hosts 文件**（对 WSL2 **无效**）—— WSL2 的 DNS 解析通过 `/etc/resolv.conf` 的 nameserver 走 Windows VPN 虚拟适配器，hosts 文件无法干预 WSL 的 DNS 查询
- **WSL 静态路由**（复杂且不持久）—— 需要每次 VPN 重连后重新配置

## 验证
配置完 split tunneling 后重启 VPN，然后测试：
```bash
curl -s --max-time 10 -o /dev/null -w "%{http_code}" "https://github.com"
curl -s --max-time 10 -o /dev/null -w "%{http_code}" "https://open.feishu.cn"
```
两者都应返回 200/404（可达）
