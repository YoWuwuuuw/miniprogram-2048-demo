## Why

当前 2048 小游戏存在四个需要解决的问题：(1) 之前的合并动画修复（隐藏静止方块）导致移动和合并效果基本不可见，需要回滚并保留原始动画效果；(2) 游戏需要微信账号系统，但不应在启动时强制登录，而是在"我的"页面提供登录入口，未登录用户的分数不计入排行榜；(3) 排行榜需要限制为最多 100 名；(4) 排行榜表头随列表一起滚动被覆盖，且小幅度滑动会跳页，需要修复。

## What Changes

- 回滚合并动画修复：删除 `mergeTargets`/`_isMergeAnimating` 相关代码，恢复原始动画效果
- 改造账号绑定方式：从启动时强制弹窗改为"我的"页面"登录"按钮，已登录显示"已登录"
- 未登录用户分数不计入排行榜：`uploadScore()` 中检查登录状态
- "我的"页面底部小字说明未登录用户的排行榜限制
- 排行榜固定表头：表头不随列表滚动，仅列表项区域可滚动
- 排行榜平滑滚动：修复小幅度滑动跳页问题

## Capabilities

### New Capabilities
- `wechat-auth`: 微信账号绑定与昵称获取（改为"我的"页面登录按钮方式）
- `leaderboard-limit`: 排行榜 100 名限制，包括上传时排名判断、旧记录清理、排名替换逻辑

### Modified Capabilities
- `animation-enhancement`: 回滚合并动画修复，恢复原始动画效果
- `ranklist-caching`: 排行榜数据结构调整 + 固定表头 + 平滑滚动修复

## Impact

- `js/scenes/game-scene.js`: 回滚 mergeTargets 相关代码，删除账号绑定弹窗
- `js/main.js`: 删除 checkAccountBinding() 函数及调用
- `js/scenes/profile-scene.js`: 新增登录按钮、已登录状态显示、底部说明文字
- `js/cloud.js`: uploadScore() 增加登录状态检查
- `js/scenes/ranklist-scene.js`: 固定表头 + 平滑滚动修复
- `js/renderer.js`: 可能需要新增表头绘制方法
