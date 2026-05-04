# 实现任务清单

## Task 1: 远距离方块合并动画优化（已完成）

- [x] `createMoveAnimation` 动态时长

## Task 2: 按钮布局调整（已完成）

- [x] `createLayout` 3 按钮布局

## Task 3: 新增设置按钮（已完成）

- [x] `game-scene.js` 设置按钮

## Task 4: 弹窗样式美化（已完成）

- [x] `drawDialog` 暖白底色/阴影/圆角/描边次按钮

## Task 5: 弹窗淡入动画（已完成）

- [x] `createFadeInAnimation` + `overlay-scene.js`

## Task 6: 修复排行榜 UI bug

**文件**: `renderer.js`

- [x] `drawRankItem` 分数字体改为 `bold 16px Arial`（原 24px）
- [x] `drawUserStats` 卡片宽度增大（使用 boardWidth / 3 - gap），padding 增加
- [x] 确保中文标签（"总局数"/"最高分"/"总步数"）完整显示

**文件**: `ranklist-scene.js`

- [x] 标题 y 坐标改为 `screenHeight * 0.10`
- [x] 表头列宽与 `drawRankItem` 一致

## Task 7: 按钮改为 2x2 网格

**文件**: `constants.js`

- [x] `buttonWidth = boardWidth * 0.42`
- [x] `buttonGap = boardWidth * 0.04`
- [x] 新增 `buttonY2 = buttonY + buttonHeight + buttonGap`

**文件**: `game-scene.js`

- [x] 新增 `myBtn`（"我的"）按钮，位于第二行左侧
- [x] `settingsBtn` 移到第二行右侧
- [x] `newGameBtn` 和 `rankBtn` 保持第一行
- [x] `handleTap` 增加"我的"点击 → pushScene('profile')
- [x] `render` 绘制 4 个按钮

## Task 8: 微信云开发接入

**文件**: `game.json`

- [x] 新增 `"cloud": true`

**文件**: `js/cloud.js`（新增）

- [x] `initCloud()` 初始化 wx.cloud（env 配置）
- [x] `uploadScore(score, maxTile, moveCount)` — 调用云函数上传分数
- [x] `fetchRankList(limit)` — 查询 Top 分数（按 score 降序）
- [x] `fetchMyRank()` — 查询当前用户排名

**文件**: `main.js`

- [x] 导入并调用 `initCloud()`
- [x] 注册 `profile` 场景

## Task 9: 云端排行榜页面

**文件**: `ranklist-scene.js`

- [x] `enter()` 调用 `fetchRankList(50)` 获取数据
- [x] 渲染排名列表（排名/昵称/分数/最大方块）
- [x] 支持触摸滑动（复用已有滚动逻辑）
- [x] 加载中状态显示
- [x] 空数据提示

**文件**: `renderer.js`

- [x] 新增 `drawCloudRankItem(y, rank, record)` — 显示排名/昵称/分数/方块

## Task 10: 游戏结束上传分数

**文件**: `overlay-scene.js`

- [x] `enter()` 中调用 `uploadScore(score, maxTile, moveCount)`

## Task 11: 个人数据页面

**文件**: `js/scenes/profile-scene.js`（新增）

- [x] 标题 "我的"，安全区域 y 坐标
- [x] 统计卡片（总局数/最高分/总步数）
- [x] 历史游玩记录列表（时间/分数/步数），可滑动
- [x] 返回按钮
- [x] 注册到 `main.js` 的 SceneManager

## 验证清单

- [x] 排行榜标题不被灵动岛遮挡
- [x] 用户数据卡片中文完整显示
- [x] 列表分数字体正常（16px），不重叠
- [x] 4 个按钮排列整齐
- [x] 云端排行榜加载并显示数据
- [x] 游戏结束自动上传分数
- [x] "我的"页面显示本地统计和历史
- [x] 排行榜和"我的"页面可滑动
