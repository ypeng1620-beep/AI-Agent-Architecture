---
name: public-apis-transportation
description: Transportation相关免费API集合，包含21个API。
triggers:
  - "需要Transportation数据"
  - "调用TransportationAPI"
---

# Transportation API集合

## 概述
收录21个Transportation相关免费API。

## 认证说明
- **无需认证**: 可直接调用
- **API Key**: 需要申请
- **OAuth**: 需要认证

## 常用API
### ADS-B Exchange
```bash
curl -s "https://www.adsbexchange.com/data/"
```
### Transport for Switzerland
```bash
curl -s "https://transport.opendata.ch/"
```
### Transport for Belgium
```bash
curl -s "https://docs.irail.be/"
```
### City Bikes
```bash
curl -s "https://api.citybik.es/v2/"
```
### Velib metropolis Paris
```bash
curl -s "https://www.velib-metropole.fr/donnees-open-data-gbfs-du-service-velib-metropole"
```

## 完整API列表

| 名称 | 认证 | HTTPS | CORS | 描述 |
|------|------|-------|------|------|
| ADS-B Exchange | No | Yes | Unknown | 实时飞机数据 |
| Navitia | apiKey | Yes | Unknown | 交通数据 |
| Open Charge Map | apiKey | Yes | Yes | 充电站位置 |
| Transport for Switzerland | No | Yes | Unknown | 瑞士公共交通 |
| Transport for Belgium | No | Yes | Yes | 比利时公共交通 |
| City Bikes | No | Yes | Unknown | 全球城市自行车 |
| Velib metropolis Paris | No | Yes | No | 巴黎Velib |
| OpenSky Network | No | Yes | Unknown | ADS-B航空数据 |
| AviationAPI | No | Yes | No | FAA图表出版物 |
| airportsapi | No | Yes | Unknown | 按ICAO的机场信息 |
| Amadeus | OAuth | Yes | Unknown | 旅行搜索 |
| BlaBlaCar | apiKey | Yes | Unknown | 拼车行程 |
| Boston MBTA | apiKey | Yes | Unknown | MBTA交通 |
| GraphHopper | apiKey | Yes | Unknown | A到B路线 |
| TransitLand | No | Yes | Unknown | 交通聚合 |
| Transport for London | apiKey | Yes | Unknown | TfL API |
| Transport for Netherlands | No | Yes | Unknown | OVAPI荷兰 |
| Transport API | apiKey | Yes | Unknown | 英国交通 |
| Tripadvisor | apiKey | Yes | Unknown | 酒店餐厅评级 |
| Uber | OAuth | Yes | Yes | 乘车请求价格估算 |
| OpenStreetMap | OAuth | No | Unknown | 导航地理定位 |
