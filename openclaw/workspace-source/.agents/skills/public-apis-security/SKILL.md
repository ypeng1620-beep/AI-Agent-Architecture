---
name: public-apis-security
description: Security相关免费API集合，包含28个API。
triggers:
  - "需要Security数据"
  - "调用SecurityAPI"
---

# Security API集合

## 概述
收录28个Security相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### Passwordinator
```bash
curl -s "https://github.com/fawazsullia/password-generator/"
```
### Dehash.lt
```bash
curl -s "https://github.com/Dehash-lt/api"
```
### FilterLists
```bash
curl -s "https://filterlists.com"
```
### EmailRep
```bash
curl -s "https://docs.emailrep.io/"
```
### NVD
```bash
curl -s "https://nvd.nist.gov/vuln/Data-Feeds/JSON-feed-changelog"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Passwordinator | No | Yes | Yes | 随机密码 |
| HaveIBeenPwned | apiKey | Yes | Unknown | 密码泄露 |
| Dehash.lt | No | Yes | Unknown | 哈希解密 |
| FilterLists | No | Yes | Unknown | 广告拦截器过滤列表 |
| EmailRep | No | Yes | Unknown | 邮件威胁预测 |
| Bugcrowd | apiKey | Yes | Unknown | 漏洞赏金 |
| HackerOne | apiKey | Yes | Unknown | 漏洞赏金 |
| GitGuardian | apiKey | Yes | No | 扫描秘密 |
| BinaryEdge | apiKey | Yes | Yes | 安全扫描 |
| Censys | apiKey | Yes | No | 互联网连接主机 |
| FraudLabs Pro | apiKey | Yes | Unknown | 欺诈检测 |
| FullHunt | apiKey | Yes | Unknown | 攻击面数据库 |
| GreyNoise | apiKey | Yes | Unknown | IP威胁数据 |
| Intelligence X | apiKey | Yes | Unknown | 开源情报 |
| NVD | No | Yes | Unknown | 国家漏洞数据库 |
| PhishStats | No | Yes | Unknown | 钓鱼数据库 |
| Pulsedive | apiKey | Yes | Unknown | 威胁情报 |
| SecurityTrails | apiKey | Yes | Unknown | WHOIS DNS记录 |
| Shodan | apiKey | Yes | Unknown | 互联网连接设备 |
| Spyse | apiKey | Yes | Unknown | 互联网资产数据 |
| VulDB | apiKey | Yes | Unknown | 漏洞数据库 |
| Botd | apiKey | Yes | Yes | 机器人检测 |
| FingerprintJS Pro | apiKey | Yes | Yes | 浏览器指纹 |
| LoginRadius | apiKey | Yes | Yes | 用户认证 |
| Mozilla http scanner | No | Yes | Unknown | HTTP扫描器 |
| Mozilla tls scanner | No | Yes | Unknown | TLS扫描器 |
| Privacy.com | apiKey | Yes | Unknown | 虚拟信用卡 |
| BitWarden | OAuth | Yes | Unknown | 密码管理器 |
