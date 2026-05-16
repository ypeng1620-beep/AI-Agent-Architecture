---
name: public-apis-vehicle
description: Vehicle相关免费API集合，包含3个API。
triggers:
  - "需要Vehicle数据"
  - "调用VehicleAPI"
---

# Vehicle API集合

## 概述
收录3个Vehicle相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **OAuth**: 需要认证

## 常用API
### NHTSA
```bash
curl -s "https://vpic.nhtsa.dot.gov/api/"
```
### Brazilian Vehicles Fipe
```bash
curl -s "https://deividfortuna.github.io/fipe/"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| NHTSA | No | Yes | Unknown | 车辆列表 |
| Brazilian Vehicles Fipe | No | Yes | No | Fipe车辆数据 |
| Smartcar | OAuth | Yes | Yes | 解锁里程位置 |
