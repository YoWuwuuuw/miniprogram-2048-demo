## MODIFIED Requirements

### Requirement: 排行榜数据缓存
系统 SHALL 在内存中缓存排行榜数据，避免每次进入排行榜页面都发起云端请求。排行榜数据 SHALL 包含 `nickname` 字段用于显示玩家昵称。

#### Scenario: 缓存命中
- **WHEN** 用户进入排行榜页面且缓存未过期（TTL ≤ 60 秒）
- **THEN** 系统 SHALL 直接使用缓存数据，不发起云端请求

#### Scenario: 缓存过期
- **WHEN** 用户进入排行榜页面且缓存已过期（TTL > 60 秒）
- **THEN** 系统 SHALL 发起云端请求获取最新数据并更新缓存

#### Scenario: 首次加载
- **WHEN** 用户首次进入排行榜页面（无缓存）
- **THEN** 系统 SHALL 发起云端请求获取数据并写入缓存

#### Scenario: 昵称字段显示
- **WHEN** 排行榜列表渲染每条记录时
- **THEN** 系统 SHALL 优先使用 `record.nickname` 字段显示昵称，若字段不存在则显示"匿名玩家"

### Requirement: 缓存强制刷新
系统 SHALL 支持绕过缓存强制获取最新数据。

#### Scenario: 手动刷新
- **WHEN** 用户触发刷新操作
- **THEN** 系统 SHALL 忽略缓存，直接发起云端请求并更新缓存

### Requirement: 排行榜固定表头
系统 SHALL 将排行榜表头（排名/昵称/分数/方块）固定在列表区域顶部，不随列表滚动。

#### Scenario: 滑动时表头固定
- **WHEN** 用户上下滑动排行榜列表
- **THEN** 表头 SHALL 保持在固定位置，不随列表项移动

#### Scenario: 列表项独立滚动
- **WHEN** 用户滑动排行榜
- **THEN** 仅列表项区域参与滚动，表头始终可见

### Requirement: 排行榜平滑滚动
系统 SHALL 提供平滑的滚动体验，小幅度滑动不应跳页。

#### Scenario: 小幅度滑动
- **WHEN** 用户进行小幅度触摸滑动
- **THEN** 列表 SHALL 平滑移动对应距离，不跳转到下一页

#### Scenario: 惯性滚动
- **WHEN** 用户快速滑动后松手
- **THEN** 列表 SHALL 按惯性继续滚动并逐渐减速停止
