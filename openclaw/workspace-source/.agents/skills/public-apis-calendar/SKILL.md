---
name: public-apis-calendar
description: Calendar相关的免费API集合。包含16个API。
triggers:
  - "需要Calendar相关数据"
  - "调用CalendarAPI"
---

# Calendar API 集合

## 概述
本技能收录16个免费的Calendar相关API。

## 认证说明
- **无需认证**: 可以直接调用
- **API Key**: 需要申请API密钥
- **OAuth**: 需要OAuth认证

## 常用API快速调用
### Nager.Date
**认证**: No
**CORS**: No
```bash
curl -s "https://date.nager.at"
```

### Namedays Calendar
**认证**: No
**CORS**: Yes
```bash
curl -s "https://nameday.abalin.net"
```

### Non-Working Days
**认证**: No
**CORS**: Yes
```bash
curl -s "https://isdayoff.ru"
```

### UK Bank Holidays
**认证**: No
**CORS**: Unknown
```bash
curl -s "https://www.gov.uk/bank-holidays.json"
```

### Non-Working Days
**认证**: No
**CORS**: Unknown
```bash
curl -s "https://github.com/gadael/icsdb"
```


## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Nager.Date | No | Yes | No | 90+国家公共假日 |
| Namedays Calendar | No | Yes | Yes | 多国命名日 |
| Non-Working Days | No | Yes | Yes | 俄罗斯独联体美国工作日 |
| UK Bank Holidays | No | Yes | Unknown | 英国银行假日 |
| Public Holidays | apiKey | Yes | Yes | 国家地区宗教假日 |
| Calendarific | apiKey | Yes | Unknown | 全球假日 |
| Holidays | apiKey | Yes | Unknown | 假日历史数据 |
| Checkiday | apiKey | Yes | Unknown | 5000+假日API |
| Festivo Public Holidays | apiKey | Yes | Yes | 公共假日服务 |
| Google Calendar | OAuth | Yes | Unknown | 显示创建谷歌日历事件 |
| Church Calendar | No | No | Unknown | 天主教礼仪日历 |
| Czech Namedays Calendar | No | No | Unknown | 名字查找生日 |
| Hebrew Calendar | No | No | Unknown | 公历希伯来历转换 |
| LectServe | No | No | Unknown | 新教礼仪日历 |
| Non-Working Days | No | Yes | Unknown | 非工作日ICS数据库 |
| Russian Calendar | No | Yes | No | 俄罗斯假日检查 |
