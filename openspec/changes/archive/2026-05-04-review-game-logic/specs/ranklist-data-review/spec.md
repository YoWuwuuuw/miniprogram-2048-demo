## ADDED Requirements

### Requirement: 排行榜数据记录
游戏 SHALL 正确记录每次游戏的结果到排行榜，包括分数、最大方块、移动次数、游戏时间。

#### Scenario: 游戏结束记录
- **WHEN** 游戏结束（无法移动）
- **THEN** 游戏结果 SHALL 保存到排行榜，包括分数、最大方块、移动次数、时间戳

### Requirement: 排行榜显示
游戏 SHALL 显示最近10次游戏记录，按分数从高到低排序。

#### Scenario: 排行榜列表
- **WHEN** 玩家查看排行榜
- **THEN** 显示最近10次游戏记录，按分数降序排列

### Requirement: 历史最高分
游戏 SHALL 正确记录和显示历史最高分。

#### Scenario: 更新最高分
- **WHEN** 当前游戏分数超过历史最高分
- **THEN** 历史最高分更新为当前分数

#### Scenario: 显示最高分
- **WHEN** 游戏界面加载
- **THEN** 显示历史最高分

### Requirement: 游戏统计数据
游戏 SHALL 正确维护游戏统计数据，包括总游戏次数、总分、平均分、最高分、总移动次数。

#### Scenario: 统计更新
- **WHEN** 游戏结束
- **THEN** 统计数据更新：总游戏次数+1，总分增加，平均分重新计算

### Requirement: 数据持久化
游戏 SHALL 使用wx.setStorageSync正确保存和读取游戏数据。

#### Scenario: 自动保存
- **WHEN** 每次移动后
- **THEN** 当前游戏状态自动保存到本地存储

#### Scenario: 恢复游戏
- **WHEN** 游戏重新启动
- **THEN** 恢复之前保存的游戏状态（如果存在）

### Requirement: 排行榜UI适配
排行榜界面 SHALL 在不同屏幕尺寸上正确显示，避免内容溢出。

#### Scenario: 短屏幕适配
- **WHEN** 在短屏幕设备上查看排行榜
- **THEN** 列表内容不与返回按钮重叠，可滚动查看
