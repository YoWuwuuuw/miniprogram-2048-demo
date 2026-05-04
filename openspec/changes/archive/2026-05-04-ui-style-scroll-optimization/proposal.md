## Why

排行榜和"我的"两个列表页面的 UI 样式需要优化：排行榜表头被标题遮挡，"我的"页面数据卡片偏小导致页面空旷。同时列表滚动体验差——没有惯性滑动，也没有边界拉扯效果，手感生硬。

## What Changes

- 排行榜表头下移，避免被标题遮挡
- "我的"页面数据卡片和列表项尺寸增大，填充空白区域
- 列表滚动增加惯性（手指离开后继续滑动并逐渐减速）
- 列表滚动增加边界拉扯/弹性效果（超出边界时有回弹反馈）

## Capabilities

### New Capabilities
- `elastic-scroll`: 列表惯性滚动 + 边界弹性效果，替代当前的同步拖拽滚动

### Modified Capabilities
- `list-item-style`: 排行榜表头间距调整、"我的"页面数据卡片和列表项尺寸增大

## Impact

- `js/input.js`: 需要新增速度追踪和惯性/弹性滚动支持
- `js/scenes/ranklist-scene.js`: 表头位置调整、滚动逻辑改造
- `js/scenes/profile-scene.js`: 数据卡片和列表项尺寸调整、滚动逻辑改造
- `js/renderer.js`: `drawRankItem`、`drawCloudRankItem`、`drawUserStats` 可能需要适配新尺寸
