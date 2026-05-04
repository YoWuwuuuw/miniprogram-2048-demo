## Why

排行榜和"我的"页面的列表样式过于简陋，排名前三没有醒目的视觉区分，表单之间风格不统一，且标题"排行榜"与表头"分数"存在轻微重叠。需要对这两个页面的列表 UI 进行美化和统一。

## What Changes

- 排行榜标题位置上移，避免与表头重叠
- 排行榜 Top 3 使用醒目鲜艳的渐变背景色（金/银/铜），与其他排名形成强烈对比
- 排行榜列表项增加圆角卡片样式、行间距、阴影等视觉层次
- "我的"页面列表项统一为与排行榜相同的卡片风格（圆角、行间距、交替色）
- 两个页面的列表均支持滚动渲染（已有滚动逻辑，需确保平滑）
- 为云端排行榜补充测试数据（若数据不足）

## Capabilities

### New Capabilities
- `list-item-style`: 统一排行榜和"我的"页面的列表项卡片样式，包括圆角、阴影、行间距、Top 3 特殊高亮

### Modified Capabilities

## Impact

- `js/renderer.js` — 修改 `drawCloudRankItem` 和 `drawRankItem` 方法
- `js/scenes/ranklist-scene.js` — 调整标题 Y 坐标、表头布局
- `js/scenes/profile-scene.js` — 统一列表项样式
- `js/cloud.js` — 可能补充测试数据
