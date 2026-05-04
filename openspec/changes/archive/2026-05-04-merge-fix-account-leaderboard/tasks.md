## 1. 合并动画回滚

- [x] 1.1 回滚 `game-scene.js` 中的 `mergeTargets`/`_isMergeAnimating` 相关代码：删除 constructor 中这两个属性、handleSwipe 中的赋值、render 中的跳过绘制逻辑、_onMoveAnimationComplete 中的清空逻辑
- [x] 1.2 验证回滚后合并动画恢复原始效果（滑动+脉冲+闪光均正常显示）

## 2. 账号绑定改为"我的"页面登录

- [x] 2.1 回滚 `js/main.js` 中的 `checkAccountBinding()` 函数及其调用
- [x] 2.2 回滚 `js/scenes/game-scene.js` 中的账号绑定弹窗 UI（`showBindDialog`/`onBindAgree`/`onBindSkip` 属性及 handleTap/render 中的弹窗逻辑）
- [x] 2.3 修改 `js/scenes/profile-scene.js`：在"我的"页面标题下方新增"登录"按钮，未登录时显示"登录"，已登录时显示"已登录"
- [x] 2.4 实现登录按钮点击逻辑：调用 `wx.getUserProfile({desc: '用于排行榜昵称显示'})`，成功则存昵称到本地缓存+云端 `users` 集合，失败则使用"匿名用户"
- [x] 2.5 在"我的"页面底部添加小字说明："未登录用户的分数不会计入排行榜"
- [x] 2.6 修改 `js/cloud.js` 的 `uploadScore()`：未登录（昵称为空或"匿名用户"）时跳过上传
- [x] 2.7 在 `js/scenes/profile-scene.js` 的 `enter()` 中检查登录状态，刷新按钮显示

## 3. 排行榜 100 名限制

- [x] 3.1 改造 `js/cloud.js` 的 `uploadScore()` 函数：始终上传（非仅高分时），上传前查询第 100 名分数判断是否可入榜
- [x] 3.2 在 `uploadScore()` 中实现同一用户旧记录删除逻辑（上传成功后删除旧记录）
- [x] 3.3 在 `uploadScore()` 中实现排名 > 100 的记录清理（上传后触发）
- [x] 3.4 在 `uploadScore()` 中携带 `nickname` 字段（从本地缓存读取）
- [x] 3.5 修改 `js/scenes/overlay-scene.js` 的 `enter()` 方法，确保每局结束都调用 `uploadScore()`

## 4. 排行榜昵称显示

- [x] 4.1 确认 `js/renderer.js` 的 `drawCloudRankItem()` 已支持 `record.nickname` 字段显示（当前已有 `record.nickname || '匿名玩家'`）
- [x] 4.2 修改 `js/scenes/ranklist-scene.js` 的 `fetchRankList()` 调用，limit 改为 100

## 5. 排行榜滚动修复

- [x] 5.1 修改 `js/scenes/ranklist-scene.js`：将表头（排名/昵称/分数/方块）固定在列表区域顶部，不随列表滚动
- [x] 5.2 修改滚动裁剪区域：裁剪起点从表头下方开始，仅列表项参与滚动
- [x] 5.3 修复平滑滚动问题：小幅度滑动不应跳转到下一页，调整滚动灵敏度或阈值

## 6. 集成测试

- [x] 6.1 测试合并动画：回滚后滑动 [2,2,2,2]、[2,2,2] 等场景，确认动画效果正常
- [x] 6.2 测试登录流程："我的"页面点击"登录" → 授权 → 显示"已登录"
- [x] 6.3 测试未登录状态：分数不计入排行榜
- [x] 6.4 测试排行榜固定表头：滑动列表时表头保持不动
- [x] 6.5 测试排行榜平滑滚动：小幅滑动应平滑移动，不跳页
