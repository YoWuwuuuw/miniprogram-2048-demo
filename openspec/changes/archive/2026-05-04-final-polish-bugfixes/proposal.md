## Why

游戏基本功能已完整，但在最后测试阶段发现若干体验问题和潜在风险：页面头部被组件遮挡、方块滑动动画偶现异常、排行榜缺乏请求管控、部分边界条件未做防护。这些问题虽不影响核心玩法，但会影响用户体验和稳定性，需要在发布前统一修复。

## What Changes

- **Profile 页面头部下移**：调整"我的"标题 Y 坐标，避免被状态栏或系统组件遮挡
- **方块移动动画逻辑修复**：排查 `handleSwipe` 中源方块匹配逻辑，修复偶发的"直接合并无滑动"问题——根因是旧方块到新方块的映射在特定边界情况下匹配失败，导致跳过移动动画直接定位到目标位置
- **排行榜请求缓存与节流**：在 `fetchRankList` 层加入内存缓存 + TTL 机制，避免每次进入排行榜页面都发起云端请求，同时保证一定时间窗口内的数据实时性
- **边界条件防护**：检查 `game-core.js`、`storage.js`、`cloud.js` 等模块中的空值、异常输入、网络失败等情况，添加必要的防御性处理

## Capabilities

### New Capabilities
- `ranklist-caching`: 排行榜数据缓存与请求节流机制

### Modified Capabilities
- `animation-enhancement`: 修复方块移动动画在边界情况下的映射错误

## Impact

- `js/scenes/profile-scene.js`：标题 Y 坐标计算
- `js/scenes/game-scene.js`：`handleSwipe` 中的旧方块→新方块匹配逻辑
- `js/cloud.js`：`fetchRankList` 增加缓存层
- `js/game-core.js`：边界输入校验
- `js/storage.js`：存储读写异常防护
- `js/scenes/ranklist-scene.js`：使用缓存接口
