---
name: public-apis-geocoding
description: Geocoding相关免费API集合，包含20个API。
triggers:
  - "需要Geocoding数据"
  - "调用GeocodingAPI"
---

# Geocoding API集合

## 概述
收录20个Geocoding相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请

## 常用API
### REST Countries
```bash
curl -s "https://restcountries.com"
```
### Nominatim
```bash
curl -s "https://nominatim.openstreetmap.org/"
```
### GeoJS
```bash
curl -s "https://www.geojs.io/"
```
### Postcodes.io
```bash
curl -s "https://postcodes.io"
```
### Country
```bash
curl -s "http://country.is/"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| REST Countries | No | Yes | Yes | 国家信息 |
| Nominatim | No | Yes | Yes | OpenStreetMap地理编码 |
| GeoJS | No | Yes | Yes | IP地理定位 |
| Postcodes.io | No | Yes | Yes | 英国邮编查询 |
| Country | No | Yes | Yes | 从IP获取国家 |
| ipapi.co | No | Yes | Yes | IP位置信息 |
| IPGEO | No | Yes | Unknown | 无限免费IP API |
| Apiip | apiKey | Yes | Yes | IP地理定位 |
| CountryStateCity | apiKey | Yes | Yes | 世界城市 |
| Geoapify | apiKey | Yes | Yes | 正向反向地理编码 |
| LocationIQ | apiKey | Yes | Yes | 正向反向地理编码 |
| OpenCage | apiKey | Yes | Yes | 正向反向地理编码 |
| Geocodify.com | apiKey | Yes | Yes | 地理编码自动补全 |
| Telize | apiKey | Yes | Yes | IP地理定位 |
| IP Geolocation | apiKey | Yes | Yes | IP地理定位 |
| ipgeolocation | apiKey | Yes | Yes | IP地理定位30k/月 |
| ipstack | apiKey | Yes | Unknown | IP地理定位 |
| IP2Location | apiKey | Yes | Unknown | IP地理定位55+参数 |
| BigDataCloud | apiKey | Yes | Unknown | IP地理定位安全 |
| Geocod.io | apiKey | Yes | Unknown | 地址地理编码 |
