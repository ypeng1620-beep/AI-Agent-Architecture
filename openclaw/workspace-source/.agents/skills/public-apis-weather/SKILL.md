---
name: public-apis-weather
description: Weather相关免费API集合，包含25个API。
triggers:
  - "需要Weather数据"
  - "调用WeatherAPI"
---

# Weather API集合

## 概述
收录25个Weather相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### Open-Meteo
```bash
curl -s "https://open-meteo.com/"
```
### Hong Kong Obervatory
```bash
curl -s "https://www.hko.gov.hk/en/abouthko/opendata_intro.htm"
```
### MetaWeather
```bash
curl -s "https://www.metaweather.com/api/"
```
### AviationWeather
```bash
curl -s "https://www.aviationweather.gov/dataserver"
```
### openSenseMap
```bash
curl -s "https://api.opensensemap.org/"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| Open-Meteo | No | Yes | Yes | 全球天气预报 |
| WeatherAPI | apiKey | Yes | Yes | 天气天文地理 |
| Visual Crossing | apiKey | Yes | Yes | 历史预报天气 |
| Tomorrow | apiKey | Yes | Unknown | 天气API |
| OpenWeatherMap | apiKey | Yes | Unknown | 天气 |
| Weatherbit | apiKey | Yes | Unknown | 天气 |
| AccuWeather | apiKey | No | Unknown | 天气预报 |
| Foreca | OAuth | Yes | Unknown | 天气 |
| Storm Glass | apiKey | Yes | Yes | 海洋天气 |
| AQICN | apiKey | Yes | Unknown | 空气质量指数 |
| ColorfulClouds | apiKey | Yes | Yes | 天气 |
| QWeather | apiKey | Yes | Yes | 位置天气 |
| Yandex.Weather | apiKey | Yes | No | 雅科什天气 |
| Aemet | apiKey | Yes | Unknown | 西班牙天气 |
| HG Weather | apiKey | Yes | Yes | 巴西天气 |
| Hong Kong Obervatory | No | Yes | Unknown | 香港天文台 |
| MetaWeather | No | Yes | No | 天气 |
| Meteorologisk Institutt | User-Agent | Yes | Unknown | 挪威天气气候 |
| 7Timer! | No | No | Unknown | 天文天气 |
| AviationWeather | No | Yes | Unknown | NOAA航空气象 |
| openSenseMap | No | Yes | Yes | 个人气象站 |
| OpenUV | apiKey | Yes | Unknown | 紫外线指数 |
| RainViewer | No | Yes | Unknown | 雷达数据 |
| US Weather | No | Yes | Yes | 美国国家气象服务 |
| weather-api | No | Yes | No | 简单天气API |
