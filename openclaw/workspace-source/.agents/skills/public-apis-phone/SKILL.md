---
name: public-apis-phone
description: Phone相关免费API集合，包含5个API。
triggers:
  - "需要Phone数据"
  - "调用PhoneAPI"
---

# Phone API集合

## 概述
收录5个Phone相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请

## 常用API
### Phone Specification
```bash
curl -s "https://github.com/azharimm/phone-specs-api"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Phone Specification | No | Yes | Yes | 手机规格 |
| Cloudmersive Validate | apiKey | Yes | Yes | 电话验证 |
| Phone Validation | apiKey | Yes | Yes | 全球电话验证 |
| Numverify | apiKey | Yes | Unknown | 电话号码验证 |
| Veriphone | apiKey | Yes | Yes | 电话验证运营商查询 |
