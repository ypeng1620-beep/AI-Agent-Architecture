---
name: public-apis-blockchain
description: Blockchain相关的免费API集合。包含11个API，所有信息来自public-apis项目。
triggers:
  - "需要Blockchain相关数据"
  - "调用BlockchainAPI"
  - "区块链相关的免费API"
---

# Blockchain API 集合

## 概述
本技能收录11个免费的Blockchain相关API，涵盖区块链相关的免费API。

## 认证说明
- **无需认证**: 这些API可以直接调用，无需任何API密钥
- **API Key**: 需要从对应平台申请API密钥

## 常用API快速调用

### Chainlink
**认证**: No
**HTTPS**: Yes
**CORS**: Unknown
**描述**: 混合智能合约

```bash
curl -s "https://chain.link/developer-resources"
```

### Helium
**认证**: No
**HTTPS**: Yes
**CORS**: Unknown
**描述**: Helium无线网络

```bash
curl -s "https://docs.helium.com/api/blockchain/introduction/"
```

### Chainpoint
**认证**: No
**HTTPS**: Yes
**CORS**: Unknown
**描述**: 锚定数据到比特币区块链

```bash
curl -s "https://tierion.com/chainpoint/"
```

### Walltime
**认证**: No
**HTTPS**: Yes
**CORS**: Unknown
**描述**: 市场信息

```bash
curl -s "https://walltime.info/api.html"
```


## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Bitquery | apiKey | Yes | Yes | 链上GraphQL和DEX API |
| Etherscan | apiKey | Yes | Yes | 以太坊浏览器API |
| The Graph | apiKey | Yes | Unknown | 以太坊索引协议 |
| Chainlink | No | Yes | Unknown | 混合智能合约 |
| Covalent | apiKey | Yes | Unknown | 多区块链数据聚合器 |
| Helium | No | Yes | Unknown | Helium无线网络 |
| Nownodes | apiKey | Yes | Unknown | 区块链即服务 |
| Watchdata | apiKey | Yes | Unknown | 以太坊区块链API |
| Chainpoint | No | Yes | Unknown | 锚定数据到比特币区块链 |
| Steem | No | No | No | 区块链博客社交媒体 |
| Walltime | No | Yes | Unknown | 市场信息 |

## 注意事项
- CORS列显示是否支持跨域请求。"Unknown"表示不确定，建议先测试。
- 部分API有速率限制，使用时请注意。
- 如需生产环境使用，建议查看官方文档了解详细限制。
