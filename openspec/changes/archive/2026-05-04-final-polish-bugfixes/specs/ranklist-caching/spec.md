## ADDED Requirements

### Requirement: 排行榜数据缓存
系统 SHALL 在内存中缓存排行榜数据，避免每次进入排行榜页面都发起云端请求。

#### Scenario: 缓存命中
- **WHEN** 用户进入排行榜页面且缓存未过期（TTL ≤ 60 秒）
- **THEN** 系统 SHALL 直接使用缓存数据，不发起云端请求

#### Scenario: 缓存过期
- **WHEN** 用户进入排行榜页面且缓存已过期（TTL > 60 秒）
- **THEN** 系统 SHALL 发起云端请求获取最新数据并更新缓存

#### Scenario: 首次加载
- **WHEN** 用户首次进入排行榜页面（无缓存）
- **THEN** 系统 SHALL 发起云端请求获取数据并写入缓存

### Requirement: 缓存强制刷新
系统 SHALL 支持绕过缓存强制获取最新数据。

#### Scenario: 手动刷新
- **WHEN** 用户触发刷新操作
- **THEN** 系统 SHALL 忽略缓存，直接发起云端请求并更新缓存
